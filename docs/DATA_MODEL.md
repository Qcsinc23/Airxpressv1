# Data Model (Convex)

## Tables
- `users` – Clerk mapping + role + audit timestamps.
- `companies` – shipper/consignee/partnerIAC/vendor.
- `lanes` – O/D, service level, cut-offs, surcharges.
- `quotes` – inputs, computedRates[], chosen lane, expiry.
- `bookings` – status, docs, tracking[], paymentId.
- `contentTypes` / `contents` – programmatic SEO content.
- `auditLogs` – actor/action/target.
- `flags` – feature flags by env.

## Mermaid ER
```mermaid
erDiagram
users ||--o{ quotes : creates
quotes ||--o{ bookings : confirms
bookings }o--|| lanes : uses
users }o--o{ companies : belongs_to
contents }o--|| contentTypes : typed

Indexing

users.byExternalId, companies.byType, lanes.byOD, quotes.byUser, bookings.byStatus, contents.byTypeSlug.
