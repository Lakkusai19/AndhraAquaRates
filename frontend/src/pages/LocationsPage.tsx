import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { locationsApi } from '../services/api';
import { District, MarketLocation } from '../types';
import { MapPin, ArrowRight, Building2, Waves, Scale } from 'lucide-react';

export const LocationsPage: React.FC = () => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const [dRes, mRes] = await Promise.all([
          locationsApi.getDistricts(),
          locationsApi.getMarkets(),
        ]);
        setDistricts(dRes.data || []);
        setMarkets(mRes.data || []);
      } catch (err) {
        console.error('Failed to load locations:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLocations();
  }, []);

  return (
    <div className="flex-1 bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-3 border border-sky-200">
            <Waves className="w-3.5 h-3.5 text-sky-600" />
            All 26 Districts of Andhra Pradesh
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Procurement Locations & Mandis
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Explore major shrimp trading centers, auction mandis, and processing plant gates across all 26 districts of Andhra Pradesh.
          </p>
        </div>

        {/* District Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-56 bg-slate-200 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {districts.map((dist) => {
              const districtMarkets = markets.filter((m) => m.district === dist.id);

              return (
                <div
                  key={dist.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <h2 className="font-extrabold text-slate-900 text-lg">{dist.name}</h2>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {dist.state_code}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">
                      Trading Hubs & Mandis ({districtMarkets.length})
                    </p>

                    <ul className="space-y-1.5 text-xs text-slate-700 mb-6">
                      {districtMarkets.map((m) => (
                        <li key={m.id} className="flex items-center justify-between py-1 border-b border-slate-50">
                          <span className="font-medium text-slate-800">{m.name}</span>
                          <span className="text-[10px] text-slate-400 capitalize">{m.location_type.toLowerCase().replace('_', ' ')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    to={`/compare?district=${dist.id}`}
                    className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Scale className="w-4 h-4 text-sky-600" />
                    Compare {dist.name} Rates <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
