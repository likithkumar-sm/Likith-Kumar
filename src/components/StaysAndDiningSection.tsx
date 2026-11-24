import {MapPin, Star} from 'lucide-react';
import {useState} from 'react';
import {
  STAYS_AND_DINING,
  type StayDiningCategory,
  type StayOrDining,
} from '../data/portalData';
import {PortalImage} from './PortalImage';

interface StaysAndDiningSectionProps {
  onReserveItem: (item: StayOrDining) => void;
}

const STAY_DINING_TABS: StayDiningCategory[] = ['All', 'Hotels', 'Homestays', 'Restaurants'];

export function StaysAndDiningSection({onReserveItem}: StaysAndDiningSectionProps) {
  const [activeTab, setActiveTab] = useState<StayDiningCategory>('All');

  const items =
    activeTab === 'All'
      ? STAYS_AND_DINING
      : STAYS_AND_DINING.filter((item) => item.type === activeTab);

  return (
    <section
      id="stays-dining"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
            03. Hotels, Homestays &amp; Regional Dining
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold text-[#133828] tracking-tight"
            style={{textWrap: 'balance'}}
          >
            Architectural eco-lodges, family courtyards, and farm-to-table kitchens.
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter hotels, homestays, and restaurants"
          className="flex flex-wrap items-center gap-1.5 bg-[#F3EDE2] p-1.5 rounded-lg border border-[#E7DEC9]"
        >
          {STAY_DINING_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828] ${
                  active
                    ? 'bg-[#133828] text-white'
                    : 'text-[#425349] hover:text-[#133828] hover:bg-white/70'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {items.map((item) => (
          <article
            key={item.id}
            className="group bg-white border border-[#E7DEC9] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 shadow-[0_6px_20px_-10px_rgba(19,56,40,0.08)]"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#F3EDE2]">
              <PortalImage
                src={item.image}
                alt={`${item.name} — ${item.type} in ${item.neighborhood}`}
                title={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {/* Quiet unboxed type & neighborhood metadata */}
              <div className="flex items-center justify-between gap-2 text-xs text-[#5A6C61] mb-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-[#997027]">
                    {item.type === 'Hotels'
                      ? 'Hotel & Lodge'
                      : item.type === 'Homestays'
                        ? 'Heritage Homestay'
                        : 'Local Restaurant'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#997027]" />
                    {item.neighborhood}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#133828] tabular-nums shrink-0">
                  <Star className="w-3.5 h-3.5 text-[#B88B3A] fill-[#B88B3A]" />
                  {item.rating.toFixed(1)}
                </span>
              </div>

              <h3 className="font-display text-xl font-semibold text-[#133828] mb-2">
                {item.name}
              </h3>

              <p className="text-sm text-[#425349] leading-relaxed mb-4 flex-1">
                {item.summary}
              </p>

              {/* Unboxed amenity line */}
              <p className="text-xs text-[#5A6C61] mb-5 leading-relaxed">
                {item.amenities.join(' · ')}
              </p>

              <div className="pt-4 border-t border-[#F3EDE2] flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-[#133828] tabular-nums">
                  {item.priceLabel}
                </span>

                <button
                  type="button"
                  onClick={() => onReserveItem(item)}
                  className="px-4 py-2 text-xs font-semibold text-[#133828] bg-[#F3EDE2] hover:bg-[#133828] hover:text-white border border-[#D5C8AD] hover:border-[#133828] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828]"
                >
                  {item.type === 'Restaurants' ? 'Reserve Table' : 'Request Stay'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
