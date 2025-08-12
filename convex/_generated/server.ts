// Auto-generated Convex server types - Mock implementation for build compatibility

import { GenericId } from "convex/values";

export interface DataModel {
  users: {
    _id: GenericId<"users">;
    _creationTime: number;
    clerkId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    role: "user" | "admin" | "ops" | "support";
    isActive: boolean;
    preferences?: {
      emailNotifications: boolean;
      smsNotifications: boolean;
    };
    createdAt: number;
    updatedAt: number;
  };
  
  companies: {
    _id: GenericId<"companies">;
    _creationTime: number;
    name: string;
    contactEmail: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    taxId?: string;
    isActive: boolean;
    ownerId: GenericId<"users">;
    createdAt: number;
    updatedAt: number;
  };
  
  lanes: {
    _id: GenericId<"lanes">;
    _creationTime: number;
    originAirport: string;
    destAirport: string;
    destCountry: string;
    carrier: string;
    isActive: boolean;
    rates: {
      standard: { base: number; fuel: number; security: number; };
      express: { base: number; fuel: number; security: number; };
      nfo: { base: number; fuel: number; security: number; };
    };
    cutoffTimes: {
      standard: string;
      express: string;
      nfo: string;
    };
    transitTimes: {
      standard: number;
      express: number;
      nfo: number;
    };
    createdAt: number;
    updatedAt: number;
  };
  
  quotes: {
    _id: GenericId<"quotes">;
    _creationTime: number;
    userId?: GenericId<"users">;
    sessionId?: string;
    originZip: string;
    destCountry: string;
    destCity?: string;
    pieces: Array<{
      type: "barrel" | "box";
      weight: number;
      dimensions?: {
        length: number;
        width: number;
        height: number;
      };
    }>;
    serviceLevel: "STANDARD" | "EXPRESS" | "NFO";
    afterHours: boolean;
    isPersonalEffects: boolean;
    rates: Array<{
      laneId: string;
      carrier: string;
      serviceLevel: "STANDARD" | "EXPRESS" | "NFO";
      transitTime: number;
      totalPrice: number;
      breakdown: {
        baseRate: number;
        fuelSurcharge: number;
        securityFee: number;
        afterHoursFee?: number;
        oversizeFee?: number;
      };
      cutOffTime: string;
      departureAirport: string;
      arrivalAirport: string;
      validUntil: string;
    }>;
    selectedRate?: {
      laneId: string;
      carrier: string;
      serviceLevel: "STANDARD" | "EXPRESS" | "NFO";
      transitTime: number;
      totalPrice: number;
      breakdown: {
        baseRate: number;
        fuelSurcharge: number;
        securityFee: number;
        afterHoursFee?: number;
        oversizeFee?: number;
      };
      cutOffTime: string;
      departureAirport: string;
      arrivalAirport: string;
      validUntil: string;
    };
    status: "DRAFT" | "QUOTED" | "BOOKED";
    expiresAt: number;
    createdAt: number;
    updatedAt: number;
  };
  
  bookings: {
    _id: GenericId<"bookings">;
    _creationTime: number;
    quoteId: GenericId<"quotes">;
    userId: GenericId<"users">;
    trackingNumber: string;
    status: "NEW" | "PICKUP_SCHEDULED" | "TENDERED" | "IN_TRANSIT" | "ARRIVED" | "DELIVERED" | "CANCELLED";
    carrier: string;
    serviceLevel: "STANDARD" | "EXPRESS" | "NFO";
    route: string;
    totalPrice: number;
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
    paymentIntentId?: string;
    pickupDetails: {
      scheduledTime: string;
      address: string;
      contact: string;
      specialInstructions?: string;
    };
    trackingEvents: Array<{
      timestamp: string;
      status: string;
      location?: string;
      notes?: string;
    }>;
    documents: Array<{
      id: string;
      type: "commercial_invoice" | "packing_list" | "customs_declaration" | "photo_id" | "authorization_letter" | "other";
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }>;
    estimatedDelivery?: string;
    actualDelivery?: string;
    createdAt: number;
    updatedAt: number;
  };
  
  content: {
    _id: GenericId<"content">;
    _creationTime: number;
    key: string;
    type: "page" | "snippet" | "config";
    title?: string;
    content: string;
    metadata?: any;
    isPublished: boolean;
    version: number;
    createdBy: GenericId<"users">;
    createdAt: number;
    updatedAt: number;
  };
  
  audit: {
    _id: GenericId<"audit">;
    _creationTime: number;
    userId?: GenericId<"users">;
    action: string;
    resource: string;
    resourceId?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
    timestamp: number;
  };
  
  flags: {
    _id: GenericId<"flags">;
    _creationTime: number;
    key: string;
    name: string;
    description?: string;
    isEnabled: boolean;
    conditions?: any;
    value?: any;
    updatedBy: GenericId<"users">;
    createdAt: number;
    updatedAt: number;
  };
}

// Mock query and mutation functions for development
export const query = (config: any) => {
  return () => {
    throw new Error("Convex functions are only available in production. Use API routes for development.");
  };
};

export const mutation = (config: any) => {
  return () => {
    throw new Error("Convex functions are only available in production. Use API routes for development.");
  };
};

export const action = (config: any) => {
  return () => {
    throw new Error("Convex functions are only available in production. Use API routes for development.");
  };
};