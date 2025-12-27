# Client Architecture

## Directory Structure

- **src/pages**: 
  - Contains route-level components (Page components).
  - Each page component should handle data fetching and pass data to child components.
  - Structure should mirror the route hierarchy (e.g., `src/pages/admin/bookings/`).

- **src/components**: 
  - Contains reusable UI components.
  - **src/components/ui**: Primitive components (e.g., from Shadcn UI).
  - **src/components/common** (optional): App-specific shared components.
  - Avoid placing feature-specific logic here if possible; keep them in `pages` or specialized feature folders.

- **src/lib**: 
  - Configuration and library initialization (e.g., `supabase.ts`).

- **src/types**: 
  - TypeScript type definitions shared across the app.

## Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `BookingsManagement.tsx`).
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`).
- **Utilities**: camelCase (e.g., `formatDate.ts`).
- **Directories**: 
  - Component directories: PascalCase or kebab-case (be consistent).
  - Page directories: kebab-case (matches URL structure).

## Prevention of Duplicates

1. **Check before creating**: Before creating a new component, check `src/components` and `src/components/ui`.
2. **Move, don't copy**: When refactoring code (e.g., moving from `components` to `pages`), ensure the old file is deleted after verification.
3. **Single Source of Truth**: Avoid having two files with the same name and similar purpose in different directories (e.g., `components/admin/Feature.tsx` vs `pages/admin/feature/Feature.tsx`). Choose one location based on whether it's a reusable component or a page.
