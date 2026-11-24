import {Bookmark, Search, X} from 'lucide-react';
import type {DestinationCategory} from '../types/destination';
import type {CategoryDocument} from '../types/portal';

interface DestinationSearchBarProps {
  query: string;
  onQueryChange: (val: string) => void;
  selectedCategory: DestinationCategory;
  onCategoryChange: (cat: DestinationCategory) => void;
  selectedSeason: string;
  onSeasonChange: (season: string) => void;
  categories?: CategoryDocument[];
  resultCount: number;
  savedCount: number;
  onOpenTripDrawer: () => void;
}

const DEFAULT_CATEGORIES: DestinationCategory[] = [
  'All',
  'Waterfalls',
  'Heritage',
  'Viewpoints',
  'Trails',
];

const SEASONS = ['All Seasons', 'Jun – Nov', 'Oct – Mar', 'Sep – Feb', 'Year-round'];

export function DestinationSearchBar({
  query,
  onQueryChange,
  selectedCategory,
  onCategoryChange,
  selectedSeason,
  onSeasonChange,
  categories,
  resultCount,
  savedCount,
  onOpenTripDrawer,
}: DestinationSearchBarProps) {
  const categoryTabs: DestinationCategory[] =
    categories && categories.length > 0
      ? ['All', ...(categories.map((c) => c.name) as DestinationCategory[])]
      : DEFAULT_CATEGORIES;
  const hasFilters =
    query.trim() !== '' || selectedCategory !== 'All' || selectedSeason !== 'All Seasons';

  const handleReset = () => {
    onQueryChange('');
    onCategoryChange('All');
    onSeasonChange('All Seasons');
  };

  return (
    <section
      aria-label="Search destinations"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4"
    >
      <div className="bg-white border border-[#E7DEC9] rounded-xl p-5 sm:p-6 shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <label htmlFor="destination-search" className="sr-only">
              Search destinations, trails, or landmarks
            </label>
            <Search className="w-4 h-4 text-[#5A6C61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="destination-search"
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search Coorg waterfalls, Rajasthan forts, Munnar, Meghalaya, or trails..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] placeholder:text-[#6B7B71] focus:outline-none focus:border-[#133828] focus:ring-2 focus:ring-[#133828]/15 transition-colors"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search query"
                onClick={() => onQueryChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5A6C61] hover:text-[#133828] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Season Dropdown */}
          <div className="sm:w-48 shrink-0">
            <label htmlFor="season-filter" className="sr-only">
              Filter by best season
            </label>
            <select
              id="season-filter"
              value={selectedSeason}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="w-full py-2.5 px-3.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828] focus:ring-2 focus:ring-[#133828]/15 cursor-pointer"
            >
              {SEASONS.map((season) => (
                <option key={season} value={season}>
                  {season === 'All Seasons' ? 'Best Season: Any' : `Season: ${season}`}
                </option>
              ))}
            </select>
          </div>

          {/* Saved Trip Shortlist Trigger */}
          <button
            type="button"
            onClick={onOpenTripDrawer}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] border border-[#D5C8AD] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828]"
          >
            <Bookmark className="w-4 h-4 text-[#B88B3A]" />
            <span>Saved Trip</span>
            <span className="font-mono text-xs font-semibold tabular-nums text-[#133828]">
              ({savedCount})
            </span>
          </button>
        </div>

        {/* Category Segmented Tabs + Live Results Count */}
        <div className="mt-4 pt-4 border-t border-[#F3EDE2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div
            role="tablist"
            aria-label="Destination categories"
            className="flex flex-wrap items-center gap-1.5"
          >
            {categoryTabs.map((category) => {
              const active = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828] ${
                    active
                      ? 'bg-[#133828] text-white'
                      : 'bg-[#FAF8F4] text-[#425349] hover:bg-[#F3EDE2] hover:text-[#133828]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs sm:text-sm text-[#5A6C61]">
            <span className="tabular-nums">
              Showing <strong className="text-[#133828] font-semibold">{resultCount}</strong>{' '}
              {resultCount === 1 ? 'destination' : 'destinations'}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[#997027] hover:text-[#133828] font-medium underline underline-offset-4 cursor-pointer whitespace-nowrap"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
