// tests/api/booking.test.ts
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/booking/route';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
    },
  }));
});

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/booking POST', () => {
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({ userId: 'test-user-id' } as any);
    mockStripe = new Stripe('test-key') as jest.Mocked<Stripe>;
  });

  it('should create booking with successful payment', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_test123',
      status: 'succeeded',
      client_secret: 'pi_test123_secret',
    } as Stripe.PaymentIntent);

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '2024-08-10T10:00:00Z',
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.paymentIntentId).toBe('pi_test123');
  });

  it('should handle 3D Secure authentication required', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_test123',
      status: 'requires_action',
      client_secret: 'pi_test123_secret',
    } as Stripe.PaymentIntent);

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '2024-08-10T10:00:00Z',
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.requires_action).toBe(true);
    expect(data.payment_intent.client_secret).toBe('pi_test123_secret');
  });

  it('should return 401 for unauthenticated requests', async () => {
    mockAuth.mockReturnValue({ userId: null } as any);

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '2024-08-10T10:00:00Z',
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should validate pickup details', async () => {
    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '', // Invalid time
          address: 'Too short', // Too short address
          contact: '', // Missing contact
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should handle payment failures', async () => {
    mockStripe.paymentIntents.create.mockResolvedValue({
      id: 'pi_test123',
      status: 'requires_payment_method',
    } as Stripe.PaymentIntent);

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '2024-08-10T10:00:00Z',
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Payment failed');
  });

  it('should handle Stripe API errors', async () => {
    mockStripe.paymentIntents.create.mockRejectedValue(
      new Error('Your card was declined.')
    );

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: '2024-08-10T10:00:00Z',
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Payment declined. Please check your payment method.');
  });

  it('should validate future pickup time', async () => {
    const pastTime = new Date();
    pastTime.setHours(pastTime.getHours() - 1);

    const request = new NextRequest('http://localhost/api/booking', {
      method: 'POST',
      body: JSON.stringify({
        quoteId: 'quote-123',
        pickupDetails: {
          scheduledTime: pastTime.toISOString(),
          address: '123 Main St, Newark, NJ 07102',
          contact: 'John Doe - (201) 555-0123',
        },
        paymentMethodId: 'pm_test123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});