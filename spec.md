# Specification

## Summary
**Goal:** Build a skin care products catalog app with browse/search/filter, product details, and authenticated product management backed by a persistent Motoko canister.

**Planned changes:**
- Implement a persistent Product data model in the Motoko backend with fields: id, name, brand, category, skinType, keyIngredients, concerns, price (number + currency), description, usageInstructions, imageUrl; generate unique ids.
- Add backend methods: listProducts (with optional filters: search text, category, skinType, concerns, minPrice, maxPrice; deterministic ordering), getProductById, createProduct, updateProduct, deleteProduct.
- Enforce authorization: anonymous can browse (list/get); only Internet Identity-authenticated users can create/update/delete, with clear error messages when unauthenticated.
- Build React UI: catalog page with product grid/list (image, name, brand, category, skinType, price), search input, and filter controls (category, skin type, concern, price range), plus loading/error/empty states in English.
- Add product details view (route or modal) that fetches by id and displays all fields, including description, ingredients, concerns, and usage instructions; show “Product not found” for invalid/missing ids.
- Add authenticated management UI: sign-in gated create/edit/delete screens/forms with client-side validation for required fields; hide/disable management actions when signed out and prompt to sign in.
- Use React Query for all fetching and mutations with cache invalidation so list and details stay in sync after create/update/delete.
- Apply a consistent clean, minimalist warm-neutral visual theme across pages (avoid blue/purple as primary colors), using Tailwind and composed existing UI components.
- Add static generated frontend assets (logo + hero) under `frontend/public/assets/generated` and display them in the header and home page.

**User-visible outcome:** Users can browse and search/filter a skin care product catalog and view full product details; signed-in users can create, edit, and delete products, with the UI updating immediately after changes.
