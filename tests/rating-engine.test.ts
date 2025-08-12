// tests/rating-engine.test.ts
import { rateQuote } from '../app/lib/rating/engine';
import { RateInput } from '../app/types/shipping';

describe('Rating Engine', () => {
  test('calculates rates for Guyana destination', async () => {
    const input: RateInput = {
      originZip: '07001',
      destCountry: 'Guyana',
      pieces: [
        { type: 'box', weight: 10 }
      ],
      serviceLevel: 'EXPRESS'
    };

    const rates = await rateQuote(input);
    
    expect(rates).toHaveLength(1);
    expect(rates[0].carrier).toBe('Caribbean Airlines');
    expect(rates[0].totalPrice).toBeGreaterThan(0);
  });

  test('calculates rates for Trinidad destination', async () => {
    const input: RateInput = {
      originZip: '07001',
      destCountry: 'Trinidad',
      pieces: [
        { type: 'box', weight: 10 }
      ],
      serviceLevel: 'EXPRESS'
    };

    const rates = await rateQuote(input);
    
    expect(rates).toHaveLength(1);
    expect(rates[0].carrier).toBe('Delta Cargo');
    expect(rates[0].totalPrice).toBeGreaterThan(0);
  });

  test('calculates rates for multiple pieces', async () => {
    const input: RateInput = {
      originZip: '07001',
      destCountry: 'Guyana',
      pieces: [
        { type: 'box', weight: 10 },
        { type: 'box', weight: 15 }
      ],
      serviceLevel: 'EXPRESS'
    };

    const rates = await rateQuote(input);
    expect(rates).toHaveLength(1);
    
    const totalWeight = input.pieces.reduce((sum, piece) => sum + piece.weight, 0);
    expect(rates[0].totalPrice).toBeGreaterThan(0);
  });

  test('applies after hours fee when requested', async () => {
    const input: RateInput = {
      originZip: '07001',
      destCountry: 'Guyana',
      pieces: [
        { type: 'box', weight: 10 }
      ],
      serviceLevel: 'EXPRESS',
      afterHours: true
    };

    const rates = await rateQuote(input);
    
    expect(rates).toHaveLength(1);
    expect(rates[0].breakdown.afterHoursFee).toBe(25);
  });
});
