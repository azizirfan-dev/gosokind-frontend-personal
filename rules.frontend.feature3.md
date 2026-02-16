# MASTER RULES: FRONTEND (Next.js Mobile First) - V2.0 (STRICT)

## 1. GENERAL CODING STANDARDS (Non-Negotiable)
- **Max Lines Per File:** 200 lines.
  - *Strategy:* If a Component exceeds this, break it down immediately into sub-components (e.g., `OrderCard.tsx` -> `OrderHeader.tsx`, `OrderItemList.tsx`).
- **Max Lines Per Function:** 15 lines.
  - *Context:* Applies to LOGIC functions (handlers, effects, helpers).
  - *Exception:* JSX return statements can be longer, but if the JSX tree is deep, extract parts into smaller components.
- **Variable Naming:** Descriptive and clear (e.g., `isSidebarOpen` instead of `open`).
- **No Hardcoded Magic Strings:** Use Constants or Enums.

## 2. ARCHITECTURE & FOLDER STRUCTURE
- **Work Directory:** ONLY work in `src/`.
- **Layered Architecture:**
  - `src/app`: Routes & Pages (Server Components).
  - `src/components`: UI Building blocks (Client Components).
  - `src/hooks`: Business Logic (State & Effects).
  - `src/services`: API Integration (Axios).
- **Component Separation:**
  - `ui/`: Generic atoms (Button, Input).
  - `features/`: Domain-specific organisms (AttendanceCard, JobRadar).
  - `layout/`: Structural (Sidebar, BottomNav).

## 3. UI/UX & STYLING (Mobile First Strategy)
- **Tailwind Only:** No CSS modules.
- **Responsiveness Rule:** Write for **Mobile** first, then override for Desktop.
  - *Correct:* `w-full md:w-64` (Default is mobile).
- **Touch Targets:** Interactive elements must be `min-height: 44px`.
- **Safe Area:** Account for bottom navigation bar on mobile (`pb-20` for main content).

## 4. NEXT.JS PROTOCOL
- **'use client' Usage:** Minimal usage. Push it down to the leaves (buttons/forms). Keep Pages as Server Components when possible.
- **Data Fetching:** NEVER use `useEffect` for data. MUST use **TanStack Query**.

## 5. API INTEGRATION (The 3-Layer Rule)
- **Layer 1 (Service):** Pure Axios functions in `src/services/`. Return typed Promises.
- **Layer 2 (Hook):** React Query wrappers in `src/hooks/`. Handle `isLoading`, `isError`.
- **Layer 3 (UI):** Component calls Hook. Component is "dumb" (doesn't know endpoint URLs).

## 6. TYPE SAFETY
- **Strict Types:** No `any`. Define Interfaces for Props and API Responses.
- **Zod Validation:** All Forms must use `zod` schema validation.