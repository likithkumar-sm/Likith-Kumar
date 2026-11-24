import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  X,
} from 'lucide-react';
import {useMemo, useState} from 'react';
import {BUSINESS_CATEGORIES} from '../data/businessesSeed';
import type {
  BusinessDirectoryCategory,
  BusinessDocument,
} from '../types/business';
import type {CategoryDocument} from '../types/portal';
import {PortalImage} from './PortalImage';

interface BusinessesSectionProps {
  businesses: BusinessDocument[];
  categories?: CategoryDocument[];
  isLoading: boolean;
  onViewBusinessDetails: (business: BusinessDocument) => void;
  onInquireBusiness: (business: BusinessDocument) => void;
  onRegisterBusinessClick: () => void;
}

const DEFAULT_CATEGORIES: BusinessDirectoryCategory[] = [
  'All',
  ...BUSINESS_CATEGORIES,
];

export function BusinessesSection({
  businesses,
  categories,
  isLoading,
  onViewBusinessDetails,
  onInquireBusiness,
  onRegisterBusinessClick,
}: BusinessesSectionProps) {
  const categoryTabs: BusinessDirectoryCategory[] =
    categories && categories.length > 0
      ? [
          'All',
          ...(categories.map((c) => c.name) as BusinessDirectoryCategory[]),
        ]
      : DEFAULT_CATEGORIES;
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] =
    useState<BusinessDirectoryCategory>('All');
  const [selectedState, setSelectedState] = useState('All');

  const states = useMemo(() => {
    const unique = Array.from(new Set(businesses.map((b) => b.location.state)));
    return ['All', ...unique.sort()];
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return businesses.filter((biz) => {
      const matchesCategory =
        activeCategory === 'All' || biz.category === activeCategory;
      const matchesState =
        selectedState === 'All' || biz.location.state === selectedState;
      const matchesSearch =
        !q ||
        biz.name.toLowerCase().includes(q) ||
        biz.category.toLowerCase().includes(q) ||
        biz.shortDescription.toLowerCase().includes(q) ||
        biz.location.city.toLowerCase().includes(q) ||
        biz.location.state.toLowerCase().includes(q) ||
        biz.location.address.toLowerCase().includes(q);
      return matchesCategory && matchesState && matchesSearch;
    });
  }, [businesses, searchQuery, activeCategory, selectedState]);

  const hasFilters =
    searchQuery.trim() !== '' ||
    activeCategory !== 'All' ||
    selectedState !== 'All';

  const handleReset = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setSelectedState('All');
  };

  return (
    <section
      id="businesses"
      className="bg-[#F3EDE2] border-y border-[#E7DEC9] py-16 sm:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
              02. Local Business Directory
            </p>
            <h2
              className="font-display text-3xl sm:text-4xl font-semibold text-[#133828] tracking-tight"
              style={{textWrap: 'balance'}}
            >
              Verified hotels, homestays, transport, artisans &amp; local guides across India.
            </h2>
          </div>

          <button
            type="button"
            onClick={onRegisterBusinessClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B88B3A]"
          >
            <Plus className="w-4 h-4 text-[#E2C583]" />
            <span>List Your Business</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white border border-[#DFD5C3] rounded-xl p-5 mb-8 shadow-[0_6px_20px_-12px_rgba(19,56,40,0.07)]">
          <div className="flex flex-col md:flex-row gap-3.5">
            <div className="relative flex-1">
              <label htmlFor="business-search" className="sr-only">
                Search local businesses by name, city, or service
              </label>
              <Search className="w-4 h-4 text-[#5A6C61] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="business-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotels, restaurants, taxis, handicraft shops, or cities..."
                className="w-full pl-10 pr-9 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] placeholder:text-[#6B7B71] focus:outline-none focus:border-[#133828] focus:ring-2 focus:ring-[#133828]/15"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear business search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5A6C61] hover:text-[#133828] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="md:w-56 shrink-0">
              <label htmlFor="business-state-filter" className="sr-only">
                Filter businesses by state
              </label>
              <select
                id="business-state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full py-2.5 px-3.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828] cursor-pointer"
              >
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st === 'All' ? 'All States / Regions' : st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 7 Category Filter Tabs + Live Count */}
          <div className="mt-4 pt-4 border-t border-[#F3EDE2] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Local business categories"
              className="flex flex-wrap items-center gap-1.5"
            >
              {categoryTabs.map((tab) => {
                const active = activeCategory === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveCategory(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828] ${
                      active
                        ? 'bg-[#133828] text-white'
                        : 'bg-[#FAF8F4] text-[#425349] hover:text-[#133828] hover:bg-[#F3EDE2]'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-[#5A6C61] shrink-0">
              <span className="tabular-nums">
                Showing{' '}
                <strong className="text-[#133828] font-semibold">
                  {filteredBusinesses.length}
                </strong>{' '}
                {filteredBusinesses.length === 1 ? 'listing' : 'listings'}
              </span>
              {hasFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[#997027] hover:text-[#133828] font-medium underline underline-offset-4 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-[#DFD5C3] rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#E7DEC9]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/3 bg-[#E7DEC9] rounded" />
                  <div className="h-6 w-3/4 bg-[#E7DEC9] rounded" />
                  <div className="h-16 w-full bg-[#FAF8F4] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="bg-white border border-[#DFD5C3] rounded-xl py-12 px-6 text-center">
            <h3 className="font-display text-xl font-semibold text-[#133828] mb-2">
              No matching local businesses
            </h3>
            <p className="text-sm text-[#495A50] max-w-md mx-auto mb-5">
              Adjust your search keyword, state, or category tab to view verified partners.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
            >
              Show All Businesses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredBusinesses.map((biz) => (
              <article
                key={biz._id}
                className="group bg-white border border-[#DFD5C3] rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-1 shadow-[0_6px_20px_-12px_rgba(19,56,40,0.08)]"
              >
                <div className="aspect-[4/3] bg-[#E7DEC9] overflow-hidden">
                  <PortalImage
                    src={biz.image}
                    alt={`${biz.name} — ${biz.category}`}
                    title={biz.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  {/* Category + Rating */}
                  <div className="flex items-center justify-between gap-2 text-xs text-[#5A6C61] mb-2">
                    <span className="font-semibold text-[#997027]">{biz.category}</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#133828] tabular-nums">
                      <Star className="w-3.5 h-3.5 text-[#B88B3A] fill-[#B88B3A]" />
                      <span>{biz.rating.toFixed(1)}</span>
                      <span className="font-normal text-[#5A6C61]">({biz.reviewCount})</span>
                    </span>
                  </div>

                  {/* Business Name */}
                  <h3 className="font-display text-xl font-semibold text-[#133828] leading-snug mb-2">
                    {biz.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#425349] leading-relaxed mb-4">
                    {biz.shortDescription}
                  </p>

                  {/* Location, Contact Details & Operating Hours */}
                  <dl className="space-y-2 text-xs text-[#425349] pt-3.5 border-t border-[#F3EDE2] mb-5 flex-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#997027] shrink-0 mt-0.5" />
                      <dd>
                        <span className="font-medium text-[#133828]">
                          {biz.location.city}, {biz.location.state}
                        </span>
                        <span className="block text-[#5A6C61]">{biz.location.address}</span>
                      </dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#997027] shrink-0" />
                      <dd className="tabular-nums">{biz.contact.phone}</dd>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#997027] shrink-0" />
                      <dd className="truncate">{biz.contact.email}</dd>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#997027] shrink-0 mt-0.5" />
                      <dd className="tabular-nums">{biz.operatingHours}</dd>
                    </div>
                  </dl>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => onViewBusinessDetails(biz)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs sm:text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onInquireBusiness(biz)}
                      className="py-2.5 px-3.5 text-xs sm:text-sm font-semibold text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
