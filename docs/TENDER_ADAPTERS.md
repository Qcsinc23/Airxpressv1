# Tender Adapters

We abstract how a booking is tendered to the carrier/partner.

## Modes
- `partner` – default. Use Partner IAC to book AWB & screening.
- `airline` – direct airline API where available.
- `iac` – once AirXpress becomes an IAC.

## Interface
```ts
export interface TenderAdapter {
  create(booking: Booking): Promise<{ partnerRef: string; screeningSlot?: string }>
  cancel(bookingId: Id<'bookings'>): Promise<void>
}

Files

lib/tender/PartnerIACAdapter.ts

lib/tender/CaribbeanAirlinesAdapter.ts (stub)

lib/tender/DeltaCargoAdapter.ts (stub)

Feature Flag

Read flags or process.env.TENDER_MODE to select adapter.
