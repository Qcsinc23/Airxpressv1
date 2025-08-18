"use client";
import { useEffect, useState } from "react";

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/deals/woot?feed=All").then((r) => r.json()).then((j) => setDeals(j.data || []));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Deals</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((d) => (
            <div key={d.sourceId} className="bg-white rounded-2xl shadow p-4">
              {d.photos?.[0] && <img src={d.photos[0]} alt={d.title} className="w-full h-48 object-cover rounded-xl" />}
              <div className="mt-3">
                <h3 className="font-semibold">{d.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-3">{d.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-bold">{d.currency} {Number(d.price).toFixed(2)}</span>
                  <button className="px-3 py-1 rounded-xl bg-blue-600 text-white" onClick={() => addToStore(d)}>
                    Add to Store
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  async function addToStore(d: any) {
    // Persist the normalized deal as a product so it can be sold
    await fetch("/api/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "woot",
        sourceId: d.sourceId,
        title: d.title,
        description: d.description,
        photos: d.photos,
        price: d.price,
        currency: d.currency,
        weightLb: d.weightLb,
        dimensionsIn: d.dimensionsIn,
        availability: d.availability,
        attributes: {},
      }),
    });
  }
}