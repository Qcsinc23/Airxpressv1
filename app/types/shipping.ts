// RateInput interface for quote requests
export type RateInput = {
  originZip: string;
  destCountry: string;
  destCity?: string;
  pieces: { type: 'barrel' | 'box', weight: number, dimensions?: { length: number, width: number, height: number } }[];
  serviceLevel: 'STANDARD' | 'EXPRESS' | 'NFO';
  afterHours?: boolean;
  isPersonalEffects?: boolean; // For C73 eligibility
};

// Rate output from the rating engine
export type Rate = {
  laneId: string;
  carrier: string; // Caribbean Airlines, Delta, etc.
  serviceLevel: 'STANDARD' | 'EXPRESS' | 'NFO';
  transitTime: number; // in days
  totalPrice: number;
  breakdown: {
    baseRate: number;
    fuelSurcharge: number;
    securityFee: number;
    afterHoursFee?: number;
    oversizeFee?: number;
  };
  cutOffTime: string; // ISO datetime
  departureAirport: string;
  arrivalAirport: string;
  validUntil: string; // ISO datetime
};

// Quote object
export type Quote = {
  id: string;
  userId?: string;
  input: RateInput;
  rates: Rate[];
  selectedRate?: Rate;
  createdAt: string; // ISO datetime
  expiresAt: string; // ISO datetime
};

// Booking object
export type Booking = {
  id: string;
  quoteId: string;
  userId: string;
  status: 'NEW' | 'PICKUP_SCHEDULED' | 'TENDERED' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'CANCELLED';
  trackingEvents: {
    timestamp: string;
    status: string;
    location?: string;
    notes?: string;
  }[];
  paymentId?: string;
  documents: {
    type: 'COMMERCIAL_INVOICE' | 'PACKING_LIST' | 'C73_FORM' | 'OTHER';
    url: string;
    uploadedAt: string;
  }[];
  pickupDetails: {
    scheduledTime: string;
    address: string;
    contact: string;
    specialInstructions?: string;
  };
  createdAt: string;
  updatedAt: string;
};
