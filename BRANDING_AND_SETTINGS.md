# Color-Only Branding & Dashboard Settings — Implementation Guide

This document outlines a pragmatic plan to implement a site-wide, color-only branding system for the dashboard (and invite card, invite pages, etc.) and to implement a Dashboard Settings page where organizers can configure color branding (palettes, presets). It includes a brief contract, design choices, step-by-step implementation, storage/API details, preview/testing notes, and rollout guidance.

---

## Summary / Goal
- Provide a simple, robust color-branding system so each event (or user) can customize the look-and-feel of invitation and dashboard UI (primary/secondary/accent/text/background colors).
- Add a Settings page in the dashboard that allows choosing colors, picking presets, and previewing changes live on invite cards. This guide intentionally focuses on colors/palettes only — logo handling is out of scope.
- Keep the solution accessible, performant, and easy to theme in both SSR and client-rendered pages.

## Contract (inputs / outputs)
- Inputs:
  - eventId (context; branding is per-event)
  - branding payload: { primary, secondary, accent, textColor, bgColor, paletteName? }
- Outputs:
  - Saved branding (color) data persisted in the database
  - Theming available to components at render time (server & client) via CSS variables
  - API surface: `GET /api/events/:id/branding`, `PUT /api/events/:id/branding`
- Success criteria:
  - Dashboard settings page allows saving color branding and previewing the invite card
  - Invite card pages (`/invite/[id]`) and dashboard components (cards, nav, CTA buttons) reflect saved colors
  - Accessibility: color contrast meets AA where applicable or warnings shown

## Edge cases & constraints
- Missing branding -> fall back to default theme in `globals.css` and Tailwind tokens.
- Invalid color input -> server- and client-side validation. Use hex validation and fallback.
- Per-event vs per-user: prefer per-event branding for invites; admin can set global defaults.
- SSR considerations: CSS variables must be available for server-rendered HTML to avoid FOUC.

## Design overview
1. Source of truth: persist branding (colors) as fields on the `Event` model (or a separate `Branding` JSON column). Keep the shape explicit - store hex colors and an optional palette name.
2. Runtime application: set CSS custom properties (variables) on a wrapper element (e.g., `<html data-theme>` or top-level container for event pages). Tailwind utilities read variables via `var(--brand-primary)`.
3. Integration: update key components and utility classes to use the CSS variables (buttons, cards, invite page, header) so a single change updates the UI.
4. Settings page: a page under the dashboard where user can pick colors (color pickers), choose presets, preview, and save.

## Data model / persistence (Prisma suggestions)
- Option A (explicit fields on Event):
```prisma
model Event {
  id            String   @id @default(cuid())
  title         String
  date          DateTime
  location      String?
  // Branding (colors only)
  brandPrimary   String?  // e.g., "#ff6b6b"
  brandSecondary String?
  brandAccent    String?
  brandText      String?
  brandBg        String?
  paletteName    String?
  // ... other fields
}
```
- Option B (single JSON field):
```prisma
model Event {
  id        String  @id @default(cuid())
  title     String
  branding  Json?
}
```
- Recommendation: use explicit fields when you want typed fields and easier filtering; use JSON if branding shape may change frequently.

## API routes
- Add server routes for reading/updating branding.
  - `src/app/api/events/[id]/branding/route.ts` (supports GET, PUT)
  - Use `getServerSession(authOptions)` to secure PUT (dashboard only).
  - Validate input with `zod`.

Example: PUT body shape
```json
{
  "brandPrimary": "#123456",
  "brandAccent": "#ffd700"
}
```

## Runtime theming approach
1. Store branding (colors) for an event in DB.
2. In server components that render event pages (for example `src/app/invite/[id]/page.tsx`), read the branding and render inline CSS variables on the outermost container. Example:
```tsx
// server component
return (
  <div style={{
    '--brand-primary': event.brandPrimary ?? '#0b5fff',
    '--brand-accent': event.brandAccent ?? '#ffd700',
    '--brand-text': event.brandText ?? '#0b2540',
    '--brand-bg': event.brandBg ?? '#ffffff'
  } as React.CSSProperties}>
    <InviteCard ... />
  </div>
)
```
3. Use those variables in `globals.css` and components via Tailwind-compatible tokens.

## Tailwind + CSS variables (implementation)
1. Define CSS vars defaults in `src/app/globals.css` (or similar):
```css
:root {
  --brand-primary: #0b5fff;
  --brand-accent: #ffd700;
  --brand-text: #0b2540;
  --brand-bg: #ffffff;
}
```
2. Extend Tailwind to reference CSS variables in `tailwind.config.ts`:
```js
// tailwind.config.ts (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: 'var(--brand-primary)',
          accent: 'var(--brand-accent)'
        },
        'brand-text': 'var(--brand-text)',
        'brand-bg': 'var(--brand-bg)'
      }
    }
  }
}
```
3. Use classes like `bg-brand`, `text-brand-text`, `border-brand` in components.
4. For shades (lighter/darker) you can expose additional CSS vars (e.g., `--brand-100`, `--brand-900`) or compute via a color-utility during save (server side) and set them as variables.

## Settings page UI (recommended file & flow)
- File: `src/app/(dashboard)/dashboard/settings/page.tsx`
- Key parts:
  - Color pickers for primary, accent, text, background (use a simple color picker component or `input type="color"`).
  - Preset palette list (buttons to apply a palette).
  - Live preview: render a small instance of the invite card component and some dashboard cards to show the theme in context.
  - Save: call `PUT /api/events/:id/branding`

UX details:
- Show contrast warnings (red / yellow labels) if `brandText` vs `bg` contrast is low (use `tinycolor2` or simple luminance formula).
- On save, show a success toast and optionally redirect.

## Component updates — where to use vars
- Invite card: `src/app/invite/[id]/page.tsx` uses branding variables; wrap invite card with the inline variables.
- Dashboard cards: components under `src/components/ui/*` (Card, Button) should use `bg-brand`, `text-brand-text`, or component-level classes that read variables.
- Example: change `btn-gradient-primary` implementation to use `background: linear-gradient(var(--brand-primary), var(--brand-accent))` or Tailwind utility referencing `bg-[color:var(--brand-primary)]`.

## Notes on scope
This document focuses on color/palette branding only. Logo upload and handling are intentionally excluded. If you later want logo support, add a `brandLogoUrl` field and the corresponding upload flow and UI.

## Server-side rendering & caching
- For event pages that are server-rendered, include inline style vars on the root wrapper server-side (so CSS variables exist for the initial paint).
- Avoid hydration mismatch by ensuring client reads same values or that values are set both server and client.

## Accessibility
- Run contrast checks for combinations. If a chosen color fails `AA`, show a warning and offer an alternate text color (auto-compute `#fff` or `#000` based on luminance).

## Tests & QA
- Unit tests for validation (hex color format), API route tests
- Visual regression tests (Percy/Chromatic) for invite card with multiple palettes
- Manual: test the invite page with different palettes to ensure colors render and contrast checks behave correctly

## Rollout plan
1. Implement defaults and backend storage.
2. Update key components to use variables (invite card, primary buttons, cards).
3. Create the settings page and wire save API.
4. QA & Accessibility checks.
5. Soft launch: enable setting page in staging, let power users test.
6. Full release.

## Example code snippets
- Setting CSS vars in a server component (invite page):
```tsx
<div style={{
  '--brand-primary': event.brandPrimary ?? '#0b5fff',
  '--brand-accent': event.brandAccent ?? '#ffd700',
  '--brand-text': event.brandText ?? '#0b2540',
  '--brand-bg': event.brandBg ?? '#ffffff'
} as React.CSSProperties}>
  <InviteCard invite={invite} />
</div>
```

- Tailwind config excerpt (use `var()`):
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: 'var(--brand-primary)',
        accent: 'var(--brand-accent)',
      }
    }
  }
}
```

## Migration notes
- If you add explicit columns on `Event`, update `prisma/schema.prisma` and run `npx prisma migrate dev --name add_branding_to_event`.
- If you use JSON, add the column and a lightweight migration to populate defaults.

## Implementation checklist (concrete steps)
1. Add branding (color) fields to `prisma/schema.prisma` and run migration.
2. Implement `src/app/api/events/[id]/branding/route.ts` with GET/PUT and validation.
3. Add CSS variables defaults to `src/app/globals.css`.
4. Extend `tailwind.config.ts` to reference CSS vars.
5. Update `src/app/invite/[id]/page.tsx` to set inline CSS var wrapper from DB.
6. Update common components (`Card`, `Button`) to use brand variables or new Tailwind tokens.
7. Create `src/app/(dashboard)/dashboard/settings/page.tsx` — color pickers, live preview.
8. Add client-side validation + contrast checks.
9. Add tests and visual snapshots.

## Next steps I can do for you
- Create the Prisma migration example and stub API route.
- Implement the Settings page UI scaffold in `src/app/(dashboard)/dashboard/settings/page.tsx` with form and preview.
- Wire one component (e.g., `Button`) to the brand variables as a live example.

---

If you want, I can now implement the first concrete change (pick one):
- a) Add Prisma schema fields + migration stub
- b) Add the `branding` API route skeleton
- c) Implement the settings page scaffold with live preview
Pick which piece to implement next and I will proceed and update the todo list as I go.
