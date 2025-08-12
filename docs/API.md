# AirXpress API Documentation

## 📋 Overview

The AirXpress API provides comprehensive freight management capabilities including quoting, booking, tracking, and payment processing. All endpoints use JSON for request/response payloads and follow REST principles.

**Base URL**: `https://your-domain.com/api`  
**API Version**: v1  
**Last Updated**: August 12, 2024

## 🔐 Authentication

AirXpress uses Clerk for authentication. All protected endpoints require a valid JWT token.

### Authentication Header
```http
Authorization: Bearer <jwt_token>
```

### Getting Your Token
1. **Web Application**: Token automatically included in client requests
2. **API Access**: Use Clerk's API to generate tokens programmatically
3. **Development**: Use the Clerk dashboard to generate test tokens

## 🏷️ User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `guest` | Unauthenticated user | View quotes only |
| `user` | Regular customer | Create bookings, view own data |
| `support` | Support agent | Customer assistance, view user data |
| `operations` | Operations team | Shipment management, tracking |
| `admin` | Administrator | Full access, pricing management |

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-08-12T10:30:00Z",
    "version": "1.0",
    "requestId": "req_123456789"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "weight",
      "reason": "Weight must be greater than 0"
    }
  },
  "meta": {
    "timestamp": "2024-08-12T10:30:00Z",
    "version": "1.0",
    "requestId": "req_123456789"
  }
}
```

## 🔗 Endpoints

---

## Quote System

### POST /api/quote

Generate freight quotes based on shipment parameters.

**Authentication**: None required  
**Rate Limit**: 100 requests/hour per IP

#### Request Body
```json
{
  "origin": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "destination": {
    "address": "456 Oak Ave", 
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90210",
    "country": "US"
  },
  "packages": [
    {
      "weight": 25,
      "length": 24,
      "width": 18,
      "height": 12,
      "type": "box",
      "value": 500
    }
  ],
  "serviceType": "standard", // "standard" | "express" | "overnight"
  "paidOutsideUSA": false,
  "requiresSignature": true
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "quoteId": "quote_abc123",
    "rates": [
      {
        "id": "rate_xyz789",
        "carrier": "FedEx",
        "service": "Ground",
        "transitTime": "2-3 business days",
        "price": {
          "total": 45.99,
          "currency": "USD",
          "breakdown": {
            "freight": 38.32,
            "packaging": 5.67,
            "surcharges": 2.00
          }
        },
        "eligibility": {
          "jetPakEligible": true,
          "restrictions": []
        }
      }
    ],
    "expiresAt": "2024-08-12T18:30:00Z"
  }
}
```

#### Error Codes
- `400 VALIDATION_ERROR` - Invalid input parameters
- `422 LOCATION_NOT_SERVICEABLE` - Origin/destination not serviceable
- `429 RATE_LIMIT_EXCEEDED` - Too many requests
- `500 QUOTE_SERVICE_ERROR` - External service error

---

### GET /api/quote/{quoteId}

Retrieve a previously generated quote.

**Authentication**: None required  
**Rate Limit**: 200 requests/hour per IP

#### Path Parameters
- `quoteId` (string): Quote identifier

#### Response
```json
{
  "success": true,
  "data": {
    "quoteId": "quote_abc123",
    "rates": [...], // Same as POST response
    "createdAt": "2024-08-12T10:30:00Z",
    "expiresAt": "2024-08-12T18:30:00Z",
    "status": "active" // "active" | "expired" | "booked"
  }
}
```

---

## Booking Management

### POST /api/booking

Create a new shipment booking from a quote.

**Authentication**: Required  
**Roles**: `user`, `operations`, `admin`

#### Request Body
```json
{
  "quoteId": "quote_abc123",
  "rateId": "rate_xyz789",
  "shipper": {
    "name": "John Doe",
    "company": "Acme Corp",
    "phone": "+1-555-123-4567",
    "email": "john@acme.com",
    "address": {
      "address": "123 Main St",
      "city": "New York", 
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    }
  },
  "recipient": {
    "name": "Jane Smith",
    "company": "Beta LLC",
    "phone": "+1-555-987-6543", 
    "email": "jane@beta.com",
    "address": {
      "address": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA", 
      "zipCode": "90210",
      "country": "US"
    }
  },
  "packages": [
    {
      "description": "Electronics",
      "weight": 25,
      "dimensions": {
        "length": 24,
        "width": 18, 
        "height": 12
      },
      "value": 500,
      "packagingType": "box"
    }
  ],
  "specialInstructions": "Handle with care",
  "paymentMethod": "stripe" // "stripe" | "invoice" | "account"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_def456", 
    "trackingNumber": "TRK789012345",
    "status": "confirmed",
    "estimatedDelivery": "2024-08-15T17:00:00Z",
    "documents": {
      "shippingLabel": "https://docs.airxpress.com/labels/booking_def456.pdf",
      "invoice": "https://docs.airxpress.com/invoices/booking_def456.pdf"
    },
    "payment": {
      "status": "pending",
      "amount": 45.99,
      "paymentUrl": "https://checkout.stripe.com/pay/..."
    }
  }
}
```

---

### GET /api/booking

Retrieve user's bookings with pagination and filtering.

**Authentication**: Required  
**Roles**: `user`, `support`, `operations`, `admin`

#### Query Parameters
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 100)
- `status` (string): Filter by status (`pending`, `confirmed`, `in_transit`, `delivered`, `cancelled`)
- `startDate` (string): ISO date string for date range filter
- `endDate` (string): ISO date string for date range filter
- `search` (string): Search by tracking number or recipient name

#### Response
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingId": "booking_def456",
        "trackingNumber": "TRK789012345", 
        "status": "in_transit",
        "createdAt": "2024-08-12T10:30:00Z",
        "estimatedDelivery": "2024-08-15T17:00:00Z",
        "recipient": {
          "name": "Jane Smith",
          "city": "Los Angeles",
          "state": "CA"
        },
        "service": "FedEx Ground",
        "totalCost": 45.99
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /api/booking/{bookingId}

Retrieve detailed information for a specific booking.

**Authentication**: Required  
**Roles**: `user` (own bookings), `support`, `operations`, `admin`

#### Path Parameters
- `bookingId` (string): Booking identifier

#### Response
```json
{
  "success": true,
  "data": {
    "bookingId": "booking_def456",
    "trackingNumber": "TRK789012345",
    "status": "in_transit", 
    "createdAt": "2024-08-12T10:30:00Z",
    "estimatedDelivery": "2024-08-15T17:00:00Z",
    "shipper": {
      "name": "John Doe",
      "company": "Acme Corp",
      "address": {...}
    },
    "recipient": {
      "name": "Jane Smith", 
      "company": "Beta LLC",
      "address": {...}
    },
    "packages": [...],
    "service": {
      "carrier": "FedEx",
      "service": "Ground",
      "transitTime": "2-3 business days"
    },
    "pricing": {
      "subtotal": 43.99,
      "taxes": 2.00,
      "total": 45.99,
      "breakdown": {...}
    },
    "documents": {
      "shippingLabel": "https://docs.airxpress.com/labels/booking_def456.pdf",
      "invoice": "https://docs.airxpress.com/invoices/booking_def456.pdf",
      "receipt": "https://docs.airxpress.com/receipts/booking_def456.pdf"
    },
    "timeline": [
      {
        "timestamp": "2024-08-12T10:30:00Z",
        "status": "confirmed",
        "description": "Booking confirmed",
        "location": "New York, NY"
      },
      {
        "timestamp": "2024-08-12T15:45:00Z",
        "status": "picked_up", 
        "description": "Package picked up",
        "location": "New York, NY"
      }
    ]
  }
}
```

---

### PUT /api/booking/{bookingId}

Update a booking (limited fields based on status).

**Authentication**: Required  
**Roles**: `operations`, `admin`

#### Request Body
```json
{
  "specialInstructions": "Updated instructions",
  "recipient": {
    "phone": "+1-555-999-8888" // Only if not yet shipped
  }
}
```

---

### DELETE /api/booking/{bookingId}

Cancel a booking (only if not yet shipped).

**Authentication**: Required  
**Roles**: `user` (own bookings), `operations`, `admin`

---

## Tracking

### GET /api/tracking/{trackingNumber}

Get real-time tracking information for a shipment.

**Authentication**: None required  
**Rate Limit**: 500 requests/hour per IP

#### Path Parameters
- `trackingNumber` (string): Tracking number

#### Response
```json
{
  "success": true,
  "data": {
    "trackingNumber": "TRK789012345",
    "status": "in_transit",
    "estimatedDelivery": "2024-08-15T17:00:00Z",
    "currentLocation": "Chicago, IL",
    "events": [
      {
        "timestamp": "2024-08-12T10:30:00Z",
        "status": "label_created",
        "description": "Shipping label created",
        "location": "New York, NY"
      },
      {
        "timestamp": "2024-08-12T15:45:00Z", 
        "status": "picked_up",
        "description": "Package picked up by carrier",
        "location": "New York, NY"
      },
      {
        "timestamp": "2024-08-13T08:20:00Z",
        "status": "in_transit",
        "description": "Package in transit",
        "location": "Chicago, IL"
      }
    ],
    "carrier": "FedEx",
    "service": "Ground"
  }
}
```

---

## Payment Processing

### POST /api/payment/create-intent

Create a Stripe payment intent for a booking.

**Authentication**: Required  
**Roles**: `user`, `operations`, `admin`

#### Request Body
```json
{
  "bookingId": "booking_def456",
  "paymentMethod": "card", // "card" | "bank_account"
  "currency": "USD"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abc123",
    "amount": 4599, // Amount in cents
    "currency": "USD",
    "paymentIntentId": "pi_1234567890"
  }
}
```

---

### POST /api/payment/confirm

Confirm payment completion and update booking status.

**Authentication**: Required  
**Roles**: `user`, `operations`, `admin`

---

### GET /api/payment/{bookingId}/status

Get payment status for a booking.

**Authentication**: Required  
**Roles**: `user` (own bookings), `support`, `operations`, `admin`

---

## Document Management

### GET /api/documents/{documentId}

Download a document (shipping label, invoice, etc.).

**Authentication**: Required (document access validated)

#### Path Parameters
- `documentId` (string): Document identifier

#### Response
Returns PDF file stream with appropriate headers.

---

### POST /api/documents/upload

Upload supporting documents for a booking.

**Authentication**: Required  
**Roles**: `user`, `operations`, `admin`

#### Request Body
Multipart form data with files.

---

## Admin APIs

### GET /api/admin/pricing

Get current pricing policies (admin only).

**Authentication**: Required  
**Roles**: `admin`

#### Response
```json
{
  "success": true,
  "data": {
    "policyId": "policy_v1_0",
    "version": "1.0",
    "markups": {
      "freight": 1.80,
      "packaging": 1.50,
      "storage": 2.00,
      "overweight": 1.25
    },
    "surcharges": {
      "paidOutsideUSA": {
        "type": "fixed", // "fixed" | "percentage"
        "amount": 10.00
      }
    },
    "effectiveDate": "2024-08-01T00:00:00Z",
    "updatedAt": "2024-08-12T10:30:00Z",
    "updatedBy": "admin@airxpress.com"
  }
}
```

---

### PUT /api/admin/pricing

Update pricing policies (admin only).

**Authentication**: Required  
**Roles**: `admin`

---

### GET /api/admin/analytics

Get business analytics and metrics.

**Authentication**: Required  
**Roles**: `admin`, `operations`

---

### GET /api/admin/users

Manage user accounts and permissions.

**Authentication**: Required  
**Roles**: `admin`

---

## Webhooks

AirXpress provides webhooks for real-time notifications of important events.

### POST /api/webhooks/register

Register a webhook endpoint.

**Authentication**: Required  
**Roles**: `admin`

#### Request Body
```json
{
  "url": "https://your-app.com/webhooks/airxpress",
  "events": ["booking.created", "tracking.updated", "payment.completed"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `booking.created` | New booking created | Booking object |
| `booking.updated` | Booking status changed | Booking object |
| `tracking.updated` | Tracking status updated | Tracking object |
| `payment.completed` | Payment successfully processed | Payment object |
| `payment.failed` | Payment processing failed | Payment object |

### Webhook Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful request |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid request parameters |
| `401` | Unauthorized | Authentication required |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource conflict |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

### Application Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_REQUIRED` | Valid authentication required |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `QUOTE_EXPIRED` | Quote has expired |
| `BOOKING_CANCELLED` | Booking has been cancelled |
| `PAYMENT_FAILED` | Payment processing failed |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `SERVICE_UNAVAILABLE` | External service unavailable |

---

## Rate Limits

| Endpoint Category | Limit | Window |
|-------------------|-------|---------|
| Quotes | 100 requests | 1 hour |
| Tracking | 500 requests | 1 hour |
| Bookings | 50 requests | 1 hour |
| Payments | 100 requests | 1 hour |
| Admin APIs | 1000 requests | 1 hour |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1692712800
```

---

## SDK and Libraries

### JavaScript/Node.js
```bash
npm install @airxpress/sdk
```

```javascript
import { AirXpress } from '@airxpress/sdk';

const client = new AirXpress({
  apiKey: 'your-api-key',
  environment: 'production' // or 'sandbox'
});

// Create a quote
const quote = await client.quotes.create({
  origin: { city: 'New York', state: 'NY', zipCode: '10001' },
  destination: { city: 'Los Angeles', state: 'CA', zipCode: '90210' },
  packages: [{ weight: 25, length: 24, width: 18, height: 12 }]
});
```

### Python
```bash
pip install airxpress-python
```

### PHP
```bash
composer require airxpress/php-sdk
```

### cURL Examples

#### Get Quote
```bash
curl -X POST https://your-domain.com/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"city": "New York", "state": "NY", "zipCode": "10001"},
    "destination": {"city": "Los Angeles", "state": "CA", "zipCode": "90210"}, 
    "packages": [{"weight": 25, "length": 24, "width": 18, "height": 12}]
  }'
```

#### Track Shipment
```bash
curl -X GET https://your-domain.com/api/tracking/TRK789012345
```

---

## Testing

### Sandbox Environment
- **Base URL**: `https://sandbox.airxpress.com/api`
- **Test API Keys**: Available in dashboard
- **Test Data**: Pre-populated test scenarios

### Test Cards (Stripe)
- Success: `4242424242424242`
- Decline: `4000000000000002`
- 3D Secure: `4000002760003184`

---

## Support

### API Support
- **Email**: api-support@airxpress.com
- **Documentation**: https://docs.airxpress.com
- **Status Page**: https://status.airxpress.com

### SLA
- **Uptime**: 99.9%
- **Response Time**: < 200ms (95th percentile)
- **Support Response**: < 24 hours

---

**API Version**: 1.0  
**Last Updated**: August 12, 2024  
**Changelog**: See [CHANGELOG.md](../CHANGELOG.md)
