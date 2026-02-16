1. ARCHITECTURE: THE 3-LAYER PROTOCOL [NON-NEGOTIABLE]
- To prevent "Spaghetti Code", you must strictly separate concerns:
    - Layer 1: Service (src/services/*.ts)
        - Role: The "Dumb" Bridge. Pure Axios calls only.
        - Constraint: NO React hooks, NO state, NO UI logic.
        - Return: Typed Promises (e.g., Promise<ApiResponse<User>>).
    - Layer 2: Hooks (src/hooks/*.ts)
        - Role: The "Brain". Manages State, Caching (React Query), and Side Effects.
        - Constraint: NEVER expose axios or fetch directly to the UI.
    - Layer 3: UI Component (src/components/**/*.ts)
        - Role: The "Face". Consumes Hooks only.
        - Constraint: It should not know how data is fetched, only that it is available.

2. STRICT CODING STANDARDS
- Max Lines Per File: 200 lines.
    - Strategy: If a Service file grows too large (e.g., worker.service.ts), split it by    feature (e.g., worker.orders.service.ts, worker.history.service.ts).

- Max Lines Per Function: 15 lines.
    - Context: Applies to onSuccess callbacks, useEffect logic, and data transformers.
    - Strategy: Extract logic into small, named private helper functions within the file.
    - Variable Naming: Explicit and descriptive (e.g., isOrderSubmitting instead of loading).

3. TYPE SAFETY & DTO MIRRORING
- No 'any': usage of any is strictly FORBIDDEN.

- DTO Synchronization:
    - Create interfaces in src/types/ that EXACTLY mirror the Backend's JSON response.
    - Example: If Backend sends { data: { id, name }, meta: { page } }, Frontend must have:
    TypeScript
    interface PaginatedResponse<T> {
      data: T[];
      meta: { page: number; limit: number; total: number };
    }

4. STATE MANAGEMENT (TanStack Query)
- Queries (GET): Must use useQuery.
    - Keys: Use a consistent Query Key Factory (e.g., ['attendance', 'dashboard', employeeId]).
    - Stale Time: Set appropriate staleTime (e.g., 5 minutes for Dashboard) to avoid spamming the backend.
- Mutations (POST/PUT/DELETE): Must use useMutation.
    - Optimistic Updates: Forbidden for high-risk data (Money/Stock).
    - Invalidation: Always invalidate related queries on success (e.g., after ClockIn, invalidate ['attendance', 'dashboard']).

5. ERROR HANDLING
    - Centralized Handling: Do not clutter UI with try/catch.
    - Service Layer: Axios Interceptor must handle 401 (Redirect to Login) automatically.
    - Hook Layer: onError callback should trigger a Toast Notification (UI Feedback).
    - UI Layer: Use "Error Boundaries" or specific Error States (Red Text/Alerts) provided by the Hook (isError).

6. INPUT VALIDATION (Zod)
    - Forms: All user inputs (Login, Quantity Bypass, etc.) must be validated with Zod Schemas before being sent to the Service Layer.
    - Schema Location: Keep schemas in src/lib/schemas/ or co-located with the Form component.