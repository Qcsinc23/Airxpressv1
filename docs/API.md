# API Documentation

## Convex Functions

### Quotes
- `createQuote` - Create a new quote with input data and computed rates
- `getQuote` - Get a specific quote by ID
- `getQuotesByUser` - Get all quotes for a specific user

### Bookings
- `createBooking` - Create a new booking from a quote
- `updateBookingStatus` - Update the status of a booking
- `getBooking` - Get a specific booking by ID
- `getBookingsByStatus` - Get all bookings with a specific status

### Lanes
- `getActiveLanes` - Get all active shipping lanes
- `getLanesByOD` - Get lanes by origin and destination

### Content
- `getContentByTypeAndSlug` - Get content by type and slug
- `getContentByType` - Get all content of a specific type

## REST API Routes

### Public Routes
- `GET /api/quote` - Get a quote (no auth required)
- `GET /api/tracking/:id` - Get tracking information for a shipment

### Authenticated Routes
- `POST /api/quote` - Create a new quote
- `POST /api/booking` - Create a new booking
- `GET /api/user/quotes` - Get all quotes for the current user
- `GET /api/user/bookings` - Get all bookings for the current user

## Webhooks
- `POST /api/webhook/stripe` - Handle Stripe payment events
- `POST /api/webhook/caribbean-airlines` - Handle Caribbean Airlines tracking updates
- `POST /api/webhook/delta` - Handle Delta tracking updates
