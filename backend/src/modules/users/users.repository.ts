import type { CreateUserRepositoryDTO, UpdateUserRepositoryDTO, User } from "./users.types";

const usersMemoryDb: User[] = [
  {
    id_usuario: "1",
    nombre: "Juan",
    apellido_paterno: "Lopez",
    apellido_materno: "Beltran",
    email: "juanBeltran@gmail.com",
    password: 'hola123*"jj',
    id_rol: "rol-admin-id",
    id_area: null,
    estado: "Activo",
    created_at: new Date(),
  },
];

export class UserRepository {
  async findAll(): Promise<User[]> {
    return usersMemoryDb;
  }

  // Busca utilizando el correo

  async findByEmail(email: string): Promise<User | null> {
    const user = usersMemoryDb.find(user => user.email === email);
    return user ?? null;
  }
  async findById(id_usuario: string): Promise<User | null> {
    const user = usersMemoryDb.find(user => user.id_usuario === id_usuario);

    return user ?? null;
  }

  async create(data: CreateUserRepositoryDTO, passwordHash: string): Promise<User> {
    const newUser: User = {
      id_usuario: Date.now().toString(),
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno,
      email: data.email,
      password: passwordHash,
      id_rol: data.id_rol,
      id_area: data.id_area,
      estado: "Activo",
      created_at: new Date(),
    };

    // findByEmail esta buscando al usuario utilizando el email

    usersMemoryDb.push(newUser);

    return newUser;
  }

  async update(id_usuario: string, data: UpdateUserRepositoryDTO): Promise<User | null> {
    const index = usersMemoryDb.findIndex(user => user.id_usuario === id_usuario);

    if (index === -1) return null;

    const existingUser = usersMemoryDb[index];

    if (!existingUser) return null;

    const updatedUser: User = {
      ...existingUser,
      ...data,
    };

    usersMemoryDb[index] = updatedUser;

    return updatedUser;
  }

  async softDelete(id_usuario: string): Promise<User | null> {
    const index = usersMemoryDb.findIndex(user => user.id_usuario === id_usuario); // Busqueda por ID

    if (index === -1) return null;

    const existingUser = usersMemoryDb[index];

    if (!existingUser) return null; // Comprobacion de existencia

    const updatedUser: User = {
      ...existingUser,
      estado: "Baja",
    }; // Sustitucion de elemento

    usersMemoryDb[index] = updatedUser;

    return updatedUser;
  }
}
