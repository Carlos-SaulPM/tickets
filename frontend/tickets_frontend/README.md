# Frontend

Next.js 16, React 19, Tailwind CSS 4 y shadcn/ui.

Se levanta con el Compose de la raíz: `docker compose up -d --build`. La documentación del proyecto está en el [README raíz](../../README.md).

Para trabajar solo con el frontend, sin Compose:

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test
pnpm lint
pnpm build
```

`NEXT_PUBLIC_API_URL` apunta al API y se inyecta en build. Si cambia, hay que reconstruir la imagen.
