# Design Specification

> Premium Best-in-Class Award-Winning Design System
> This file lives alongside `AGENTS.md`. Agents should read it automatically when working on UI, styling, copy, or localization tasks.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Theme System](#2-theme-system)
3. [Theme Tokens](#3-theme-tokens)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Patterns](#6-component-patterns)
7. [Localization Guidelines](#7-localization-guidelines)
8. [Accessibility](#8-accessibility)

---

## 1. Design Philosophy

Astra follows three core design principles that define premium, award-winning design:

| Principle | Description | Implementation |
|---|---|---|
| **Precision** | Design feels engineered and intentional | Strict spacing grid, consistent alignment, predictable rhythm |
| **Clarity** | Information is immediately understandable | Typography-led hierarchy, minimal decoration, purposeful color |
| **Restraint** | Minimalism elevates focus and elegance | Limited color palette, no decorative UI, whitespace as feature |

### Core Design Rules (from `docs/rules/Core Design Rules.md`)

1. **Radical Simplicity** — Remove anything that doesn't support clarity or function
2. **Precision in Spacing** — Follow strict alignment and rhythm
3. **Typography Leads** — Rely on type, spacing, and contrast over decoration
4. **Color as Guidance** — Accent colors highlight primary actions only
5. **White Space is Feature** — Treat whitespace as essential design component
6. **Depth is Subtle** — Use soft shadows, never heavy drop shadows
7. **Motion is Purposeful** — Animation indicates state change, not decoration
8. **Consistency Builds Trust** — Every element behaves predictably
9. **Detail Reflects Craftsmanship** — Attention to micro-spacing and alignment
10. **Restraint Defines Premium** — What you choose NOT to include matters

### Design References (from `docs/references/theme.md`)

#### Light Mode References

| Reference | Key Extract | Use Case |
|---|---|---|
| **Linear** | Soft white (#F5F5F7), 3-4 tone neutrals, subtle shadows | Internal Electron workflow tools |
| **Stripe** | Warm neutrals, controlled accent, premium whitespace | Marketing pages with trust focus |
| **Vercel** | High contrast but not aggressive, space instead of lines | Minimal products |

#### Dark Mode References

| Reference | Key Extract | Use Case |
|---|---|---|
| **Linear + GitHub** | Deep gray (#0e1015), layered surfaces, 4-5 gray tiers | Internal Electron apps |
| **Vercel** | Slight glow only on key elements, controlled contrast | Marketing dark mode |
| **Porsche** | Cinematic dark, charcoal not black, large whitespace | Luxury marketing |

#### Golden Rules

**Light Mode:**
- Avoid pure white as dominant surface
- Use 3-5 neutral steps
- Prefer space over borders
- Text: near-black, not absolute black

**Dark Mode:**
- Avoid pure black (#000000)
- Use layered dark grays
- Keep accent saturation controlled
- Ensure 4-5 text contrast tiers

---

## 2. Theme System

### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  ThemeProvider  │────▶│   ThemeContext   │────▶│  useTheme hook  │
│  (wraps app)    │     │  (darkMode,     │     │  (consumes)     │
│                 │     │   toggle)        │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                                                 │
         ▼                                                 ▼
  ┌──────────────────┐                          ┌─────────────────┐
│  MUI Theme Object  │                          │  ThemeToggle   │
│  (light/dark)    │                          │  (UI component)│
└──────────────────┘                          └─────────────────┘
```

### Implementation (from `src/`)

| Component | Location | Purpose |
|---|---|---|
| `ThemeProvider` | `src/common/theme/ThemeProvider.tsx` | Wraps app, manages theme state |
| `ThemeContext` | `src/common/theme/themeContext.ts` | React context for theme values |
| `useTheme()` | `src/common/theme/themeContext.ts` | Hook to consume theme context |
| `ThemeToggle` | `src/common/theme/ThemeToggle.tsx` | UI button to switch themes |
| Design Tokens | `src/theme/tokens/` | Colors, spacing, typography |

### ThemeProvider Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | `ReactNode` | Yes | — | Application content |
| `lightTheme` | `Theme` | Yes | — | MUI theme for light mode |
| `darkTheme` | `Theme` | Yes | — | MUI theme for dark mode |
| `forceTheme` | `'light' \| 'dark'` | No | — | Override theme (Storybook) |

### State Management

- **Storage**: `darkMode` boolean in `localStorage` under key `darkMode`
- **Persistence**: Theme preference survives sessions
- **Override**: `forceTheme` prop for testing/Storybook

### Why This Architecture

| Approach | Rationale |
|---|---|
| MUI Theming | Mature, accessible, well-tested with CssBaseline |
| CSS Variables | Enables runtime theme switching without JS re-renders |
| React Context | Clean API for consuming theme in any component |
| localStorage | User preference persists across sessions |

---

## 3. Theme Tokens

> All tokens defined in `src/theme/tokens/` — consume via tokens, never hardcode hex values

### Color Palette

#### Brand (from `src/theme/tokens/colors.ts`)

```ts
primary: '#5A60F5'      // Soft indigo
primaryHover: '#5255DF'
secondary: '#8a8f98'   // Neutral secondary
```

#### Background (Light Mode)

```ts
background.light: '#F5F5F7'     // Barely gray
paperLight: '#FFFFFF'            // Elevated surface
```

#### Background (Dark Mode)

```ts
background.dark: '#0e1015'       // Deep gray (NOT #000)
paperDark: '#16181D'             // Slightly lighter
panelDark: '#1E2028'           // Highest elevation
```

#### Text Hierarchy

| Mode | Primary | Secondary |
|---|---|---|
| Light | `#111318` | `#687076` |
| Dark | `#EDEDEF` | `#8A8F98` |

#### Status Colors

```ts
error: '#ED5F74'
warning: '#F5A623'
success: '#34C759'
info: '#5A60F5'
crisis: '#F85149'    // Crisis Protocol Safety Red
```

#### Borders

```ts
border.light: 'rgba(0, 0, 0, 0.08)'
border.dark: 'rgba(255, 255, 255, 0.08)'
```

### Spacing Scale (from `src/theme/tokens/spacing.ts`)

Base unit: **4px**

| Token | Value | Pixels |
|---|---|---|
| `internal` | 0.5 | 4px |
| `xs` | 1 | 8px |
| `sm` | 1.5 | 12px |
| `md` | 2 | 16px |
| `lg` | 3 | 24px |
| `xl` | 4 | 32px |
| `xxl` | 6 | 48px |
| `section` | 8 | 64px |
| `page` | 12 | 96px |

### Surface & Elevation Strategy

Following MUI surface overrides:

| Surface | Light Mode | Dark Mode |
|---|---|---|
| Default BG | `#F5F5F7` | `#0e1015` |
| Paper/Card | `#FFFFFF` | `#16181D` |
| AppBar | `#F5F5F7` | `#0e1015` |
| Navigation | `#FFFFFF` | `#16181D` |

> **Critical**: Dark mode requires `backgroundImage: 'none'` on Paper and AppBar to prevent MUI's elevation overlays

### Interaction States

| State | Light Mode | Dark Mode |
|---|---|---|
| Hover | `filter: brightness(0.95)` | `filter: brightness(1.1)` |
| Active/Pressed | `transform: scale(0.98)` | same |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` | same |

---

## 4. Typography (from `src/theme/tokens/typography.ts`)

### Font Stack

```ts
sans: '"Inter", "Segoe UI", "Helvetica Neue", sans-serif'
mono: '"IBM Plex Mono", "Menlo", "Courier New", monospace'
```

### Typography Variants

| Variant | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `h1` | 2rem | 600 | 1.2 | Page headings |
| `h2` | 1.5rem | 600 | 1.3 | Section headings |
| `h3` | 1.25rem | 600 | 1.4 | Subsection headings |
| `h4` | 1.125rem | 600 | 1.4 | Card titles |
| `h5` | 1rem | 600 | 1.5 | Small headings |
| `h6` | 0.875rem | 600 | 1.5 | Micro labels, uppercase |
| `body1` | 0.9375rem | 400 | 1.5 | Primary body (15px, premium Electron standard) |
| `body2` | 0.8125rem | 400 | 1.5 | Secondary text (13px) |
| `body2Medium` | 0.8125rem | 500 | 1.5 | Emphasized body |
| `button` | 0.875rem | 500 | 1.0 | Buttons (no transform) |
| `caption` | 0.75rem | 500 | 1.4 | Labels (12px) |
| `captionBold` | 0.75rem | 600 | 1.4 | Bold labels |
| `monoBody` | 0.8125rem | 400 | 1.5 | Monospace body |
| `monoCaption` | 0.75rem | 500 | 1.4 | Monospace captions |
| `micro` | 0.625rem | 600 | 1.2 | Uppercase badges (10px) |
| `splashTitle` | 0.875rem | 600 | 1.5 | Display headers with wide tracking |
| `splashSubtitle` | 0.75rem | 500 | 1.4 | Splash subheaders |

### Typography Rules

- Body text: always `body1` (15px) or `body2` (13px). Never smaller than `caption` (12px) in production UI
- Headings: use semantic `<h1>`–`<h6>`, not `<div>` with font styling
- Line length: cap prose at `65ch` for readability
- Letter spacing: `-0.02em` for headings, default `0` for body

---

## 5. Spacing & Layout

### Spacing Scale

| Token | Pixels |
|---|---|
| `space-0` | 0px |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

### Border Radius

```ts
radius-sm:   4px
radius-md:   8px
radius-lg:   12px
radius-xl:   16px
radius-2xl:  24px
radius-full: 9999px
```

### Shadows

```ts
shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
shadow-sm: 0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)
shadow-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)
shadow-lg: 0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05)
shadow-xl: 0 20px 25px rgba(0,0,0,0.10), 0 8px 10px rgba(0,0,0,0.04)
```

### Breakpoints (Mobile-First)

| Name | Min Width | Target |
|---|---|---|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Wide desktops |

- Design **mobile-first**: base styles target `< 640px`
- Content max-width: `1280px` centered
- Page gutters: `space-4` on mobile, `space-8` on `md+`

---

## 6. Component Patterns

### Buttons

| Variant | Background | Text | Border | Use Case |
|---|---|---|---|
| `primary` | `primary` (`#5A60F5`) | white | none | Main CTA |
| `secondary` | transparent | `primary` | `border.light` | Secondary actions |
| `ghost` | transparent | text primary | none | Tertiary / icon |
| `danger` | `error` (`#ED5F74`) | white | none | Destructive |
| `disabled` | `neutral-100` | `neutral-300` | none | Unavailable |

- Height: `36px` (default), `32px` (sm), `44px` (lg)
- Focus ring: `2px` solid with `2px` offset
- Never remove focus outline — replace it

### Form Inputs

- Border: `1px solid var(--border.light)` → focus state
- Error: border and helper text in error color
- Label: always above input, never placeholder-only

### Z-Index Scale

```ts
z-base:    0
z-raised:  10
z-dropdown: 200
z-sticky:  300
z-overlay: 400
z-modal:   500
z-toast:   600
z-tooltip: 700
```

---

## 7. Localization Guidelines

### Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  LanguageProvider   │────▶│ LanguageContext  │────▶│ useLanguage hook │
│  (wraps app)         │     │  (language,      │     │  (consumes)      │
│                     │     │   literal)       │     │                 │
└─────────────────────┘     └──────────────────┘     └─────────────────┘
```

### Implementation (from `src/`)

| Component | Location | Purpose |
|---|---|---|
| `LanguageProvider` | `src/common/localization/LanguageProvider.tsx` | Context provider |
| `LanguageContext` | `src/common/localization/LanguageContext.ts` | React context |
| `useLanguage()` | `src/common/localization/LanguageContext.ts` | Hook to consume translations |

### LanguageProvider Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `children` | `ReactNode` | Yes | Application content |
| `translations` | `TranslationMap` | Yes | Key-value per language |
| `availableLanguages` | `LanguageDefinition[]` | Yes | Supported languages |
| `defaultLanguage` | `string` | No | `'en'` |

### Translation Structure

Organize as flat key-value objects:

```ts
const translations = {
  en: {
    "ui.save": "Save",
    "ui.cancel": "Cancel",
    "msg.welcome": "Welcome back",
  },
  es: {
    "ui.save": "Guardar",
    "ui.cancel": "Cancelar",
    "msg.welcome": "Bienvenido de nuevo",
  },
};
```

### Key Naming Conventions

| Pattern | Example | Use Case |
|---|---|---|
| `category.key` | `ui.save`, `msg.error` | Groups related strings |
| `component.key` | `header.title`, `footer.copyright` | Component-scoped |
| `screen.action` | `login.submit`, `settings.reset` | Page-specific |

### Accessing Translations

```tsx
const { literal } = useLanguage();

<h1>{literal["header.title"]}</h1>
<button>{literal["ui.save"]}</button>
```

### Supported Locales

| Locale | Language | Direction | Date Format | Number Format |
|---|---|---|---|---|
| `en-US` | English (US) | LTR | MM/DD/YYYY | 1,234.56 |
| `en-GB` | English (UK) | LTR | DD/MM/YYYY | 1,234.56 |
| `fr-FR` | French | LTR | DD/MM/YYYY | 1 234,56 |
| `de-DE` | German | LTR | DD.MM.YYYY | 1.234,56 |
| `es-ES` | Spanish | LTR | DD/MM/YYYY | 1.234,56 |
| `ar-SA` | Arabic | RTL | YYYY/MM/DD | ١٢٣٤٫٥٦ |
| `ja-JP` | Japanese | LTR | YYYY年MM月DD日 | 1,234.56 |
| `zh-CN` | Chinese (Simplified) | LTR | YYYY年MM月DD日 | 1,234.56 |

### Zero Hardcoding Policy

All user-visible strings must be externalized:

```ts
// ✅ Correct
{ "items_selected": "{{count}} items selected" }

// ❌ Wrong
{ "items": "items", "selected": "selected" }
// → concatenating breaks word order in other languages
```

### Pluralization

Use separate keys (not ICU format):

```ts
{
  "items.one": "You have 1 item",
  "items.other": "You have {{count}} items"
}
```

### Variable Injection

Localized strings can contain dynamic data:

```ts
{
  "notifications.one": "You have 1 new alert",
  "notifications.other": "You have {{count}} new alerts"
}
```

### RTL Support

- Use CSS logical properties: `margin-inline-start` not `margin-left`
- Apply `dir="rtl"` at `<html>` element
- Mirror directional icons with `transform: scaleX(-1)`

### Date, Time & Number Formatting

Always use `Intl` API:

```ts
// Dates
new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)

// Numbers
new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)

// Currency
new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount)
```

### Why This Architecture

| Approach | Rationale |
|---|---|
| React Context | No external dependencies, clean API |
| Dictionary Format | Simple flat structure, easy to audit |
| Runtime Switching | Language changes without app restart |
| Dot-Notation Keys | Simple lookup, clear hierarchy |
| Key-Value Per Language | Easy to extend, no complex tooling |

---

## 8. Accessibility

- **Color Contrast**: minimum **4.5:1** for body text, **3:1** for large text (WCAG AA)
- **Focus Management**: every interactive element keyboard-reachable with visible focus
- **ARIA**: use semantic HTML first, add ARIA only when needed
- **Reduced Motion**: respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- **Images**: meaningful `alt` text, or `alt=""` for decorative
- **Forms**: every input with associated `<label>`
- **Touch Targets**: minimum **44×44px** (WCAG 2.5.5)

---

## Related Documentation

| Document | Purpose |
|---|---|
| `docs/design/theme-and-localization.md` | Design rationale (why we chose this architecture) |
| `docs/design/theme.md` | NEEV theme contract |
| `docs/design/localization.md` | NEEV localization contract |
| `docs/feature/theming/README.md` | Theming implementation overview |
| `docs/feature/localization/README.md` | Localization implementation overview |
| `docs/rules/Core Design Rules.md` | Premium design principles |
| `docs/references/theme.md` | Theme design references |

---

*Last updated: April 2026 · Design System Team · Questions → #design-systems*