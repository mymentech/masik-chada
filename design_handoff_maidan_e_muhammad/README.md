# Handoff: ময়দানে মুহাম্মাদ — Visual Redesign
## Maidan-e-Muhammad Frontend Design Implementation

---

## Overview

This handoff documents a **high-fidelity visual redesign** of the Maidan-e-Muhammad মাসিক চাঁদা ব্যবস্থাপনা (monthly donation management) web app. The existing codebase is fully functional — all GraphQL queries, mutations, auth, routing, and state are wired up correctly. The task is purely **visual**: replace the plain CSS with the new design system while keeping all logic and data-binding intact.

The bundled HTML files (`Maidan-e-Muhammad Design.html` + supporting `.jsx` files) are **design references** — interactive prototypes showing intended look, layout, and behaviour. Do **not** ship these files; recreate the UI inside the existing React/Vite/Apollo codebase using its existing patterns.

---

## Fidelity

**High-fidelity.** Implement pixel-accurately: exact hex colours, exact border-radii, exact font weights, exact spacing. The design was built from the same brand tokens already partially present in `index.css` (`--brand: #15803d`, `--brand-dark: #166534`), so alignment is close — mostly additive work.

---

## Design Tokens

Replace / extend `:root` in `src/index.css`:

```css
:root {
  /* Brand greens */
  --green-50:  #f0fdf4;
  --green-100: #dcfce7;
  --green-500: #22c55e;
  --green-600: #16a34a;   /* primary buttons, active nav, badges */
  --green-700: #15803d;   /* button hover, header gradient end, toast bg */
  --green-800: #166534;   /* header gradient start, headings, logo text */
  --green-900: #14532d;

  /* Semantic */
  --danger:  #ef4444;
  --warning: #f97316;
  --info:    #3b82f6;

  /* Grays */
  --gray-50:  #f9fafb;   /* app shell bg */
  --gray-100: #f3f4f6;   /* dividers, search bg */
  --gray-300: #d1d5db;   /* input borders */
  --gray-400: #9ca3af;   /* placeholder, secondary icons */
  --gray-500: #6b7280;   /* secondary text */
  --gray-700: #374151;   /* body text, labels */
  --gray-900: #111827;   /* headings, primary text */
  --white:    #ffffff;
}
```

### Typography

The codebase already imports **Hind Siliguri** — keep it. It is the correct Bengali web font (Nikosh in the prototype is for illustration only; it requires a non-standard CDN and has poor hinting at small sizes).

| Role | Size | Weight |
|---|---|---|
| Page title / screen heading | 18–24px | 700 |
| Card heading | 16–18px | 700 |
| Body / donor name | 14–15px | 600 (name), 400 (meta) |
| Secondary / address | 12–13px | 400 |
| Badge / caption | 11–12px | 600 |

### Spacing & Shape

| Token | Value |
|---|---|
| Card border-radius | 16px |
| Input border-radius | 12px |
| Button border-radius | 12px (pill chips: 999px) |
| Input height | 52px (mobile) / 44–48px (desktop) |
| Primary button height | 52px |
| Bottom nav height | 64px |
| Card shadow | `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)` |
| Input focus ring | `0 0 0 3px rgba(22,163,74,0.12)` + `border: 2px solid #16a34a` |

---

## Logo Mark

The app currently shows "মাসিক চাঁদা" as plain text in the Navbar. Replace with the SVG logomark + text lockup:

```jsx
// LogoMark component — inline SVG mosque dome
function LogoMark({ size = 36, bg = '#16a34a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <rect width="80" height="80" rx="18" fill={bg}/>
      <rect x="12" y="55" width="56" height="6" rx="2" fill="white"/>
      <rect x="11" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M11 38 Q16 31 21 38Z" fill="white"/>
      <rect x="59" y="38" width="10" height="19" rx="3" fill="white"/>
      <path d="M59 38 Q64 31 69 38Z" fill="white"/>
      <path d="M21 55 Q21 29 40 29 Q59 29 59 55Z" fill="white"/>
      <circle cx="40" cy="23" r="10" fill="white"/>
      <circle cx="44.5" cy="19.5" r="9" fill={bg}/>
      <circle cx="50" cy="17" r="2.2" fill="white"/>
    </svg>
  );
}
```

Use in Navbar as:
```jsx
<div style={{ display:'flex', alignItems:'center', gap:10 }}>
  <LogoMark size={34} />
  <div>
    <div style={{ fontSize:14, fontWeight:700, color:'#166534', lineHeight:1.1 }}>ময়দানে মুহাম্মাদ</div>
    <div style={{ fontSize:10, color:'#16a34a', letterSpacing:'0.3px' }}>Maidan-e-Muhammad</div>
  </div>
</div>
```

---

## File-by-File Implementation Guide

### 1. `src/index.css` — Global Styles

- Replace all existing CSS with the new design tokens above
- `body` background: `#f9fafb` (plain, no gradient)
- Remove `radial-gradient` background
- The `.topbar` stays sticky with `backdrop-filter: blur(6px)` and `background: rgba(255,255,255,0.96)`

---

### 2. `src/components/Navbar.jsx`

**Current:** Plain text brand + pill nav links + logout button.

**Design target (see `mm-desktop.jsx` → `DesktopTopNav`):**

- Left: LogoMark SVG (34px) + two-line text lockup ("ময়দানে মুহাম্মাদ" / "Maidan-e-Muhammad")
- Center: Nav links as pill tabs. Active state: `background: #f0fdf4; color: #166534; font-weight: 600`. Inactive: `color: #6b7280`
- Right: User avatar circle (green-100 bg, user icon) + name + "অ্যাডমিন" label + logout button styled as `background: #eef2ff; color: #4f46e5; border-radius: 8px`
- Nav label changes: `দান সংগ্রহ` → `চাঁদা সংগ্রহ`, `ডোনার` → `দাতা ম্যানেজমেন্ট`
- Logout button: indigo pill (existing `eef2ff` style already in CSS), add LogOut icon (already imported from lucide-react ✓)

Keep all existing routing/auth logic unchanged.

---

### 3. `src/pages/Login.jsx`

**Current:** Centered card with plain inputs.

**Design target (see `mm-screens-a.jsx` → `LoginScreen`):**

- Full-screen green gradient background: `linear-gradient(160deg, #166534 0%, #15803d 100%)`
- Top hero section (≈280px tall): LogoMark (72px, `bg="rgba(255,255,255,0.18)"`) + "ময়দানে মুহাম্মাদ" white title + "Maidan-e-Muhammad" subtitle
- White card floats from bottom: `border-radius: 24px 24px 0 0`, `padding: 28px 24px 40px`, `box-shadow: 0 -4px 24px rgba(0,0,0,0.12)`
- Card title: "লগইন করুন", `font-size: 22px, font-weight: 700`
- Inputs: height 52px, `border-radius: 12px`, inactive border `1.5px solid #d1d5db`, bg `#f9fafb`; focused border `1.5px solid #16a34a` + focus ring
- Password field: show/hide eye icon (SVG) on right
- Submit button: `height: 52px, background: #16a34a, border-radius: 12px, color: white, font-size: 16px, font-weight: 600`
- Remove the "← হোমে ফিরে যান" link (not in current codebase)
- Keep all existing form state, validation, and Apollo mutation logic

---

### 4. `src/pages/Dashboard.jsx`

**Current:** Plain `<section>` with `stats-grid` of `<article>` cards.

**Design target (see `mm-desktop.jsx` → `DesktopDashboard` for desktop; `mm-screens-a.jsx` → `DashboardScreen` for mobile reference):**

**Header banner:**
```
background: linear-gradient(135deg, #166534 0%, #15803d 100%)
padding: 20px 24px 28px
```
Shows: LogoMark (small), user greeting ("স্বাগতম, [username]"), date subtitle, notification bell icon.

**Stat cards (2×2 grid on mobile, 4-col on desktop):**
Each card: `background: white, border-radius: 16px, padding: 20px, box-shadow: var(--card-shadow)`
- Icon bubble: 44×44px, `border-radius: 12px`, color-coded background + stroke icon
  - Total donors: green-100 bg, green-600 icon
  - This month collected: `#dbeafe` bg, blue `#3b82f6` icon
  - Total balance (বকেয়া): `#fee2e2` bg, red danger icon
  - Collectors: `#ffedd5` bg, orange warning icon
- Label: `font-size: 12px, color: #9ca3af, font-weight: 500`
- Value: `font-size: 26px, font-weight: 700, color: #111827`

**Below stats — two-column (desktop) / single column (mobile):**
- Welcome card: avatar + greeting + description + two CTA buttons ("চাঁদা সংগ্রহ শুরু করুন" primary, "রিপোর্ট দেখুন" ghost)
- Area breakdown card: progress bars per area with donor count + collected amount

All data comes from `useDashboardSummary()` hook — keep unchanged. Format numbers using `Intl.NumberFormat('bn-BD', ...)` as currently done.

---

### 5. `src/pages/Donations.jsx`

**Current:** Search input + address dropdown + donor list as `<button>` rows + bottom sheet overlay.

**Design target (see `mm-screens-a.jsx` → `DonationsScreen` + `mm-screens-b.jsx` → `PaymentScreen`):**

**Page header (sticky):**
- Title "চাঁদা সংগ্রহ", `font-size: 18px, font-weight: 700`
- Search bar: `height: 48px, background: #f3f4f6, border-radius: 12px`, search icon on left, placeholder text
- Filter row: area dropdown as pill `(border: 1px solid #d1d5db, border-radius: 999px, height: 34px)` + total dues badge in danger red on the right

**Table header (sticky below search):**
- `background: #f0fdf4, padding: 8px 16px`
- Columns: "সিরিয়াল · নাম" (flex:1) | "মাসিক" (52px right-aligned) | "বকেয়া" (64px right-aligned)
- Label style: `font-size: 11px, font-weight: 700, color: #166534`

**Donor rows:**
- Alternating `white` / `#f9fafb` background
- `min-height: 68px, padding: 12px 16px`
- Left: serial badge (`background: #dcfce7, color: #166534, border-radius: 6px, font-size: 11px, font-weight: 600`) + name (`15px, 600`) + address (`12px, #9ca3af`)
- Right: monthly amount (`12px, #6b7280`) + balance or "✓ পরিশোধিত"
  - Unpaid balance: `font-size: 14px, font-weight: 700, color: #ef4444`
  - Paid: `font-size: 13px, font-weight: 600, color: #16a34a`
- Active/selected row: `background: #f0fdf4, border-left: 3px solid #16a34a`

**Bottom sheet (payment — opens when donor selected):**
- Backdrop: `background: rgba(0,0,0,0.48), position: fixed, inset: 0, z-index: 30`
- Sheet: `background: white, border-radius: 20px 20px 0 0, box-shadow: 0 -8px 40px rgba(0,0,0,0.18), max-height: 88%, overflow: auto`
- Drag handle: `width: 40px, height: 4px, border-radius: 2px, background: #d1d5db`, centered, `padding: 12px 0 8px`
- Donor info: name (`20px, 700`), address + serial + red "বকেয়া ৳X" badge
- Amount input: `height: 60px, border: 2px solid #16a34a, border-radius: 12px` + focus ring; value `28px, 700`; currency symbol right-aligned
- Quick-select chips: `[৳৫০, ৳১০০, ৳২০০, ৳৫০০]` — pill buttons, selected chip: `background: #16a34a, color: white`; unselected: `border: 1.5px solid #d1d5db, color: #374151`
- Date field: `height: 52px, border: 1.5px solid #d1d5db, border-radius: 12px, background: #f9fafb` + calendar icon right
- Submit: `height: 52px, background: #16a34a, border-radius: 12px, box-shadow: 0 4px 14px rgba(22,163,74,0.3)`; label "চাঁদা গ্রহণ করুন"
- Payment history section below submit: list of past payments with date, collector, amount

**Success toast** (after `recordPayment` resolves successfully):
- Floating banner at top of list: `background: #15803d, border-radius: 14px, margin: 10px 16px 0`
- Green checkmark circle + success message text
- Auto-dismiss after 3 seconds

Keep all existing state variables, Apollo query/mutation, debounced search, and form validation logic.

---

### 6. `src/pages/Donors.jsx`

**Current:** Two-column layout — donor list left, add/edit form right.

**Design target (see `mm-desktop.jsx` → `DesktopDonors` + `mm-screens-b.jsx` → `DonorMgmtScreen` + `AddDonorScreen`):**

**Desktop (≥768px) — two-column grid `1fr 380px`:**

Left panel — donor table:
- White card with `border-radius: 16px`
- Header: title "দাতা ম্যানেজমেন্ট" + donor count + `+ নতুন দাতা যোগ` green button + search bar
- Table header row: `background: #f0fdf4`, columns: ক্র. | নাম | ঠিকানা | মাসিক চাঁদা | বকেয়া | অ্যাকশন
- Rows: serial badge + name (`14px, 600`) + address (`13px, gray-500`) + monthly + balance/paid + Edit/Delete buttons
  - Edit button: `background: #dbeafe, color: #2563eb, border-radius: 8px, height: 32px, padding: 0 12px, font-size: 12px`
  - Delete button: `background: #fee2e2, color: #ef4444` (same shape)

Right panel — add/edit form:
- White card, `padding: 24px`
- Title: "নতুন দাতা যোগ করুন" / "ডোনার আপডেট"
- Fields: নাম, ফোন, ঠিকানা, মাসিক চাঁদা (with quick chips ৳৫০/১০০/২০০/৫০০), নিবন্ধনের তারিখ, বকেয়া গণনার তারিখ (optional)
- Yellow info box for due_from: `background: #fffbeb, border: 1px solid #fde68a, border-radius: 10px, padding: 10px 12px, color: #92400e`
- Cancel + Save buttons side by side

**Mobile — bottom sheet pattern:**
- List shows as full-screen scrollable
- "+ নতুন দাতা" button in header opens a bottom sheet with the form (same pattern as PaymentScreen)

Keep all existing form state, mutation logic, validation, and delete confirmation (`window.confirm`).

---

### 7. `src/pages/Reports.jsx`

**Current:** Toolbar with month picker + PDF button + stats cards + collector table.

**Design target (see `mm-desktop.jsx` → `DesktopReports` + `mm-screens-b.jsx` → `ReportsScreen`):**

**Header:**
- Title "মাসিক রিপোর্ট", month prev/next navigation (or keep month `<input type="month">` styled as a bordered pill)
- `PDF এক্সপোর্ট` button: green, with download icon (SVG or lucide `Download`)

**Summary cards (3-col desktop / 2-col mobile):**
- "এ মাসের মোট সংগ্রহ": dark green gradient card (`linear-gradient(135deg, #166534, #15803d)`), white text, trend label
- "মাস শেষে মোট বকেয়া": red (`#ef4444`) card, white text
- "পরিশোধিত দাতা": white card, `X / Y` format + progress bar (`background: #16a34a, height: 8px, border-radius: 4px`)

**Collector table:**
- White card, table header: `background: #16a34a`, white text
- Alternating rows white/gray-50
- Each row: avatar circle (green-100 bg, user icon) + name + right-aligned amount in green-700
- Footer total row: `background: #f0fdf4, border-top: 2px solid #dcfce7`, bold totals

**Empty state** (no collections this month):
- Centered: bar-chart SVG icon (stroke gray-300) + "এ মাসে কোনো সংগ্রহ হয়নি" in gray-400

Keep all existing query, loading, error states and `window.print()` PDF export.

---

## Interactions & Animations

| Interaction | Spec |
|---|---|
| Bottom sheet open | Slides up from bottom: `transform: translateY(0)` from `translateY(100%)`, `transition: 300ms ease-out` |
| Bottom sheet close | Slides down, `transition: 200ms ease-in` |
| Donor row tap | Immediate highlight (`border-left: 3px solid #16a34a, background: #f0fdf4`) |
| Success toast | Fades in from top (`opacity 0→1, translateY(-8px→0)`, 250ms), auto-dismiss after 3000ms |
| Button hover | `background: #15803d` (one shade darker) |
| Quick chip select | Instant fill swap: selected → green-600 bg + white text |
| Input focus | `border: 2px solid #16a34a` + `box-shadow: 0 0 0 3px rgba(22,163,74,0.12)` |

---

## Responsive Breakpoints

| Width | Layout |
|---|---|
| < 768px | Mobile: bottom nav (hide top Navbar), full-width pages, bottom sheet modals |
| ≥ 768px | Desktop: top Navbar, two-column layouts, inline panels instead of bottom sheets |

> **Mobile bottom nav** (Donations, Donors, Reports, Dashboard tabs) replaces the Navbar on small screens. Add a `<BottomNav>` component that renders as `position: fixed; bottom: 0; width: 100%; height: 64px; background: white; border-top: 1px solid #f3f4f6`. Icons use the same lucide-react icon set already installed.

---

## Assets & Dependencies

| Asset | Source | Notes |
|---|---|---|
| LogoMark SVG | Defined inline above | No file needed |
| `lucide-react` | Already installed | Use for nav icons, download, logout, eye |
| `Hind Siliguri` | Already imported in `index.css` | Keep weights 400/500/600/700 |
| Bengali numeral helper | See below | Optional — use for serial badges |

```js
// Optional: convert latin digits to Bengali
const BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
export const bnNum = (n) => String(n).replace(/[0-9]/g, d => BN[+d]);
```

---

## Files Reference

| Design file | What it shows |
|---|---|
| `Maidan-e-Muhammad Design.html` | Root — loads all JSX files, renders design canvas |
| `mm-common.jsx` | Design tokens (MM object), LogoMark, PhoneFrame, BottomNav, icons |
| `mm-screens-a.jsx` | Screens 1–4: Splash, Login, Dashboard, Donations list |
| `mm-screens-b.jsx` | Screens 5–9: Payment sheet, Donor mgmt, Add donor, Reports, Toast |
| `mm-logo-colors.jsx` | Logo variants, full colour palette swatches, component library |
| `mm-desktop.jsx` | All four desktop screens with top nav |

Open `Maidan-e-Muhammad Design.html` in a browser (served locally, not file://) to explore all screens interactively. Click any artboard to fullscreen it.

---

## What NOT to Change

- All GraphQL queries and mutations in `src/graphql/`
- All hooks: `useDashboardSummary`, `useLogin`
- `AuthContext`, `PrivateRoute`
- Apollo client setup
- Routing structure in `App.jsx`
- All `data-testid` attributes (required for E2E tests)
- Form validation logic
- The `window.print()` PDF export

---

## Suggested Implementation Order

1. **Tokens** — Update `:root` in `index.css` first; many existing class references will inherit improvements for free
2. **Navbar** — Logo + nav links + user section
3. **Login** — Green hero + white card (isolated, easy win)
4. **Dashboard** — Stat cards + welcome panel
5. **Donations** — Donor list rows + payment bottom sheet + toast
6. **Donors** — Table + form panel
7. **Reports** — Summary cards + collector table
8. **Bottom nav** — Add mobile nav component, hide Navbar on mobile
