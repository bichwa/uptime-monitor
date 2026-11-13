# Graph Report - uptime-monitor  (2026-11-13)

## Corpus Check
- Corpus is ~8,359 words - fits in a single context window. You may not need a graph.

## Summary
- 266 nodes · 576 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Monitor Detail UI
- REST API Routes
- Cron Health Checker
- Dev Dependencies Config
- Dashboard Pages
- Component Aliases
- Monitor Form & Edit
- TypeScript Config
- Runtime Dependencies
- App Layout & Fonts
- Next.js Project README
- Status Badge Component
- ESLint Config
- Package Scripts
- PostCSS Config
- Public SVG Icons
- Vercel Cron Config
- NextAuth Handler
- Globe SVG Asset

## God Nodes (most connected - your core abstractions)
1. `cn()` - 46 edges
2. `auth` - 22 edges
3. `MonitorDetailPage()` - 20 edges
4. `next` - 18 edges
5. `MonitorForm()` - 17 edges
6. `Button()` - 17 edges
7. `compilerOptions` - 16 edges
8. `react` - 14 edges
9. `LoginPage()` - 10 edges
10. `Card()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Wordmark Logo SVG` --conceptually_related_to--> `Next.js Framework`  [INFERRED]
  public/next.svg → README.md
- `Vercel Triangle Logo SVG` --conceptually_related_to--> `Vercel Deployment Platform`  [INFERRED]
  public/vercel.svg → README.md
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `CardFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `SelectLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/select.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Next.js / Vercel Branding and UI Assets** — public_next_svg, public_vercel_svg, public_globe_svg, public_file_svg, public_window_svg [INFERRED 0.85]

## Communities (19 total, 5 thin omitted)

### Community 0 - "Monitor Detail UI"
Cohesion: 0.14
Nodes (27): MonitorDetailPage(), ResponseTimeChart(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogPortal() (+19 more)

### Community 1 - "REST API Routes"
Cohesion: 0.12
Nodes (23): GET(), Params, GET(), Params, assertOwnership(), DELETE(), GET(), Params (+15 more)

### Community 2 - "Cron Health Checker"
Cohesion: 0.11
Nodes (23): GET(), getRecipients(), maxDuration, processMonitor(), runtime, Props, buildDailyData(), DayData (+15 more)

### Community 3 - "Dev Dependencies Config"
Cohesion: 0.13
Nodes (20): devDependencies, shadcn@^3.8.5, tailwindcss@^4, @tailwindcss/postcss@^4, tw-animate-css@^1.4.0, @types/node@^20, @types/react@^19, @types/react-dom@^19 (+12 more)

### Community 4 - "Dashboard Pages"
Cohesion: 0.25
Nodes (15): LoginPage(), DashboardPage(), MonitorCard(), Props, StatusBadge(), Button(), buttonVariants, Card() (+7 more)

### Community 5 - "Component Aliases"
Cohesion: 0.10
Nodes (19): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+11 more)

### Community 6 - "Monitor Form & Edit"
Cohesion: 0.20
Nodes (14): EditMonitorPage(), NewMonitorPage(), MonitorForm(), Props, Label(), Select(), SelectContent(), SelectItem() (+6 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (17): dependencies, @auth/supabase-adapter@^1.11.1, clsx@^2.1.1, next@16.1.6, next-auth@^5.0.0-beta.30, react@19.2.3, react-dom@19.2.3, resend@^6.9.3 (+9 more)

### Community 9 - "App Layout & Fonts"
Cohesion: 0.18
Nodes (10): geist, metadata, RootLayout(), Toaster(), lucide-react@^0.577.0, next-themes@^0.4.6, sonner@^2.0.7, lucide-react (+2 more)

### Community 10 - "Next.js Project README"
Cohesion: 0.28
Nodes (9): Next.js Wordmark Logo SVG, Vercel Triangle Logo SVG, app/page.tsx Entry Page, create-next-app Bootstrap Tool, Geist Font Family, next/font Automatic Font Optimization, Next.js Framework, Next.js Uptime Monitor Project (+1 more)

### Community 11 - "Status Badge Component"
Cohesion: 0.32
Nodes (6): config, Status, Badge(), badgeVariants, class-variance-authority@^0.7.1, class-variance-authority

### Community 12 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.1.6, eslint, eslint-config-next

### Community 13 - "Package Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

## Knowledge Gaps
- **8 isolated node(s):** `{ GET, POST }`, `Geist Font Family`, `app/page.tsx Entry Page`, `File Document Icon SVG`, `Globe / World Icon SVG` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 79 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `REST API Routes` to `Monitor Detail UI`, `Cron Health Checker`, `Dev Dependencies Config`, `Dashboard Pages`, `Monitor Form & Edit`, `Runtime Dependencies`, `App Layout & Fonts`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **What connects `{ GET, POST }`, `Geist Font Family`, `app/page.tsx Entry Page` to the rest of the system?**
  _8 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Monitor Detail UI` be split into smaller, more focused modules?**
  _Cohesion score 0.14264264264264265 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `Monitor Detail UI` to `Status Badge Component`, `Dashboard Pages`, `Monitor Form & Edit`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `REST API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.11596638655462185 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Monitor Detail UI` to `Dev Dependencies Config`, `Dashboard Pages`, `Monitor Form & Edit`, `Runtime Dependencies`, `Status Badge Component`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `Cron Health Checker` be split into smaller, more focused modules?**
  _Cohesion score 0.11083743842364532 - nodes in this community are weakly interconnected._