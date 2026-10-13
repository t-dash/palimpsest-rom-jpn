# Quilt signature component

`Quilt` is an SSR-safe, dependency-free React visualization for the Quilted Languages capstone. It renders two deterministic patch panels, keeps every patch in place while filtering, and provides a static grouped list in the same server-rendered markup.

## Usage

```tsx
import { Quilt } from './signature/quilt'

<Quilt
  words={words}
  filters={{ donor: ['Latin'], period: 'Period A' }}
  onSelect={(word) => navigate({ to: '/words/$slug', params: { slug: word.slug } })}
/>
```

### `Quilt` props

| Prop | Type | Notes |
| --- | --- | --- |
| `words` | `QuiltWord[]` | Required. Source content is never inferred or modified. |
| `filters` | `QuiltFilters` | Optional `language`, `donor`, `period`, and `contactType`; each accepts one value or an array. |
| `onSelect` | `(word: QuiltWord) => void` | Called by click, Enter, or Space. Wire this to `/words/$slug`. |
| `maxPerPanel` | `number` | Optional deterministic cap per language panel. |
| `className` | `string` | Optional wrapper class. |

`QuiltWord` is `{ id, slug, word, reading?, language: 'ro' | 'ja', meaning, donor, period, contactType }`.

### `QuiltLegend` props

| Prop | Type | Notes |
| --- | --- | --- |
| `words` | `QuiltWord[]` | Used to derive donor counts. |
| `selectedDonors` | `string[]` | Donors currently pressed. |
| `onToggleDonor` | `(donor: string) => void` | When present, legend entries become `aria-pressed` filter buttons. |
| `className` | `string` | Optional wrapper class. |

## Tokens and donor set

The defaults are proposed values and all can be overridden on an ancestor:

```css
.site-theme {
  --ql-ink: #14213D;
  --ql-paper: #F7F8FB;
  --ql-blue: #2F5D9E;
  --ql-thread: #C9D3E3;
  --ql-donor-latin: #2F5D9E;
}
```

The remaining donor variables follow `--ql-donor-<lowercase-name>`. Donor order, color, and pattern mappings live in `donors.ts`. Add a named donor there when the content model expands; unknown donors receive a deterministic fallback style. Pattern remains an independent signal, so color is never the only encoding.

## Integration

Copy `src/signature/quilt`, `src/signature/quilt-kit`, and `public/assets/quilted-languages` into the TanStack Start project. Copy the `.ql-*` rules from `src/styles.css` into the site's stylesheet, then replace the proposed variables with confirmed design tokens. The module does not read `window` or `document` during render. Event listeners are React handlers, and the initial client markup matches the server output.

The quilt uses a native CSS responsive switch at 768px, so it does not need a JavaScript media query. Patch layout is memoized and does no per-frame work while idle. The list beneath the quilt is part of the initial markup and remains usable without hydration. In the development-only Vite shell, `index.html` also contains a no-script explanation because Vite itself is client-rendered.

## Needed from the student

- Confirm the four base tokens, ten donor colors, and both fonts. The brief says “8 colours” but names ten donors; this implementation gives all ten a distinct proposed color and pattern.
- Supply the final word dataset, confirmed meanings, readings, donor labels, periods, and contact types.
- Confirm display labels and ordering for historical periods/contact types.
- Decide whether selection should navigate immediately or update another part of the page first.
- Confirm whether the plain grouped list should remain in a disclosure or be permanently expanded in the final site.
