import {ArrowRight, Bookmark, Clock, MapPin, Star, Ticket} from 'lucide-react';
import {motion} from 'motion/react';
import type {DestinationDocument} from '../types/destination';
import {PortalImage} from './PortalImage';

interface DestinationsSectionProps {
  destinations: DestinationDocument[];
  isLoading: boolean;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onViewDetails: (destination: DestinationDocument) => void;
  onResetFilters: () => void;
}

export function DestinationsSection({
  destinations,
  isLoading,
  savedIds,
  onToggleSave,
  onViewDetails,
  onResetFilters,
}: DestinationsSectionProps) {
  return (
    <section
      id="destinations"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
            01. Tourist Destinations Directory
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold text-[#133828] tracking-tight"
            style={{textWrap: 'balance'}}
          >
            Landscapes &amp; heritage landmarks curated for slow discovery.
          </h2>
        </div>
        <p className="text-sm text-[#495A50] max-w-sm leading-relaxed">
          Browse verified addresses, opening hours, entry fees, and community ratings, or open
          full destination details.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-[#E7DEC9] rounded-xl overflow-hidden animate-pulse"
            >
              <div className="aspect-[4/3] bg-[#E7DEC9]" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-1/3 bg-[#E7DEC9] rounded" />
                <div className="h-6 w-3/4 bg-[#E7DEC9] rounded" />
                <div className="h-12 w-full bg-[#F3EDE2] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-xl py-14 px-6 text-center">
          <h3 className="font-display text-xl font-semibold text-[#133828] mb-2">
            No matching destinations found
          </h3>
          <p className="text-sm text-[#495A50] max-w-md mx-auto mb-6">
            Try clearing your search keyword or switching to a broader category or season filter.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
          >
            Show All Destinations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {destinations.map((dest, index) => {
            const isSaved = savedIds.includes(dest._id);
            return (
              <motion.article
                key={dest._id}
                initial={{opacity: 0, y: 14}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, amount: 0.12}}
                transition={{
                  duration: 0.35,
                  delay: Math.min(index * 0.05, 0.25),
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group bg-white border border-[#E7DEC9] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 shadow-[0_6px_20px_-10px_rgba(19,56,40,0.08)]"
              >
                {/* 4:3 Photograph */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#F3EDE2]">
                  <PortalImage
                    src={dest.image}
                    alt={`${dest.name} — ${dest.category} in ${dest.location.district}, ${dest.location.state}`}
                    title={dest.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <button
                    type="button"
                    aria-label={
                      isSaved
                        ? `Remove ${dest.name} from saved trip`
                        : `Save ${dest.name} to trip`
                    }
                    aria-pressed={isSaved}
                    onClick={() => onToggleSave(dest._id)}
                    className={`absolute top-3.5 right-3.5 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-white ${
                      isSaved
                        ? 'bg-[#133828] text-[#E2C583]'
                        : 'bg-white/90 text-[#133828] hover:bg-white'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#E2C583]' : ''}`} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Unboxed quiet metadata + rating/reviews */}
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5A6C61] mb-2">
                    <span className="truncate">
                      <strong className="font-semibold text-[#997027]">{dest.category}</strong>
                      <span aria-hidden="true"> · </span>
                      <span>Best {dest.bestSeason}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#133828] shrink-0 tabular-nums">
                      <Star className="w-3.5 h-3.5 text-[#B88B3A] fill-[#B88B3A]" />
                      <span>{dest.rating.toFixed(1)}</span>
                      <span className="font-normal text-[#5A6C61]">({dest.reviewCount})</span>
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-semibold text-[#133828] leading-snug mb-2">
                    {dest.name}
                  </h3>

                  <p className="text-sm text-[#425349] leading-relaxed mb-4">
                    {dest.shortDescription}
                  </p>

                  {/* Explicit Visitor Metadata: Location/Address, Opening Hours, Entry Fees */}
                  <dl className="space-y-2 text-xs text-[#425349] pt-3.5 border-t border-[#F3EDE2] mb-5 flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#997027] shrink-0 mt-0.5" />
                      <dd className="leading-snug">
                        <span className="font-medium text-[#133828]">
                          {dest.location.district}, {dest.location.state}
                        </span>
                        <span className="block text-[#5A6C61]">{dest.location.address}</span>
                      </dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#997027] shrink-0" />
                      <dd className="tabular-nums">{dest.openingHours}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ticket className="w-3.5 h-3.5 text-[#997027] shrink-0" />
                      <dd className="font-medium text-[#133828] tabular-nums">
                        {dest.entryFee.displayLabel}
                      </dd>
                    </div>
                  </dl>

                  {/* Primary Action: View Details Button */}
                  <button
                    type="button"
                    onClick={() => onViewDetails(dest)}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B88B3A]"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
}
