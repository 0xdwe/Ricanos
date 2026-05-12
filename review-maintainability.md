# Maintainability Review: src/app/events/[slug]/page.tsx

Reviewed: 2026-05-12T18:16:43Z

## Review

### Correct: What is already good

- **Consistent slate background hierarchy**: `slate-950` (main bg) → `slate-900` (sections) → `slate-800` (interactive elements) is used consistently throughout
- **Ring pattern consistency**: `ring-1 ring-white/10` is the standard border treatment across all major containers (header, sections, table, cards)
- **Shadow pattern consistency**: `shadow-xl shadow-blue-500/10` (header), `shadow-xl shadow-blue-500/5` (sections), `shadow-lg shadow-blue-500/30` (CTAs) follows a clear hierarchy
- **Blue glow effect**: `shadow-[0_0_12px_rgba(59,130,246,0.8)]` and `shadow-[0_0_8px_rgba(59,130,246,0.8)]` used consistently for live indicators
- **Component structure**: Clean separation between Dashboard, MatchSection, and UnavailableShell
- **Accessibility**: Proper semantic HTML, ARIA labels, sr-only labels for form inputs

### Blocker: None

No critical issues found. All findings below are maintainability improvements.

### Note: Maintainability improvements

#### 1. Unused helper function (line 267-269)
**Location**: `formatEventMeta` function at end of file
**Issue**: Function is defined but never called. The inline implementation at line 52 duplicates this logic.
**Evidence**:
```tsx
// Line 52 - inline usage
{[dashboard.event.format, dashboard.event.pairingMode.replace("_", " "), dashboard.event.status, dashboard.event.eventDate, dashboard.event.venueName].filter(Boolean).map((tag, i) => (

// Line 267-269 - unused function
function formatEventMeta(dashboard: PublicDashboardData): string {
  return [dashboard.event.format, dashboard.event.pairingMode.replace("_", " "), dashboard.event.status, dashboard.event.eventDate, dashboard.event.venueName].filter(Boolean).join(" · ");
}
```
**Recommendation**: Remove the unused function or refactor line 52 to use it (though the current inline approach is more appropriate for rendering tags).

#### 2. Duplicate color declarations for rank badges
**Location**: Lines 119, 135, 161, 177
**Issue**: Rank badge styling `bg-blue-600 text-white shadow-lg shadow-blue-500/30` vs `bg-slate-700 text-slate-300` is repeated 4 times (mobile card, desktop table, both components).
**Evidence**:
```tsx
// Line 119 - mobile card
className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${standing.rank <= 3 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-700 text-slate-300"}`}

// Line 161 - desktop table
className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${standing.rank <= 3 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" : "bg-slate-700 text-slate-300"}`}
```
**Recommendation**: Extract to a helper function:
```tsx
function getRankBadgeClasses(rank: number, size: 'sm' | 'lg' = 'sm') {
  const sizeClasses = size === 'lg' ? 'h-12 w-12 text-lg' : 'h-8 w-8';
  const colorClasses = rank <= 3 
    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
    : 'bg-slate-700 text-slate-300';
  return `flex items-center justify-center rounded-full font-bold ${sizeClasses} ${colorClasses}`;
}
```

#### 3. Duplicate highlight styling pattern
**Location**: Lines 113, 155, 211
**Issue**: Highlighted item styling is repeated across mobile cards, desktop table rows, and match cards.
**Evidence**:
```tsx
// Line 113 - mobile standing card
className={`relative overflow-hidden rounded-2xl p-5 transition-all ${standing.highlighted ? "bg-blue-950/50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500" : "bg-slate-800/50 ring-1 ring-white/10"}`}

// Line 155 - desktop table row
className={`transition-colors ${standing.highlighted ? "bg-blue-950/30" : "hover:bg-slate-800/50"}`}

// Line 211 - match card
className={`relative overflow-hidden rounded-xl p-5 transition-all ${match.highlighted ? "bg-blue-950/50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500" : "bg-slate-800/50 hover:bg-slate-800 ring-1 ring-white/10"}`}
```
**Recommendation**: Extract to helper function:
```tsx
function getHighlightClasses(highlighted: boolean, variant: 'card' | 'table-row' = 'card') {
  if (variant === 'table-row') {
    return highlighted ? 'bg-blue-950/30' : 'hover:bg-slate-800/50';
  }
  return highlighted 
    ? 'bg-blue-950/50 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500'
    : 'bg-slate-800/50 hover:bg-slate-800 ring-1 ring-white/10';
}
```

#### 4. Duplicate highlight accent bar
**Location**: Lines 114, 212
**Issue**: Blue accent bar for highlighted items is duplicated.
**Evidence**:
```tsx
// Line 114 - standing card
{standing.highlighted && <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}

// Line 212 - match card
{match.highlighted && <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
```
**Recommendation**: Extract to component:
```tsx
function HighlightAccent({ show }: { show: boolean }) {
  if (!show) return null;
  return <div className="absolute left-0 top-0 h-full w-1.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />;
}
```

#### 5. Duplicate status badge styling
**Location**: Lines 214, 216
**Issue**: Status badge colors are duplicated in match cards.
**Evidence**:
```tsx
className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${match.status === 'completed' ? 'bg-slate-700 text-slate-300' : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30'}`}
```
**Recommendation**: Extract to helper:
```tsx
function getStatusBadgeClasses(status: string) {
  return status === 'completed'
    ? 'bg-slate-700 text-slate-300'
    : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
}
```

#### 6. Duplicate point difference badge styling
**Location**: Line 172
**Issue**: Complex ternary for point difference colors could be extracted.
**Evidence**:
```tsx
className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${standing.pointDifference > 0 ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30' : standing.pointDifference < 0 ? 'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30' : 'bg-slate-700/50 text-slate-400 ring-1 ring-inset ring-slate-600/30'}`}
```
**Recommendation**: Extract to helper:
```tsx
function getPointDiffClasses(diff: number) {
  if (diff > 0) return 'bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-500/30';
  if (diff < 0) return 'bg-red-500/20 text-red-300 ring-1 ring-inset ring-red-500/30';
  return 'bg-slate-700/50 text-slate-400 ring-1 ring-inset ring-slate-600/30';
}
```

#### 7. Duplicate decorative gradient blob
**Location**: Lines 57, 246
**Issue**: Decorative gradient blob in header is duplicated in Dashboard and UnavailableShell.
**Evidence**:
```tsx
<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl mix-blend-screen sm:-right-10 sm:-top-10 sm:h-96 sm:w-96"></div>
```
**Recommendation**: Extract to component:
```tsx
function DecorativeBlob() {
  return (
    <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl mix-blend-screen sm:-right-10 sm:-top-10 sm:h-96 sm:w-96" />
  );
}
```

#### 8. Inconsistent padding between sections
**Location**: Lines 63, 88, 195, 237, 251, 257
**Issue**: Most sections use `p-6 sm:p-8`, but some variations exist. This is actually consistent, but worth documenting.
**Evidence**: All major sections consistently use `p-6 sm:p-8` except the header which uses `p-8 sm:p-12` (intentionally larger).
**Status**: No action needed - pattern is intentional and consistent.

#### 9. Duplicate refresh button styling
**Location**: Lines 82, 239, 253
**Issue**: Refresh button appears 3 times with identical styling.
**Evidence**:
```tsx
<a className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700 hover:text-white ring-1 ring-white/10" href={refreshHref}>Refresh</a>
```
**Recommendation**: Extract to component:
```tsx
function RefreshButton({ href }: { href: string }) {
  return (
    <a 
      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 shadow-sm transition-colors hover:bg-slate-700 hover:text-white ring-1 ring-white/10" 
      href={href}
    >
      Refresh
    </a>
  );
}
```

#### 10. Duplicate floating refresh FAB
**Location**: Lines 189-197, 261-269
**Issue**: Floating action button for mobile refresh is duplicated in Dashboard and UnavailableShell.
**Evidence**: Identical structure and styling in both components.
**Recommendation**: Extract to component:
```tsx
function FloatingRefreshButton({ href }: { href: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:hidden">
      <a 
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-bold text-white shadow-xl shadow-blue-500/30 backdrop-blur-md transition-transform active:scale-[0.98]" 
        href={href}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        {href === "?" ? "Refresh scores" : "Refresh Live Scores"}
      </a>
    </div>
  );
}
```

## Summary

The file demonstrates **excellent color token consistency** and follows a clear design system:
- Background hierarchy: `slate-950` → `slate-900` → `slate-800`
- Ring borders: `ring-1 ring-white/10` standard, `ring-2 ring-blue-500` for highlights
- Shadows: `shadow-xl shadow-blue-500/10` (headers), `shadow-xl shadow-blue-500/5` (sections), `shadow-lg shadow-blue-500/30` (CTAs)
- Glow effects: `shadow-[0_0_12px_rgba(59,130,246,0.8)]` for live indicators

**Primary maintainability concern**: Significant duplication of styling logic and component structures that could be extracted into reusable helpers/components. The file is 269 lines; extracting the 10 identified patterns could reduce it to ~180-200 lines while improving consistency and making future style updates easier.

**No functional issues found**. All duplication is cosmetic/maintainability-focused.

**Recommended priority**:
1. Remove unused `formatEventMeta` function (quick win)
2. Extract highlight styling patterns (highest duplication impact)
3. Extract rank badge helper (used 4 times)
4. Extract other badge/button components as needed

All changes are safe refactors with no behavioral impact.
