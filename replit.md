# MoneyWise

A full-featured personal finance management app built with Expo (React Native), targeting Android devices.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo dev server
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Expo SDK 54, expo-router ~6.0.17 (file-based routing)
- React Native 0.81.5
- AsyncStorage for all local persistence (no backend required)
- Charts: react-native-svg custom SVG components (DonutChart, BarChart)
- Fonts: Inter (400/500/600/700) via @expo-google-fonts/inter
- Icons: @expo/vector-icons (Ionicons)
- Theme: light/dark with user-overridable preference via ThemeContext

## Where things live

- `artifacts/mobile/` — Expo mobile app
  - `app/` — Expo Router screens and layouts
  - `context/` — AuthContext, ThemeContext, FinanceContext (all local/AsyncStorage)
  - `components/` — Shared UI components
  - `constants/colors.ts` — Light + dark theme color tokens
  - `types/index.ts` — TypeScript types and utility functions
- `artifacts/api-server/` — Express API (not used by mobile app currently)

## Features

- **Onboarding** — 3-step carousel for new users
- **Auth** — Local registration/login with AsyncStorage (multi-user support)
- **Dashboard** — Total balance, monthly income/expense, recent transactions, pending Len/Den
- **Transactions** — Add/edit/delete income & expenses, search, filter by type
- **Len/Den** — Track money lent and borrowed with settle/unsettle functionality
- **Reports** — Monthly donut chart (expense breakdown) + 6-month bar chart trend
- **Budgets** — Per-category monthly budget with progress tracking
- **Categories** — Custom categories with icon and color picker
- **Profile** — Edit name/currency, theme switcher (Light/Dark/System), logout

## Architecture decisions

- All data is stored in AsyncStorage under user-scoped keys (`@mw_{userId}_{key}`)
- FinanceContext re-initializes when user ID changes (supports multiple accounts)
- ThemeContext calls `Appearance.setColorScheme()` to sync with native components
- Charts are built with react-native-svg — no external chart library needed
- No UUID package — IDs use `Date.now() + Math.random().toString(36)` pattern

## User preferences

- Target: Android devices primarily
- Currency: user-selectable (10 currencies supported)
- No backend database — all local with AsyncStorage

## Gotchas

- `expo-router/unstable-native-tabs` is used for NativeTabs (iOS 26+ liquid glass)
- Falls back to classic Tabs with BlurView for older iOS/Android
- Date inputs are text-based (YYYY-MM-DD format) — no native date picker
