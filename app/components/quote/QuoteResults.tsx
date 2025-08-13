// QuoteResults.tsx
'use client';

import { useState } from 'react';
import { Rate } from '../../types/shipping';

interface PackagingSKU {
  id: string;
  name: string;
  description: string;
  category: string;
  costUSD: number;
  sellPriceUSD: number;
}

interface EnhancedRate extends Omit<Rate, 'breakdown'> {
  breakdown: {
    baseRate: number;
    fuelSurcharge?: number;
    securityFee?: number;
    overweightFee?: number;
    packagingFee?: number;
    storageFee?: number;
    surcharge?: number;
    afterHoursFee?: number;
    oversizeFee?: number;
  };
  packagingDetails?: PackagingSKU[];
  eligibilityWarnings?: string[];
  disclaimers?: string[];
  margin?: number;
  marginPercentage?: number;
}

interface QuoteResultsProps {
  rates: EnhancedRate[];
  onBook: (rate: EnhancedRate) => void;
  onNewQuote: () => void;
  onAddPackaging?: (rateId: string) => void;
  paidOutsideUSA?: boolean;
  onTogglePaidOutsideUSA?: (enabled: boolean) => void;
}

export default function QuoteResults({ 
  rates, 
  onBook, 
  onNewQuote, 
  onAddPackaging,
  paidOutsideUSA = false,
  onTogglePaidOutsideUSA
}: QuoteResultsProps) {
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  
  const toggleDetails = (rateId: string) => {
    setShowDetails(prev => ({ ...prev, [rateId]: !prev[rateId] }));
  };

  if (rates.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">No Rates Available</h2>
        <p className="mb-4 text-gray-600">We couldn't find any rates for your shipment details. This could be due to:</p>
        <ul className="list-disc list-inside mb-6 text-gray-600 space-y-1">
          <li>Weight or dimensions exceeding JetPak limits (50 lbs, 62" total)</li>
          <li>Route not currently served</li>
          <li>Service level not available for your destination</li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Suggestion</h4>
          <p className="text-blue-700 text-sm">For larger items, consider our General Air service with higher weight and dimension limits.</p>
        </div>
        <button
          onClick={onNewQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Try Different Details
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Available Rates</h2>
        <div className="text-sm text-gray-500">
          {rates.length} option{rates.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Payment Location Toggle */}
      {onTogglePaidOutsideUSA && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="paidOutsideUSA"
              checked={paidOutsideUSA}
              onChange={(e) => onTogglePaidOutsideUSA(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="paidOutsideUSA" className="text-sm font-medium text-yellow-800">
              Payment will be made outside the USA
            </label>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Additional surcharge applies: $10 for orders under $100, or 10% for orders $100+
          </p>
        </div>
      )}
      
      <div className="grid gap-6">
        {rates.map((rate) => (
          <div key={rate.laneId} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-r from-white to-gray-50">
            
            {/* Eligibility Warnings */}
            {rate.eligibilityWarnings && rate.eligibilityWarnings.length > 0 && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-orange-500 text-sm font-medium">⚠️ Eligibility Notice</span>
                </div>
                <ul className="text-orange-700 text-sm mt-1 space-y-1">
                  {rate.eligibilityWarnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{rate.carrier}</h3>
                <p className="text-gray-600">
                  {rate.departureAirport} → {rate.arrivalAirport}
                </p>
                <div className="flex items-center space-x-4 text-gray-600 text-sm mt-1">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {rate.serviceLevel}
                  </span>
                  <span>{rate.transitTime} day{rate.transitTime !== 1 ? 's' : ''}</span>
                  <span>Cutoff: {rate.cutOffTime} ET</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">${rate.totalPrice.toFixed(2)}</div>
                <div className="text-sm text-gray-500">Valid until {new Date(rate.validUntil).toLocaleDateString()}</div>
                {rate.breakdown.surcharge && rate.breakdown.surcharge > 0 && (
                  <div className="text-xs text-yellow-600 font-medium mt-1">
                    Includes ${rate.breakdown.surcharge.toFixed(2)} surcharge
                  </div>
                )}
              </div>
            </div>
            
            {/* Pricing Breakdown */}
            <div className="mt-4">
              <button
                onClick={() => toggleDetails(rate.laneId)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                {showDetails[rate.laneId] ? '▼' : '▶'} View Price Breakdown
              </button>
              
              {showDetails[rate.laneId] && (
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-700 mb-2">Rate Components:</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Base Rate:</span>
                        <span className="font-medium">${rate.breakdown.baseRate.toFixed(2)}</span>
                      </div>
                      {rate.breakdown.fuelSurcharge && rate.breakdown.fuelSurcharge > 0 && (
                        <div className="flex justify-between">
                          <span>Fuel Surcharge:</span>
                          <span className="font-medium">${rate.breakdown.fuelSurcharge.toFixed(2)}</span>
                        </div>
                      )}
                      {rate.breakdown.securityFee && rate.breakdown.securityFee > 0 && (
                        <div className="flex justify-between">
                          <span>Security Fee:</span>
                          <span className="font-medium">${rate.breakdown.securityFee.toFixed(2)}</span>
                        </div>
                      )}
                      {rate.breakdown.overweightFee && rate.breakdown.overweightFee > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>Overweight Fee:</span>
                          <span className="font-medium">${rate.breakdown.overweightFee.toFixed(2)}</span>
                        </div>
                      )}
                      {rate.breakdown.packagingFee && rate.breakdown.packagingFee > 0 && (
                        <div className="text-green-600">
                          <div className="flex justify-between">
                            <span>Packaging:</span>
                            <span className="font-medium">${rate.breakdown.packagingFee.toFixed(2)}</span>
                          </div>
                          {rate.packagingDetails && rate.packagingDetails.length > 0 && (
                            <div className="ml-4 mt-1 space-y-1">
                              {rate.packagingDetails.map((pkg, idx) => (
                                <div key={idx} className="flex justify-between text-xs">
                                  <span className="text-green-700">• {pkg.name}</span>
                                  <span className="text-green-700">${pkg.sellPriceUSD.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {rate.breakdown.storageFee && rate.breakdown.storageFee > 0 && (
                        <div className="flex justify-between">
                          <span>Storage Fee:</span>
                          <span className="font-medium">${rate.breakdown.storageFee.toFixed(2)}</span>
                        </div>
                      )}
                      {rate.breakdown.afterHoursFee && rate.breakdown.afterHoursFee > 0 && (
                        <div className="flex justify-between text-orange-600">
                          <span>After Hours Fee:</span>
                          <span className="font-medium">${rate.breakdown.afterHoursFee.toFixed(2)}</span>
                        </div>
                      )}
                      {rate.breakdown.surcharge && rate.breakdown.surcharge > 0 && (
                        <div className="flex justify-between text-yellow-600">
                          <span>Outside USA Surcharge:</span>
                          <span className="font-medium">${rate.breakdown.surcharge.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between">
                    <div>
                      <div className="font-medium text-gray-700 mb-2">Service Details:</div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Airport-to-airport service</div>
                        <div>Pickup/delivery not included</div>
                        <div>Subject to customs inspection</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex space-x-3">
                {onAddPackaging && (
                  <button
                    onClick={() => onAddPackaging(rate.laneId)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded text-sm transition-colors"
                  >
                    + Add Packaging
                  </button>
                )}
              </div>
              
              <button
                onClick={() => onBook(rate)}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                Book This Rate →
              </button>
            </div>

            {/* Disclaimers */}
            {rate.disclaimers && rate.disclaimers.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  {rate.disclaimers.map((disclaimer, idx) => (
                    <div key={idx}>• {disclaimer}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={onNewQuote}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
        >
          ← Back to Quote Form
        </button>
        
        <div className="text-xs text-gray-500">
          Rates updated in real-time • Prices in USD
        </div>
      </div>
    </div>
  );
}
