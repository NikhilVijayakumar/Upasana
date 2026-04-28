---
name: brand-guidelines
description: Apply Astra's premium design system to any visual artifact. Use when creating presentations, documents, or visual materials that should reflect Astra's brand identity. The design system is based on Precision, Clarity, and Restraint principles with reference from Linear, Stripe, and Vercel design aesthetics. Includes colors, typography, spacing, and design rules from the project's design.md and docs/.
license: Complete terms in LICENSE.txt
---

# Brand Guidelines

Follow these guidelines for all Astra-branded visual materials. This skill aligns with `design.md`, `docs/design/`, `docs/references/`, and `docs/rules/`.

## Design Philosophy

Astra follows three core principles that define premium, award-winning design:

| Principle | Description |
|---|---|
| **Precision** | Design feels engineered and intentional |
| **Clarity** | Information is immediately understandable |
| **Restraint** | Minimalism elevates focus and elegance |

## Brand Colors

### Primary Colors (from `src/theme/tokens/colors.ts`)

| Name | Hex | Usage |
|---|---|---|
| Primary | `#5A60F5` | Main accent, CTAs |
| Primary Hover | `#5255DF` | Interactive states |
| Secondary | `#8a8f98` | Neutral text, icons |

### Light Mode Palette (from design.md)

| Surface | Color | Usage |
|---|---|---|
| Background | `#F5F5F7` | Page background |
| Paper | `#FFFFFF` | Cards, elevated surfaces |
| Text Primary | `#111318` | Headings, body |
| Text Secondary | `#687076` | Captions, metadata |

### Dark Mode Palette

| Surface | Color | Usage |
|---|---|---|
| Background | `#0e1015` | Page background |
| Paper | `#16181D` | Cards, elevated surfaces |
| Panel | `#1E2028` | Highest elevation |
| Text Primary | `#EDEDEF` | Headings, body |
| Text Secondary | `#8A8F98` | Captions, metadata |

### Status Colors

| Status | Hex | Usage |
|---|---|---|
| Error | `#ED5F74` | Errors, destructive |
| Warning | `#F5A623` | Warnings |
| Success | `#34C759` | Success states |
| Info | `#5A60F5` | Informational |
| Crisis | `#F85149` | Critical alerts |

## Typography (from `src/theme/tokens/typography.ts`)

### Font Stack

**Sans-serif:**
```
"Inter", "Segoe UI", "Helvetica Neue", sans-serif
```

**Monospace:**
```
"IBM Plex Mono", "Menlo", "Courier New", monospace
```

### Type Scale

| Variant | Size | Weight | Usage |
|---|---|---|---|
| h1 | 2rem (32px) | 600 | Page headings |
| h2 | 1.5rem (24px) | 600 | Section headings |
| h3 | 1.25rem (20px) | 600 | Subsection |
| body1 | 0.9375rem (15px) | 400 | Primary body |
| body2 | 0.8125rem (13px) | 400 | Secondary text |
| caption | 0.75rem (12px) | 500 | Labels |

### Premium Typographic Principles (from docs/rules/Core Design Rules.md)

- Typography leads the interface
- Avoid excessive font weights
- Headings: confident and readable
- Body: effortless to scan
- Never use decorative type

## Spacing System (from `src/theme/tokens/spacing.ts`)

Base unit: **4px**

| Token | Value | Pixels |
|---|---|---|
| internal | 0.5 | 4px |
| xs | 1 | 8px |
| sm | 1.5 | 12px |
| md | 2 | 16px |
| lg | 3 | 24px |
| xl | 4 | 32px |
| xxl | 6 | 48px |
| section | 8 | 64px |
| page | 12 | 96px |

### Spacing Principles (from docs/rules/Core Design Rules.md)

- Follow strict alignment and rhythm
- Maintain balanced margins
- Align to grid structure

## Design Rules (from docs/rules/Core Design Rules.md)

### The 10 Core Rules

1. **Radical Simplicity** — Remove anything that doesn't support clarity or function
2. **Precision in Spacing** — Layouts feel engineered, not assembled
3. **Typography Leads** — Rely on type, spacing, contrast over decoration
4. **Color as Guidance** — Accent colors highlight primary actions only
5. **White Space is Feature** — Treated as essential design component
6. **Depth is Subtle** — Use soft shadows, never heavy drop shadows
7. **Motion is Purposeful** — Animation indicates state change
8. **Consistency Builds Trust** — Every element behaves predictably
9. **Detail Reflects Craftsmanship** — Attention to micro-spacing
10. **Restraint Defines Premium** — What you choose NOT to include matters

### Premium Checklist (from docs/rules/Design Quality Checklist.md)

- [ ] Consistent spacing throughout
- [ ] Clear visual hierarchy
- [ ] Purposeful color usage
- [ ] Readable typography
- [ ] Accessible contrast ratios (4.5:1 minimum)
- [ ] No decorative elements without purpose
- [ ] Intentional animations only
- [ ] Balanced composition

## Reference Aesthetics (from docs/references/theme.md)

### Light Mode References

**Linear** (Internal tools):
- Soft white (#F5F5F7), not pure white
- 3-4 tone neutral hierarchy
- Subtle shadows over borders
- High clarity

**Stripe** (Marketing):
- Warm neutrals
- Controlled accent usage
- Premium whitespace

**Vercel** (Minimal):
- Minimal noise
- High contrast but not aggressive

### Dark Mode References

**Linear + GitHub** (Internal tools):
- Deep gray (#0e1015), NOT black
- Layered surfaces 4-5 tiers
- Calm accent usage

**Vercel** (Marketing):
- Controlled contrast
- Slight glow on key elements only

**Porsche** (Luxury):
- Cinematic dark
- Large whitespace
- High contrast controlled

### Golden Rules

**Light Mode:**
- Avoid pure white as dominant surface
- Use 3-5 neutral steps
- Prefer space over borders
- Text: near-black, not absolute black

**Dark Mode:**
- Avoid pure black (#000000)
- Use layered dark grays
- Keep accent saturation controlled
- Ensure text contrast tiers

## Interaction States

| State | Light Mode | Dark Mode |
|---|---|---|
| Hover | `filter: brightness(0.95)` | `filter: brightness(1.1)` |
| Active | `transform: scale(0.98)` | same |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` | same |

## Applying These Guidelines

1. **Start with purpose** — What does this interface solve?
2. **Choose direction** — Minimal, editorial, luxury, technical?
3. **Apply tokens** — Use colors, spacing, type from above
4. **Refine details** — Micro-spacing, alignment, hierarchy
5. **Validate** — Check against premium checklist

NEVER use:
- Pure white backgrounds everywhere
- Harsh black text
- Decorative elements without purpose
- Overused fonts (Inter, Roboto, Arial)
- Purple gradients on white
- Neon accent spam in dark mode

---
For complete design system details, see: `design.md`, `docs/design/theme-and-localization.md`, `docs/rules/Core Design Rules.md`, `docs/references/theme.md`