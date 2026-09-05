# IT HEROES

Action RPG isometrico donde los tecnicos de sistemas son los heroes. Combate contra bugs, troyanos y malware a traves de la Sala de Servidores, el Bosque de Cables y La Nube.

## Clases
- **Helpdesk** - Guerrero melee con espada-teclado y escudo-laptop
- **DevOps** - Mago de terminal con hechizos de codigo
- **Blue Team** - Arquera con arco-cable y trampas de firewall

## Stack
- Monorepo npm workspaces (`apps/client`, `packages/shared`)
- React 19 + TypeScript + Vite
- three.js + @react-three/fiber + drei + postprocessing
- Zustand, Tailwind v4, i18next (ES/EN), Howler

## Desarrollo
```bash
npm install
npm run dev
```

## Deploy
- Frontend: Vercel (auto-deploy en push a `main`)
- CI: GitHub Actions (typecheck + build)
