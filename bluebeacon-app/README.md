# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## BlueBeacon API (civilian portal)

1. Copy [`.env.example`](./.env.example) to `.env.local` and set `VITE_GOOGLE_MAPS_KEY` / Firebase keys as needed.
2. Run the API gateway on port **4000** (default). Vite proxies `/api` and `/socket.io` to `http://localhost:4000` so HTTP-only refresh cookies work in dev.
3. After backend Prisma schema changes (e.g. `fcmToken` on `NotificationPreference`), run `npx prisma db push` from `bluebeacon-backend/packages/db` so the DB matches the schema.
4. E2E: `npm run cy:run` (requires dev server; tests stub API via `cy.intercept`).
