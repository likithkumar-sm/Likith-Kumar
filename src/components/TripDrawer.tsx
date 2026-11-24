import {Compass, Trash2, X} from 'lucide-react';
import type {DestinationDocument} from '../types/destination';
import {PortalImage} from './PortalImage';

interface TripDrawerProps {
  isOpen: boolean;
  savedDestinations: DestinationDocument[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onBuildAiPlan: () => void;
}

export function TripDrawer({
  isOpen,
  savedDestinations,
  onClose,
  onRemove,
  onBuildAiPlan,
}: TripDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-[#0C2419]/55 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#FAF8F4] h-full border-l border-[#D5C8AD] flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-[#E7DEC9] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#997027]">
              Your Shortlist
            </p>
            <h2
              id="trip-drawer-title"
              className="font-display text-2xl font-semibold text-[#133828]"
            >
              Saved Trip ({savedDestinations.length})
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close saved trip drawer"
            onClick={onClose}
            className="w-10 h-10 rounded-lg text-[#425349] hover:bg-[#F3EDE2] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {savedDestinations.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#F3EDE2] border border-[#E7DEC9] rounded-xl">
              <p className="font-display text-lg font-semibold text-[#133828] mb-2">
                Your trip shortlist is empty
              </p>
              <p className="text-sm text-[#495A50] leading-relaxed">
                Click the bookmark icon on any destination card to gather places here and
                generate a custom route with the AI Concierge.
              </p>
            </div>
          ) : (
            savedDestinations.map((dest) => (
              <div
                key={dest._id}
                className="flex items-center gap-3.5 bg-white border border-[#E7DEC9] rounded-xl p-3"
              >
                <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#F3EDE2]">
                  <PortalImage
                    src={dest.image}
                    alt={dest.name}
                    title={dest.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold text-[#133828] truncate">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-[#5A6C61] truncate">
                    {dest.category} · {dest.duration} · {dest.location.district}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${dest.name}`}
                  onClick={() => onRemove(dest._id)}
                  className="p-2 text-[#5A6C61] hover:text-[#8C2626] rounded-lg hover:bg-[#FAF8F4] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {savedDestinations.length > 0 && (
          <div className="p-6 border-t border-[#E7DEC9] bg-[#F3EDE2]">
            <button
              type="button"
              onClick={onBuildAiPlan}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#E2C583]" />
              <span>Generate Itinerary With AI Concierge</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
