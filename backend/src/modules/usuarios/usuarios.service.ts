import { randomBytes } from "node:crypto";
import * as argon2 from "argon2";

import { Prisma } from "@/generated/prisma/client";
import {
  AccionAuditoria,
  EntidadAuditoria,
  EstadoUsuario,
  NombreRol,
} from "@/generated/prisma/enums";
import { ApiError } from "@/utils/api-error";
import { exigirAdministrador } from "@/utils/permisos";

import { auditoriaService } from "../auditoria/auditoria.service";
import { RolesRepository } from "../roles/roles.repository";
import { UsuariosRepository } from "./usuarios.repository";
import type { ListarUsuariosQuery } from "./usuarios.schema";
import type {
  ActualizarUsuarioDTO,
  ActualizarUsuarioRepositoryDTO,
  CrearUsuarioDTO,
  CrearUsuarioRepositoryDTO,
  EliminarUsuarioDTO,
  RestablecerContrasenaDTO,
} from "./usuarios.types";

export class UsuariosService {
  constructor(
    private readonly repository: UsuariosRepository = new UsuariosRepository(),
    private readonly rolesRepository: RolesRepository = new RolesRepository()
  ) {}

  private async validarRolAsignable(rol_id: string): Promise<void> {
    const rol = await this.rolesRepository.buscarPorId(rol_id);

    if (!rol) {
      throw new ApiError(400, "El rol especificado no existe en el catálogo de roles");
    }

    if (rol.nombre === NombreRol.Administrador) {
      throw new ApiError(403, "No está permitido asignar el rol de Administrador");
    }
  }

  async crearUsuario({ data, rolSolicitante, idSolicitante }: CrearUsuarioDTO) {
    exigirAdministrador(rolSolicitante);
    await this.validarRolAsignable(data.rol_id);

    const correo = data.correo_electronico.trim().toLowerCase();
    const existente = await this.repository.buscarPorCorreo(correo);

    if (existente) {
      throw new ApiError(409, "El correo electrónico ya se encuentra registrado");
    }

    const contrasenaGenerada = randomBytes(24).toString("base64url");
    const contrasenaHash = await argon2.hash(contrasenaGenerada, {
      type: argon2.argon2id,
    });

    const nuevoUsuario: CrearUsuarioRepositoryDTO = {
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      correo_electronico: correo,
      rol_id: data.rol_id,
    };

    try {
      const usuarioCreado = await this.repository.crear(nuevoUsuario, contrasenaHash);

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.CREAR,
          entidad: EntidadAuditoria.USUARIO,
          entidad_id: usuarioCreado.id,
          detalle: `Correo: ${usuarioCreado.correo_electronico}`,
        });
      }

      return {
        correo_electronico: usuarioCreado.correo_electronico,
        contrasena: contrasenaGenerada,
        user: usuarioCreado,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError(409, "El correo electrónico ya se encuentra registrado");
      }

      throw error;
    }
  }

  async actualizarUsuario({ id, data, rolSolicitante, idSolicitante }: ActualizarUsuarioDTO) {
    exigirAdministrador(rolSolicitante);

    if (id === idSolicitante && data.estado === EstadoUsuario.Baja) {
      throw new ApiError(403, "No puedes darte de baja a ti mismo");
    }

    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    const reactivando =
      existente.estado === EstadoUsuario.Baja && data.estado === EstadoUsuario.Activo;

    if (existente.estado === EstadoUsuario.Baja && !reactivando) {
      throw new ApiError(400, "No se puede modificar un usuario dado de baja");
    }

    if (reactivando) {
      const reactivado = await this.repository.actualizar(id, { estado: EstadoUsuario.Activo });

      if (!reactivado) {
        throw new ApiError(404, "No se ha encontrado el usuario");
      }

      if (idSolicitante) {
        await auditoriaService.registrar({
          usuario_id: idSolicitante,
          accion: AccionAuditoria.REACTIVAR,
          entidad: EntidadAuditoria.USUARIO,
          entidad_id: reactivado.id,
          detalle: `Correo: ${reactivado.correo_electronico}`,
        });
      }

      return reactivado;
    }

    const cambios: ActualizarUsuarioRepositoryDTO = {};

    if (data.nombre !== undefined) cambios.nombre = data.nombre;
    if (data.apellido_paterno !== undefined) cambios.apellido_paterno = data.apellido_paterno;
    if (data.apellido_materno !== undefined) cambios.apellido_materno = data.apellido_materno;
    if (data.estado !== undefined) cambios.estado = data.estado;

    if (data.rol_id !== undefined) {
      await this.validarRolAsignable(data.rol_id);
      cambios.rol_id = data.rol_id;
    }

    const actualizado = await this.repository.actualizar(id, cambios);

    if (!actualizado) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    if (idSolicitante) {
      await auditoriaService.registrar({
        usuario_id: idSolicitante,
        accion: data.estado === EstadoUsuario.Baja ? AccionAuditoria.BAJA : AccionAuditoria.EDITAR,
        entidad: EntidadAuditoria.USUARIO,
        entidad_id: actualizado.id,
        detalle: `Correo: ${actualizado.correo_electronico}`,
      });
    }

    return actualizado;
  }

  async restablecerContrasena({ id, rolSolicitante, idSolicitante }: RestablecerContrasenaDTO) {
    exigirAdministrador(rolSolicitante);

    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    if (existente.estado === EstadoUsuario.Baja) {
      throw new ApiError(400, "No se puede modificar un usuario dado de baja");
    }

    const contrasenaGenerada = randomBytes(24).toString("base64url");
    const contrasenaHash = await argon2.hash(contrasenaGenerada, {
      type: argon2.argon2id,
    });

    await this.repository.actualizarContrasena(id, contrasenaHash);

    if (idSolicitante) {
      await auditoriaService.registrar({
        usuario_id: idSolicitante,
        accion: AccionAuditoria.RESTABLECER_CONTRASENA,
        entidad: EntidadAuditoria.USUARIO,
        entidad_id: existente.id,
        detalle: `Correo: ${existente.correo_electronico}`,
      });
    }

    return {
      correo_electronico: existente.correo_electronico,
      contrasena: contrasenaGenerada,
    };
  }

  async eliminar({ id, rolSolicitante, idSolicitante }: EliminarUsuarioDTO) {
    exigirAdministrador(rolSolicitante);

    if (id === idSolicitante) {
      throw new ApiError(403, "No puedes eliminarte a ti mismo");
    }

    const existente = await this.repository.buscarPorId(id);

    if (!existente) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    const dadoDeBaja = await this.repository.darDeBaja(existente.id);

    if (!dadoDeBaja) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    if (idSolicitante) {
      await auditoriaService.registrar({
        usuario_id: idSolicitante,
        accion: AccionAuditoria.BAJA,
        entidad: EntidadAuditoria.USUARIO,
        entidad_id: dadoDeBaja.id,
        detalle: `Correo: ${dadoDeBaja.correo_electronico}`,
      });
    }

    return dadoDeBaja;
  }

  async listar(rolSolicitante: NombreRol | undefined, filtros: ListarUsuariosQuery) {
    exigirAdministrador(rolSolicitante);

    const condiciones: Prisma.UsuarioWhereInput[] = [];

    if (filtros.buscar) {
      condiciones.push({
        OR: [
          { nombre: { contains: filtros.buscar, mode: "insensitive" } },
          { apellido_paterno: { contains: filtros.buscar, mode: "insensitive" } },
          { apellido_materno: { contains: filtros.buscar, mode: "insensitive" } },
          { correo_electronico: { contains: filtros.buscar, mode: "insensitive" } },
        ],
      });
    }

    if (filtros.estado) condiciones.push({ estado: filtros.estado });
    if (filtros.rol) condiciones.push({ rol: { nombre: filtros.rol } });

    const where: Prisma.UsuarioWhereInput = condiciones.length > 0 ? { AND: condiciones } : {};
    const skip = (filtros.pagina - 1) * filtros.limite;
    const { total, usuarios } = await this.repository.listarPaginado(where, skip, filtros.limite);

    return {
      data: usuarios,
      meta: {
        pagina: filtros.pagina,
        limite: filtros.limite,
        total,
        total_paginas: Math.ceil(total / filtros.limite),
      },
    };
  }

  async obtenerPorId(id: string, rolSolicitante: NombreRol | undefined) {
    exigirAdministrador(rolSolicitante);

    const usuario = await this.repository.buscarPorId(id);

    if (!usuario) {
      throw new ApiError(404, "No se ha encontrado el usuario");
    }

    return usuario;
  }
}
