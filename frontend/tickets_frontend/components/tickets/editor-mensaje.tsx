"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contarImagenes, errorImagen, LIMITE_IMAGENES } from "@/lib/adjuntos";
import { ApiError } from "@/lib/api";
import { adjuntosService } from "@/services/adjuntos.service";
import { authService } from "@/services/auth.service";

const ESTADO_INICIAL = {
  negrita: false,
  cursiva: false,
  tachado: false,
  titulo2: false,
  titulo3: false,
  lista: false,
  listaNumerada: false,
  cita: false,
  codigo: false,
  enlace: false,
  caracteres: 0,
};

interface EditorMensajeProps {
  ticketId: string;
  onChange: (html: string, vacio: boolean) => void;
}

export function EditorMensaje({ ticketId, onChange }: EditorMensajeProps) {
  const router = useRouter();
  const solicitarRef = useRef<(archivos: File[]) => void>(() => undefined);

  const [pendiente, setPendiente] = useState<File | null>(null);
  const [cola, setCola] = useState<File[]>([]);
  const [textoAlt, setTextoAlt] = useState("");
  const [subiendo, setSubiendo] = useState(false);
  const [enlaceAbierto, setEnlaceAbierto] = useState(false);
  const [urlEnlace, setUrlEnlace] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: "Escribe una respuesta..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "contenido-ticket min-h-32 px-3 py-2 text-sm focus:outline-none [&_p.is-editor-empty:first-child::before]:text-muted-foreground [&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_p.is-editor-empty:first-child::before]:float-left [&_p.is-editor-empty:first-child::before]:h-0 [&_p.is-editor-empty:first-child::before]:pointer-events-none",
        "aria-label": "Mensaje",
        role: "textbox",
        "aria-multiline": "true",
      },
      handlePaste: (_vista, evento) => {
        const imagenes = Array.from(evento.clipboardData?.files ?? []).filter(archivo =>
          archivo.type.startsWith("image/")
        );

        if (imagenes.length === 0) return false;

        solicitarRef.current(imagenes);
        return true;
      },
      handleDrop: (_vista, evento, _slice, movido) => {
        if (movido) return false;

        const imagenes = Array.from(evento.dataTransfer?.files ?? []).filter(archivo =>
          archivo.type.startsWith("image/")
        );

        if (imagenes.length === 0) return false;

        evento.preventDefault();
        solicitarRef.current(imagenes);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML(), editor.isEmpty),
  });

  const estado =
    useEditorState({
      editor,
      selector: ({ editor }) => {
        if (!editor || !editor.isInitialized || editor.isDestroyed) {
          return ESTADO_INICIAL;
        }

        return {
          negrita: editor.isActive("bold"),
          cursiva: editor.isActive("italic"),
          tachado: editor.isActive("strike"),
          titulo2: editor.isActive("heading", { level: 2 }),
          titulo3: editor.isActive("heading", { level: 3 }),
          lista: editor.isActive("bulletList"),
          listaNumerada: editor.isActive("orderedList"),
          cita: editor.isActive("blockquote"),
          codigo: editor.isActive("code"),
          enlace: editor.isActive("link"),
          caracteres: editor.getText().length,
        };
      },
    }) ?? ESTADO_INICIAL;

  const pasarAlSiguiente = () => {
    const [siguiente, ...resto] = cola;

    setPendiente(siguiente ?? null);
    setTextoAlt(siguiente?.name ?? "");
    setCola(resto);
  };

  const solicitarImagenes = (archivos: File[]) => {
    const validas = archivos.filter(archivo => {
      const error = errorImagen(archivo);

      if (error) toast.error(error);

      return error === null;
    });

    const ocupadas =
      (editor ? contarImagenes(editor.getHTML()) : 0) + cola.length + (pendiente ? 1 : 0);
    const disponibles = Math.max(LIMITE_IMAGENES - ocupadas, 0);

    if (validas.length > disponibles) {
      toast.error(`Puedes insertar hasta ${LIMITE_IMAGENES} imágenes por mensaje`);
    }

    const aceptadas = validas.slice(0, disponibles);

    if (aceptadas.length === 0) return;

    if (pendiente) {
      setCola(actuales => [...actuales, ...aceptadas]);
      return;
    }

    const [primera, ...resto] = aceptadas;

    setPendiente(primera ?? null);
    setTextoAlt(primera?.name ?? "");
    setCola(resto);
  };

  useEffect(() => {
    solicitarRef.current = solicitarImagenes;
  });

  const confirmarImagen = async () => {
    if (!pendiente || !editor) return;

    if (contarImagenes(editor.getHTML()) >= LIMITE_IMAGENES) {
      toast.error(`Puedes insertar hasta ${LIMITE_IMAGENES} imágenes por mensaje`);
      pasarAlSiguiente();
      return;
    }

    setSubiendo(true);

    try {
      const adjunto = await adjuntosService.subir(ticketId, pendiente);

      editor
        .chain()
        .focus()
        .setImage({ src: `/api/adjuntos/${adjunto.id}`, alt: textoAlt.trim() || pendiente.name })
        .run();

      pasarAlSiguiente();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        authService.logout();
        router.replace("/login?motivo=expirada");
        return;
      }

      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen");
    } finally {
      setSubiendo(false);
    }
  };

  const abrirSelector = () => {
    const entrada = document.getElementById("archivo-adjunto");

    if (entrada instanceof HTMLInputElement) entrada.click();
  };

  const handleArchivo = (evento: ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(evento.target.files ?? []);

    if (archivos.length > 0) solicitarImagenes(archivos);

    evento.target.value = "";
  };

  const aplicarEnlace = () => {
    if (!editor) return;

    const url = urlEnlace.trim();

    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }

    setEnlaceAbierto(false);
    setUrlEnlace("");
  };

  if (!editor) return null;

  const accion = (activa: boolean, etiqueta: string, onClick: () => void, Icono: typeof Bold) => (
    <Button
      type="button"
      size="icon-sm"
      variant={activa ? "secondary" : "ghost"}
      aria-label={etiqueta}
      aria-pressed={activa}
      title={etiqueta}
      onClick={onClick}
    >
      <Icono aria-hidden />
    </Button>
  );

  return (
    <div className="rounded-lg border">
      <div role="toolbar" aria-label="Formato del mensaje" className="border-b px-1.5 py-1.5">
        <div className="flex flex-wrap items-center gap-0.5">
          {accion(estado.negrita, "Negrita", () => editor.chain().focus().toggleBold().run(), Bold)}
          {accion(
            estado.cursiva,
            "Cursiva",
            () => editor.chain().focus().toggleItalic().run(),
            Italic
          )}
          {accion(
            estado.tachado,
            "Tachado",
            () => editor.chain().focus().toggleStrike().run(),
            Strikethrough
          )}
          <span className="bg-border mx-1 h-5 w-px" aria-hidden />
          {accion(
            estado.titulo2,
            "Título 2",
            () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            Heading2
          )}
          {accion(
            estado.titulo3,
            "Título 3",
            () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            Heading3
          )}
          <span className="bg-border mx-1 h-5 w-px" aria-hidden />
          {accion(
            estado.lista,
            "Lista con viñetas",
            () => editor.chain().focus().toggleBulletList().run(),
            List
          )}
          {accion(
            estado.listaNumerada,
            "Lista numerada",
            () => editor.chain().focus().toggleOrderedList().run(),
            ListOrdered
          )}
          {accion(
            estado.cita,
            "Cita",
            () => editor.chain().focus().toggleBlockquote().run(),
            Quote
          )}
          {accion(estado.codigo, "Código", () => editor.chain().focus().toggleCode().run(), Code)}
          <span className="bg-border mx-1 h-5 w-px" aria-hidden />
          {accion(estado.enlace, "Enlace", () => setEnlaceAbierto(true), Link2)}
          {accion(false, "Adjuntar imagen", abrirSelector, ImagePlus)}
          <span className="bg-border mx-1 h-5 w-px" aria-hidden />
          {accion(false, "Deshacer", () => editor.chain().focus().undo().run(), Undo2)}
          {accion(false, "Rehacer", () => editor.chain().focus().redo().run(), Redo2)}
        </div>
      </div>

      <EditorContent editor={editor} />

      <div className="text-muted-foreground flex items-center justify-between border-t px-3 py-1.5 text-xs">
        <span aria-live="polite">
          {subiendo ? "Subiendo imagen..." : `Máximo ${LIMITE_IMAGENES} imágenes de 5 MB cada una`}
        </span>
        <span>{estado.caracteres} caracteres</span>
      </div>

      <input
        id="archivo-adjunto"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleArchivo}
        aria-label="Seleccionar imagen"
      />

      <Dialog
        open={pendiente !== null}
        onOpenChange={abierto => !abierto && !subiendo && pasarAlSiguiente()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Texto alternativo de la imagen</DialogTitle>
            <DialogDescription>
              Describe la imagen para quienes usan lector de pantalla.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="texto-alt">Descripción</Label>
            <Input
              id="texto-alt"
              value={textoAlt}
              onChange={evento => setTextoAlt(evento.target.value)}
              maxLength={150}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={pasarAlSiguiente} disabled={subiendo}>
              Cancelar
            </Button>
            <Button onClick={confirmarImagen} disabled={subiendo || !textoAlt.trim()}>
              {subiendo ? "Subiendo..." : "Insertar imagen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={enlaceAbierto} onOpenChange={setEnlaceAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insertar enlace</DialogTitle>
            <DialogDescription>Deja el campo vacío para quitar el enlace.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Label htmlFor="url-enlace">URL</Label>
            <Input
              id="url-enlace"
              value={urlEnlace}
              onChange={evento => setUrlEnlace(evento.target.value)}
              placeholder="https://ejemplo.com"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEnlaceAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={aplicarEnlace}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
