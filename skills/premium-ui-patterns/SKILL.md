---
name: premium-ui-patterns
description: Apply premium UI patterns to build award-winning interfaces. Use when designing dashboards, tools, forms, tables, hero sections, or any UI component. Based on docs/rules/Premium UI Patterns.md with clarity, hierarchy, and restraint principles. Patterns: Cards, Hero Sections, Data Tables, Toolbars, Forms, Side Panels, Notifications.
license: Complete terms in LICENSE.txt
---

# Premium UI Patterns

Apply premium UI patterns based on `docs/rules/Premium UI Patterns.md`.遵循以下原则:

## Design Philosophy

| Principle | Description |
|---|---|
| **Clarity** | Information immediately understandable |
| **Structure** | Layouts feel engineered and balanced |
| **Restraint** | Visual design minimal and intentional |

---

## 1. Card Surfaces

Cards organize information into clear, digestible units.

### Characteristics

- Soft surface contrast
- Subtle elevation
- Comfortable internal spacing
- Clear content hierarchy

### Structure

Each card should contain:
1. **Title** — Clear heading
2. **Supporting information** — Metadata, captions
3. **Primary action or data** — Core content

### Implementation

```tsx
<Card elevation="subtle" padding="lg">
  <CardTitle>Metric Name</CardTitle>
  <CardCaption>Updated 2 hours ago</CardCaption>
  <CardValue>1,234</CardValue>
</Card>
```

### Rules

- Never feel cramped
- Never overly decorated
- Never visually heavy

**Principle:** Cards are containers for clarity, not decoration.

---

## 2. Editorial Hero Sections

Hero sections introduce a page with confidence and clarity.

### Characteristics

- Large confident typography
- Generous whitespace
- Minimal supporting elements

### Structure

1. **Headline** — Bold, impactful
2. **Supporting description** — 1-2 sentences max
3. **Primary action** — Single CTA

### Implementation

```tsx
<Hero>
  <HeroTitle>Build Better Software</HeroTitle>
  <HeroSubtitle>Ship faster with AI-powered insights</HeroSubtitle>
  <HeroAction>Get Started</HeroAction>
</Hero>
```

### Rules

- Avoid cluttered hero sections
- Avoid multiple competing messages
- Avoid heavy graphics

**Principle:** One clear message is more powerful than many.

---

## 3. Structured Data Tables

Data tables prioritize legibility and scanning speed.

### Characteristics

- Clear column alignment
- Subtle row separators
- Readable spacing
- Minimal borders

### Features

- Sorting
- Filtering
- Quick scanning
- Row hover states

### Implementation

```tsx
<DataTable>
  <DataTableHeader>
    <Column key="name" sortable>Name</Column>
    <Column key="status" sortable>Status</Column>
    <Column key="date" sortable>Date</Column>
  </DataTableHeader>
  <DataTableRow>
    <Cell>Item</Cell>
    <Cell><Badge>Active</Badge></Cell>
    <Cell>Jan 15</Cell>
  </DataTableRow>
</DataTable>
```

### Rules

- Avoid dense rows
- Avoid visual clutter
- Avoid excessive grid lines

**Principle:** Data should feel structured and easy to read.

---

## 4. Action-Focused Toolbars

Toolbars provide quick access to key actions.

### Characteristics

- Clear grouping of actions
- Minimal icon usage
- Balanced spacing

### Structure

- Primary actions prominently placed
- Secondary actions grouped
- Contextual actions revealed on hover

### Implementation

```tsx
<Toolbar>
  <ToolbarGroup>
    <IconButton icon="add" />
    <IconButton icon="edit" />
    <IconButton icon="delete" />
  </ToolbarGroup>
  <ToolbarDivider />
  <ToolbarGroup>
    <IconButton icon="filter" />
    <IconButton icon="sort" />
  </ToolbarGroup>
</Toolbar>
```

### Rules

- Avoid too many icons
- Avoid ambiguous actions
- Avoid inconsistent grouping

**Principle:** Tools should support flow, not interrupt it.

---

## 5. Minimal Form Layouts

Forms should feel simple, structured, and calm.

### Characteristics

- Clear labels
- Logical grouping
- Comfortable vertical spacing

### Structure

1. **Label** — Above input
2. **Input** — Standard height
3. **Helper text** — Below, muted
4. **Validation** — Clear error messages

### Implementation

```tsx
<FormGroup>
  <FormField>
    <Label>Email</Label>
    <Input type="email" placeholder="you@company.com" />
    <HelperText>We'll never share your email</HelperText>
  </FormField>
</FormGroup>
```

### Rules

- Show only necessary fields
- Group related inputs
- Highlight primary actions clearly

**Principle:** Forms should reduce friction.

---

## 6. Contextual Side Panels

Side panels allow viewing or editing details without leaving context.

### Characteristics

- Smooth sliding transitions
- Clear section hierarchy
- Focused content

### Typical Uses

- Item details
- Settings
- Quick editing
- Detail views

### Implementation

```tsx
<SidePanel open={isOpen} position="right">
  <PanelHeader>Item Details</PanelHeader>
  <PanelContent>
    <DetailRow label="Name" value={name} />
    <DetailRow label="Status" value={status} />
  </PanelContent>
  <PanelActions>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Save</Button>
  </PanelActions>
</SidePanel>
```

### Animation

```css
.side-panel {
  animation: slideIn 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Rules

- Avoid overly wide panels
- Avoid unrelated content
- Avoid cluttered layouts

**Principle:** Panels preserve context and reduce navigation friction.

---

## 7. Subtle Notification Feedback

Notifications provide feedback without disrupting the user.

### Characteristics

- Short and clear messages
- Minimal styling
- Automatic dismissal
- Non-intrusive positioning

### Types

- **Toast** — Temporary, auto-dismiss
- **Snackbar** — Actionable, temporary
- **Alert** — Requires acknowledgment

### Implementation

```tsx
// Success
<Toast variant="success" duration={3000}>
  Changes saved successfully
</Toast>

// Error
<Alert variant="error">
  Please correct the errors below
</Alert>
```

### Rules

- Avoid large intrusive alerts
- Avoid unnecessary animations
- Avoid overly bright colors

**Principle:** Feedback should be helpful, not distracting.

---

## Premium Pattern Principles

All patterns follow:

### Clarity
- Information immediately understandable
- Clear visual hierarchy
- Purposeful use of space

### Structure
- Layouts feel engineered
- Consistent alignment
- Predictable positioning

### Restraint
- Minimal decoration
- Purposeful color
- No visual clutter

---

## Implementation Checklist

- [ ] Cards have soft elevation, not heavy shadows
- [ ] Hero sections have single message
- [ ] Tables support sorting/filtering
- [ ] Toolbars grouped logically
- [ ] Forms have clear labels
- [ ] Panels preserve context
- [ ] Notifications are non-intrusive

---
For complete reference, see: `docs/rules/Premium UI Patterns.md`, `docs/rules/Core Design Rules.md`, `design.md`