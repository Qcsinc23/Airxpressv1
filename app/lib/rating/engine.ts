// app/lib/rating/engine.ts
import { RateInput, Rate } from '../../types/shipping';

// Mock data for Caribbean Airlines lanes
const CARIBBEAN_AIRLINES_LANES = [
  { origin: 'JFK', destination: 'GEO', baseRatePerKg: 8.50, minRate: 120 },
  { origin: 'JFK', destination: 'POS', baseRatePerKg: 9.20, minRate: 110 },
  { origin: 'JFK', destination: 'BGI', baseRatePerKg: 10.00, minRate: 130 },
];

// Mock data for Delta Cargo lanes
const DELTA_CARGO_LANES = [
  { origin: 'JFK', destination: 'KIN', baseRatePerKg: 7.80, minRate: 100 },
  { origin: 'JFK', destination: 'MBJ', baseRatePerKg: 8.20, minRate: 110 },
  { origin: 'JFK', destination: 'SJU', baseRatePerKg: 8.90, minRate: 120 },
];

// Function to fetch real-time rates from Caribbean Airlines API
async function fetchCaribbeanAirlinesRates(input: RateInput): Promise<Rate[]> {
  // In a real implementation, this would call the Caribbean Airlines API
  // For now, we'll use mock data but simulate an API call
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rates: Rate[] = [];
  const totalWeight = input.pieces.reduce((sum, piece) => sum + piece.weight, 0);
  
  // Check for Guyana destinations (Caribbean Airlines)
  if (['Guyana', 'GUY'].includes(input.destCountry)) {
    CARIBBEAN_AIRLINES_LANES.forEach(lane => {
      const baseRate = Math.max(lane.minRate, totalWeight * lane.baseRatePerKg);
      const fuelSurcharge = baseRate * 0.12; // 12% fuel surcharge
      const securityFee = totalWeight * 0.75; // $0.75/kg security fee
      
      let totalPrice = baseRate + fuelSurcharge + securityFee;
      
      // Add after hours fee if requested
      if (input.afterHours) {
        totalPrice += 25; // Flat $25 after hours fee
      }
      
      // Add oversize fees for barrels
      input.pieces.forEach(piece => {
        if (piece.type === 'barrel' && piece.weight > 50) {
          totalPrice += 15; // Oversize fee for heavy barrels
        }
      });
      
      rates.push({
        laneId: `cal-${lane.origin}-${lane.destination}`,
        carrier: 'Caribbean Airlines',
        serviceLevel: input.serviceLevel,
        transitTime: 1, // 1 day for same-day service
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        breakdown: {
          baseRate: parseFloat(baseRate.toFixed(2)),
          fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
          securityFee: parseFloat(securityFee.toFixed(2)),
          afterHoursFee: input.afterHours ? 25 : undefined,
        },
        cutOffTime: '14:00', // 2:00 PM ET cutoff
        departureAirport: lane.origin,
        arrivalAirport: lane.destination,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Valid for 24 hours
      });
    });
  }
  
  return rates;
}

// Function to fetch real-time rates from Delta Cargo API
async function fetchDeltaCargoRates(input: RateInput): Promise<Rate[]> {
  // In a real implementation, this would call the Delta Cargo API
  // For now, we'll use mock data but simulate an API call
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const rates: Rate[] = [];
  const totalWeight = input.pieces.reduce((sum, piece) => sum + piece.weight, 0);
  
  // Add Delta routes for other Caribbean destinations
  if (['Trinidad', 'Jamaica', 'Barbados', 'Puerto Rico'].includes(input.destCountry)) {
    DELTA_CARGO_LANES.forEach(lane => {
      const baseRate = Math.max(lane.minRate, totalWeight * lane.baseRatePerKg);
      const fuelSurcharge = baseRate * 0.10; // 10% fuel surcharge for Delta
      const securityFee = totalWeight * 0.75;
      
      let totalPrice = baseRate + fuelSurcharge + securityFee;
      
      if (input.afterHours) {
        totalPrice += 25;
      }
      
      rates.push({
        laneId: `delta-${lane.origin}-${lane.destination}`,
        carrier: 'Delta Cargo',
        serviceLevel: input.serviceLevel,
        transitTime: 1, // 1 day for express service
        totalPrice: parseFloat(totalPrice.toFixed(2)),
        breakdown: {
          baseRate: parseFloat(baseRate.toFixed(2)),
          fuelSurcharge: parseFloat(fuelSurcharge.toFixed(2)),
          securityFee: parseFloat(securityFee.toFixed(2)),
          afterHoursFee: input.afterHours ? 25 : undefined,
        },
        cutOffTime: '18:00', // 6:00 PM ET cutoff for Delta
        departureAirport: lane.origin,
        arrivalAirport: lane.destination,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });
    });
  }
  
  return rates;
}

// Main function to calculate rates
export async function rateQuote(input: RateInput): Promise<Rate[]> {
  try {
    // Fetch rates from both carriers in parallel
    const [caribbeanRates, deltaRates] = await Promise.all([
      fetchCaribbeanAirlinesRates(input),
      fetchDeltaCargoRates(input)
    ]);
    
    // Combine and sort rates by price
    const allRates = [...caribbeanRates, ...deltaRates];
    return allRates.sort((a, b) => a.totalPrice - b.totalPrice);
  } catch (error) {
    console.error('Error calculating rates:', error);
    throw new Error('Failed to calculate shipping rates. Please try again later.');
  }
}
