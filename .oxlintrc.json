# InSpiD-TECH

A UI prototype for **InSpiD-TECH**, a requirement-driven adaptive scheduling research
framework for agile software projects. Built for a university final-year research
project proposal presentation.

This is a **front-end prototype only** — there is no real backend, authentication, or
database. All data is realistic mock data, served through a small service/hook layer
so it can later be swapped for real API calls without touching any component code.

## Components

1. **Living Requirements Engine** (NLP + Blockchain) — fully built. Detects requirement
   changes from informal team communication and keeps a live, tamper-proof requirements
   record. Reachable at **Requirements Engine** in the sidebar, with three destinations:
   Requirements (list + signal feed + detail panel), Network Map, and Traceability Ledger.
2. **Gap Detection & Schedule Impact Propagation** (ML) — placeholder / coming-soon page.
3. **Adaptive Schedule Re-Optimization & Visualization** — placeholder / coming-soon page.
4. **Retrospective Intelligence & Accountability Engine** — placeholder / coming-soon page.

The sample data is modeled as a fictional fintech + e-commerce case study, **NovaCart**,
with a companion **NovaPay** wallet — 24 cross-consistent requirements, ~25 communication
signals, and a derived traceability ledger.

## Tech stack

React 18 + Vite · Tailwind CSS (class-based dark mode) · shadcn/ui-style components
(hand-built on Radix primitives) · react-router-dom · Recharts · React Flow · Lucide icons

## Running locally

```bash
npm install
npm run dev
```

Then open the printed local URL (default `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # preview the production build locally
```

## Project structure

```
src/
  assets/         Logo (swap logo.png for your own file — same path)
  components/
    ui/           Base components (button, card, badge, table, tabs, sheet, …)
    layout/       App shell: sidebar, top bar, theme toggle, logo
    dashboard/    Dashboard-only widgets (summary cards, status chart)
    requirements/ Requirements list, signal feed, detail panel, badges
    network/      React Flow node-graph components
    ledger/       Traceability ledger table
    common/       Shared page chrome (page header, coming-soon page)
  context/        ThemeContext (light/dark, persisted to localStorage)
  data/           Mock data (requirements, signals, ledger)
  services/       Data-access layer — swap these for real API calls later
  hooks/          React hooks wrapping the services (loading/error state)
  lib/            Small utilities (cn, date formatting, network layout math)
  pages/          Route-level components
```

To connect a real backend later: rewrite the bodies of the files in `src/services/`
(e.g. replace the mock array + simulated delay with a `fetch` call) — every hook,
page, and component keeps working unchanged.
