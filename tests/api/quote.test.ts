// tests/api/quote.test.ts
import { NextRequest } from 'next/server';
import { POST } from '../../app/api/quote/route';

// Mock the rating engine
jest.mock('../../app/lib/rating/engine', () => ({
  rateQuote: jest.fn(),
}));

// Mock Clerk auth
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

import { rateQuote } from '../../app/lib/rating/engine';
import { auth } from '@clerk/nextjs/server';

const mockRateQuote = rateQuote as jest.MockedFunction<typeof rateQuote>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('/api/quote POST', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockReturnValue({ userId: 'test-user-id' } as any);
  });

  it('should return rates for valid quote request', async () => {
    const mockRates = [
      {
        laneId: 'cal-JFK-GEO',
        carrier: 'Caribbean Airlines',
        serviceLevel: 'EXPRESS' as const,
        transitTime: 1,
        totalPrice: 150.00,
        breakdown: {
          baseRate: 120.00,
          fuelSurcharge: 14.40,
          securityFee: 15.60,
        },
        cutOffTime: '14:00',
        departureAirport: 'JFK',
        arrivalAirport: 'GEO',
        validUntil: '2024-08-10T14:00:00Z',
      },
    ];

    mockRateQuote.mockResolvedValue(mockRates);

    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces: [{ type: 'box', weight: 10 }],
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.rates).toEqual(mockRates);
    expect(mockRateQuote).toHaveBeenCalledWith({
      originZip: '07001',
      destCountry: 'Guyana',
      pieces: [{ type: 'box', weight: 10 }],
      serviceLevel: 'EXPRESS',
      afterHours: false,
      isPersonalEffects: false,
    });
  });

  it('should return 401 for unauthenticated requests', async () => {
    mockAuth.mockReturnValue({ userId: null } as any);

    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces: [{ type: 'box', weight: 10 }],
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return validation errors for invalid input', async () => {
    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: 'invalid-zip',
        destCountry: '', // Empty country
        pieces: [], // No pieces
        serviceLevel: 'INVALID',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
    expect(data.details).toBeDefined();
  });

  it('should return 404 when no rates are available', async () => {
    mockRateQuote.mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces: [{ type: 'box', weight: 10 }],
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('No rates available for this route');
  });

  it('should handle rating engine errors', async () => {
    mockRateQuote.mockRejectedValue(new Error('Rating service unavailable'));

    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces: [{ type: 'box', weight: 10 }],
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Internal server error');
  });

  it('should validate piece weights within limits', async () => {
    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces: [{ type: 'box', weight: 250 }], // Over 200 lb limit
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should validate total shipment weight', async () => {
    const pieces = Array.from({ length: 5 }, () => ({ type: 'box' as const, weight: 150 }));
    // Total: 750 lbs, exceeds 500 lb limit

    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Guyana',
        pieces,
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });

  it('should validate supported destinations', async () => {
    const request = new NextRequest('http://localhost/api/quote', {
      method: 'POST',
      body: JSON.stringify({
        originZip: '07001',
        destCountry: 'Brazil', // Not supported
        pieces: [{ type: 'box', weight: 10 }],
        serviceLevel: 'EXPRESS',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});