# Content Model (Programmatic SEO)

## Types
- `lanePage`: `{ originAirport, destAirport, serviceLevel, headline, intro, steps[], faq[], landmarks[], jsonLd }`
- `locationPage`: `{ city, zipList[], nearbyAirports[], copyBlocks[], faq[], jsonLd }`

## Slugs
- Lane: `nj-to-{destAirportLower}-{service}`
- Location: `{city-kebab}-air-cargo-nj`

## Validation
- Minimum 900 words; duplication < 15%.
- JSON-LD required for `Service` and `FAQPage`.
