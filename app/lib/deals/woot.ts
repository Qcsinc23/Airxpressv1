import { z } from "zod";

// Real Woot API types based on actual response
const WootFeedItem = z.object({
  OfferId: z.string(),
  Title: z.string(),
  Url: z.string().url(),
  Photo: z.string().url(),
  SalePrice: z.object({ Minimum: z.number(), Maximum: z.number() }),
  ListPrice: z.object({ Minimum: z.number(), Maximum: z.number() }).nullable().optional(),
  IsSoldOut: z.boolean(),
  Categories: z.array(z.string()).nullable(),
  Site: z.string(),
  Subtitle: z.string().nullable(),
});

const WootOffer = z.object({
  Id: z.string(),
  Title: z.string(),
  FullTitle: z.string().optional(),
  Subtitle: z.string().nullable(),
  Url: z.string().url(),
  Features: z.string(),
  Specs: z.string().optional(),
  WriteUpBody: z.string().optional(),
  WriteUpIntro: z.string().optional(),
  Teaser: z.string().optional(),
  Photos: z.array(z.object({
    Url: z.string().url(),
    Caption: z.string().nullable(),
    Height: z.number(),
    Width: z.number(),
  })),
  Items: z.array(z.object({
    Id: z.string(),
    Title: z.string(),
    SalePrice: z.number(),
    ListPrice: z.number().optional(),
    Asin: z.string().optional(),
    Win: z.string().optional(),
    Photos: z.array(z.object({
      Url: z.string().url(),
      Caption: z.string().nullable(),
      Height: z.number(),
      Width: z.number(),
    })),
    Attributes: z.array(z.object({
      Key: z.string(),
      Value: z.string(),
    })),
  })),
  IsSoldOut: z.boolean(),
  IsOfferLiveNow: z.boolean(),
  IsWootOff: z.boolean().optional(),
  PurchaseLimit: z.number().optional(),
  QuantityLimit: z.number().optional(),
  ShippingMethods: z.array(z.string()).optional(),
});

export type NormalizedDealProduct = {
  source: "woot";
  sourceId: string;
  title: string;
  fullTitle?: string;
  subtitle?: string;
  description: string;
  features?: string;
  specs?: string;
  writeUp?: {
    intro?: string;
    body?: string;
  };
  teaser?: string;
  photos: Array<{
    url: string;
    caption?: string;
    width?: number;
    height?: number;
  }>;
  price: number;
  listPrice?: number;
  currency: string;
  weightLb?: number;
  dimensionsIn?: { length: number; width: number; height: number };
  availability: "in_stock" | "sold_out";
  categories: string[];
  site: string;
  url: string;
  asin?: string;
  condition?: string;
  attributes?: Array<{ key: string; value: string }>;
  purchaseLimit?: number;
  quantityLimit?: number;
  shippingMethods?: string[];
  isWootOff?: boolean;
  isLiveNow?: boolean;
  dealInfo?: {
    discount?: number;
    discountPercent?: number;
    savings?: number;
  };
};

const inches = (n: number) => n; // placeholder unit helper
const pounds = (n: number) => n;

// crude parser for dimensions/weight from free text (Specs/Features)
const parseDimsAndWeight = (text?: string) => {
  if (!text) return {} as Partial<NormalizedDealProduct>;
  const t = text.replace(/\n/g, " ");
  // Match patterns like 12 x 8 x 4 in, 12" x 8" x 4", 12x8x4 inches
  const dimMatch = t.match(/(\d+(?:\.\d+)?)\s*["x×]\s*(\d+(?:\.\d+)?)\s*["x×]\s*(\d+(?:\.\d+)?)(?:\s*(?:in|inch|inches|"))?/i);
  const weightMatch = t.match(/(\d+(?:\.\d+)?)\s*(lb|lbs|pound|pounds)/i);
  const dims = dimMatch
    ? {
        length: inches(parseFloat(dimMatch[1])),
        width: inches(parseFloat(dimMatch[2])),
        height: inches(parseFloat(dimMatch[3])),
      }
    : undefined;
  const weight = weightMatch ? pounds(parseFloat(weightMatch[1])) : undefined;
  return { dimensionsIn: dims, weightLb: weight } as Partial<NormalizedDealProduct>;
};

export async function normalizeOffer(raw: unknown): Promise<NormalizedDealProduct> {
  const offer = WootOffer.parse(raw);
  const firstItem = offer.Items[0];
  const price = firstItem.SalePrice;
  const listPrice = firstItem.ListPrice;
  const currency = "USD";
  
  // Clean HTML from Features to get description
  const desc = offer.Features
    ? offer.Features.replace(/<[^>]*>/g, '').replace(/\r\n/g, '\n').trim()
    : offer.Title;
  
  const parsed = parseDimsAndWeight(offer.Features + " " + (offer.Specs || ""));
  
  // Calculate deal information
  const dealInfo = listPrice && listPrice > price ? {
    discount: listPrice - price,
    discountPercent: Math.round(((listPrice - price) / listPrice) * 100),
    savings: listPrice - price
  } : undefined;

  // Convert photos to enhanced format
  const photos = offer.Photos.map(photo => ({
    url: photo.Url,
    caption: photo.Caption || undefined,
    width: photo.Width,
    height: photo.Height,
  }));
  
  return {
    source: "woot",
    sourceId: offer.Id,
    title: offer.Title,
    fullTitle: offer.FullTitle,
    subtitle: offer.Subtitle || undefined,
    description: desc,
    features: offer.Features,
    specs: offer.Specs,
    writeUp: {
      intro: offer.WriteUpIntro,
      body: offer.WriteUpBody,
    },
    teaser: offer.Teaser,
    photos,
    price,
    listPrice,
    currency,
    availability: offer.IsSoldOut ? "sold_out" : "in_stock",
    categories: [], // Feed items don't have categories, would need separate lookup
    site: "Woot",
    url: offer.Url,
    asin: firstItem.Asin,
    condition: firstItem.Attributes.find(attr => attr.Key === "Condition")?.Value,
    attributes: firstItem.Attributes,
    purchaseLimit: offer.PurchaseLimit,
    quantityLimit: offer.QuantityLimit,
    shippingMethods: offer.ShippingMethods,
    isWootOff: offer.IsWootOff,
    isLiveNow: offer.IsOfferLiveNow,
    dealInfo,
    ...parsed,
  };
}

export function normalizeFeedItem(raw: unknown): NormalizedDealProduct {
  try {
    const item = WootFeedItem.parse(raw);
    const price = item.SalePrice.Minimum;
    const listPrice = item.ListPrice?.Minimum;
    const currency = "USD";
    
    // Calculate deal information
    const dealInfo = listPrice && listPrice > price ? {
      discount: listPrice - price,
      discountPercent: Math.round(((listPrice - price) / listPrice) * 100),
      savings: listPrice - price
    } : undefined;
    
    return {
      source: "woot",
      sourceId: item.OfferId,
      title: item.Title,
      subtitle: item.Subtitle || undefined,
      description: item.Subtitle || item.Title,
      photos: [{ url: item.Photo }],
      price,
      listPrice,
      currency,
      availability: item.IsSoldOut ? "sold_out" : "in_stock",
      categories: item.Categories || [],
      site: item.Site,
      url: item.Url,
      dealInfo,
    };
  } catch (err) {
    console.error('Failed to parse Woot feed item:', err, raw);
    // Return a default item if parsing fails
    return {
      source: "woot",
      sourceId: "unknown",
      title: "Unknown Product",
      description: "Product details unavailable",
      photos: [{ url: "" }],
      price: 0,
      currency: "USD",
      availability: "sold_out",
      categories: [],
      site: "Unknown",
      url: "",
    };
  }
}