import {useCallback, useEffect, useMemo, useState} from 'react';
import {AiAssistantSection} from './components/AiAssistantSection';
import {BookingModal, type BookingTarget} from './components/BookingModal';
import {BusinessesSection} from './components/BusinessesSection';
import {DestinationSearchBar} from './components/DestinationSearchBar';
import {DestinationsSection} from './components/DestinationsSection';
import {Footer} from './components/Footer';
import {HeroSection} from './components/HeroSection';
import {Navbar} from './components/Navbar';
import {PortalMapSection} from './components/PortalMapSection';
import {ReviewsSection} from './components/ReviewsSection';
import {StaysAndDiningSection} from './components/StaysAndDiningSection';
import {TripDrawer} from './components/TripDrawer';
import {useAuth} from './context/AuthContext';
import {BUSINESSES_SEED} from './data/businessesSeed';
import {DESTINATIONS_SEED} from './data/destinationsSeed';
import type {StayOrDining} from './data/portalData';
import {AuthPage} from './pages/AuthPage';
import {BusinessDetailsPage} from './pages/BusinessDetailsPage';
import {DashboardPage} from './pages/DashboardPage';
import {DestinationDetailsPage} from './pages/DestinationDetailsPage';
import {businessService} from './services/businessService';
import {categoryService} from './services/categoryService';
import {destinationService} from './services/destinationService';
import type {BusinessDocument} from './types/business';
import type {DestinationCategory, DestinationDocument} from './types/destination';
import type {CategoryDocument} from './types/portal';

type AppRoute =
  | {kind: 'home'}
  | {kind: 'destination_details'; slug: string}
  | {kind: 'business_details'; slug: string}
  | {kind: 'login'; mode: 'login' | 'register'}
  | {kind: 'dashboard'; tab: 'workspace' | 'register_business' | 'profile'};

function parsePath(pathname: string): AppRoute {
  const destMatch = pathname.match(/^\/destinations\/([^/]+)\/?$/);
  if (destMatch) {
    return {kind: 'destination_details', slug: decodeURIComponent(destMatch[1])};
  }
  const bizMatch = pathname.match(/^\/businesses\/([^/]+)\/?$/);
  if (bizMatch) {
    return {kind: 'business_details', slug: decodeURIComponent(bizMatch[1])};
  }
  if (pathname === '/login') return {kind: 'login', mode: 'login'};
  if (pathname === '/register') return {kind: 'login', mode: 'register'};
  if (pathname === '/dashboard') return {kind: 'dashboard', tab: 'workspace'};
  if (pathname === '/profile') return {kind: 'dashboard', tab: 'profile'};
  if (pathname === '/register-business') {
    return {kind: 'dashboard', tab: 'register_business'};
  }
  return {kind: 'home'};
}

export default function App() {
  const {user} = useAuth();

  const [destinations, setDestinations] =
    useState<DestinationDocument[]>(DESTINATIONS_SEED);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);

  const [businesses, setBusinesses] = useState<BusinessDocument[]>(() =>
    BUSINESSES_SEED.filter((b) => b.status === 'approved'),
  );
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);

  const [categories, setCategories] = useState<CategoryDocument[]>([]);

  const [route, setRoute] = useState<AppRoute>(() =>
    parsePath(window.location.pathname),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<DestinationCategory>('All');
  const [selectedSeason, setSelectedSeason] = useState('All Seasons');

  const [savedIds, setSavedIds] = useState<string[]>(['dest_001', 'dest_002']);
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);
  const [tripDrawerOpen, setTripDrawerOpen] = useState(false);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string | null>(null);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setRoute(parsePath(path));
    window.scrollTo({top: 0, behavior: 'auto'});
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parsePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const refreshPublicPortal = useCallback(() => {
    setIsLoadingDestinations(true);
    setIsLoadingBusinesses(true);

    destinationService
      .list()
      .then((list) => {
        if (list.length > 0) setDestinations(list);
      })
      .catch(() => {})
      .finally(() => setIsLoadingDestinations(false));

    businessService
      .listApproved()
      .then((list) => {
        setBusinesses(list);
      })
      .catch(() => {})
      .finally(() => setIsLoadingBusinesses(false));

    categoryService
      .list()
      .then((list) => {
        setCategories(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshPublicPortal();
  }, [refreshPublicPortal]);

  const destinationCategories = useMemo(
    () => categories.filter((c) => c.scope === 'destination'),
    [categories],
  );

  const businessCategories = useMemo(
    () => categories.filter((c) => c.scope === 'business'),
    [categories],
  );

  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return destinations.filter((dest) => {
      const matchesCategory =
        selectedCategory === 'All' || dest.category === selectedCategory;
      const matchesSeason =
        selectedSeason === 'All Seasons' || dest.bestSeason === selectedSeason;
      const matchesQuery =
        !q ||
        dest.name.toLowerCase().includes(q) ||
        dest.location.state.toLowerCase().includes(q) ||
        dest.location.district.toLowerCase().includes(q) ||
        dest.location.address.toLowerCase().includes(q) ||
        dest.category.toLowerCase().includes(q) ||
        dest.shortDescription.toLowerCase().includes(q) ||
        dest.nearbyPartner.toLowerCase().includes(q);
      return matchesCategory && matchesSeason && matchesQuery;
    });
  }, [destinations, searchQuery, selectedCategory, selectedSeason]);

  const savedDestinations = useMemo(
    () => destinations.filter((d) => savedIds.includes(d._id)),
    [destinations, savedIds],
  );

  const savedPlaceNames = useMemo(
    () => savedDestinations.map((d) => d.name),
    [savedDestinations],
  );

  const scrollToSection = (id: string) => {
    if (route.kind !== 'home') {
      window.history.pushState({}, '', '/');
      setRoute({kind: 'home'});
      setTimeout(() => {
        if (id === 'top') {
          window.scrollTo({top: 0, behavior: 'smooth'});
        } else {
          document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
        }
      }, 60);
      return;
    }
    if (id === 'top') {
      window.scrollTo({top: 0, behavior: 'smooth'});
      return;
    }
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSeason('All Seasons');
  };

  const handleInquireBusiness = (biz: BusinessDocument) => {
    setBookingTarget({
      targetType: 'business',
      targetId: biz._id,
      title: biz.name,
      subtitle: `${biz.category} · ${biz.location.city}, ${biz.location.state}`,
      priceInfo: biz.priceRange,
    });
  };

  const handleReserveStayOrDining = (item: StayOrDining) => {
    setBookingTarget({
      targetType: item.type === 'Restaurants' ? 'dining' : 'stay',
      targetId: item.id,
      title: item.name,
      subtitle: `${item.type} · ${item.neighborhood}`,
      priceInfo: item.priceLabel,
    });
  };

  const handleInquirePartnerFromDetails = (
    partnerName: string,
    destinationName: string,
  ) => {
    setBookingTarget({
      targetType: 'destination_partner',
      title: partnerName,
      subtitle: `Local Partner near ${destinationName}`,
      priceInfo: 'Custom local booking inquiry',
    });
  };

  const handleAskAiAboutDestination = (destination: DestinationDocument) => {
    setPendingAiPrompt(
      `Tell me the best time of day to visit ${destination.name} (${destination.location.district}, ${destination.location.state}), entry fee tips, and pair it with ${destination.nearbyPartner} and a nearby lunch stop.`,
    );
    scrollToSection('ai-assistant');
  };

  const handleBuildAiPlanFromDrawer = () => {
    setTripDrawerOpen(false);
    setPendingAiPrompt(
      `Create a well-paced Indian itinerary covering my saved spots: ${savedPlaceNames.join(', ')}, including recommended local guides and dining stops.`,
    );
    scrollToSection('ai-assistant');
  };

  const handleDestinationUpdated = (updated: DestinationDocument) => {
    setDestinations((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item)),
    );
  };

  const handleBusinessUpdated = (updated: BusinessDocument) => {
    setBusinesses((prev) =>
      prev.map((item) => (item._id === updated._id ? updated : item)),
    );
  };

  const handleRegisterBusinessClick = () => {
    if (!user) {
      navigate('/register');
    } else {
      navigate('/register-business');
    }
  };

  const navCtaLabel = user ? 'Dashboard' : 'Sign In';
  const handleNavCtaClick = () => {
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F4] text-[#17261E]">
      <Navbar
        ctaLabel={navCtaLabel}
        onCtaClick={handleNavCtaClick}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        {route.kind === 'destination_details' && (
          <DestinationDetailsPage
            slug={route.slug}
            allDestinations={destinations}
            savedIds={savedIds}
            onBack={() => scrollToSection('destinations')}
            onSelectDestination={(dest) =>
              navigate(`/destinations/${encodeURIComponent(dest.slug)}`)
            }
            onToggleSave={handleToggleSave}
            onAskAiAbout={handleAskAiAboutDestination}
            onInquirePartner={handleInquirePartnerFromDetails}
            onDestinationUpdated={handleDestinationUpdated}
          />
        )}

        {route.kind === 'business_details' && (
          <BusinessDetailsPage
            slug={route.slug}
            allBusinesses={businesses}
            onBack={() => scrollToSection('businesses')}
            onSelectBusiness={(biz) =>
              navigate(`/businesses/${encodeURIComponent(biz.slug)}`)
            }
            onInquire={handleInquireBusiness}
            onBusinessUpdated={handleBusinessUpdated}
          />
        )}

        {route.kind === 'login' && (
          <AuthPage
            initialMode={route.mode}
            onSuccess={() => navigate('/dashboard')}
            onBackHome={() => navigate('/')}
          />
        )}

        {route.kind === 'dashboard' && (
          <DashboardPage
            initialTab={route.tab}
            savedDestinations={savedDestinations}
            allDestinations={destinations}
            categories={categories}
            onBackHome={() => navigate('/')}
            onRequireLogin={() => navigate('/login')}
            onViewBusinessDetails={(biz) =>
              navigate(`/businesses/${encodeURIComponent(biz.slug)}`)
            }
            onViewDestinationDetails={(dest) =>
              navigate(`/destinations/${encodeURIComponent(dest.slug)}`)
            }
            onPublicDirectoryChanged={refreshPublicPortal}
          />
        )}

        {route.kind === 'home' && (
          <>
            <HeroSection
              onExploreClick={() => scrollToSection('destinations')}
              onAiClick={() => scrollToSection('ai-assistant')}
            />

            <DestinationSearchBar
              query={searchQuery}
              onQueryChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              categories={destinationCategories}
              resultCount={filteredDestinations.length}
              savedCount={savedIds.length}
              onOpenTripDrawer={() => setTripDrawerOpen(true)}
            />

            <DestinationsSection
              destinations={filteredDestinations}
              isLoading={isLoadingDestinations}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
              onViewDetails={(dest) =>
                navigate(`/destinations/${encodeURIComponent(dest.slug)}`)
              }
              onResetFilters={handleResetFilters}
            />

            <BusinessesSection
              businesses={businesses}
              categories={businessCategories}
              isLoading={isLoadingBusinesses}
              onViewBusinessDetails={(biz) =>
                navigate(`/businesses/${encodeURIComponent(biz.slug)}`)
              }
              onInquireBusiness={handleInquireBusiness}
              onRegisterBusinessClick={handleRegisterBusinessClick}
            />

            <PortalMapSection
              destinations={destinations}
              businesses={businesses}
              onViewDestinationDetails={(dest) =>
                navigate(`/destinations/${encodeURIComponent(dest.slug)}`)
              }
              onViewBusinessDetails={(biz) =>
                navigate(`/businesses/${encodeURIComponent(biz.slug)}`)
              }
            />

            <StaysAndDiningSection onReserveItem={handleReserveStayOrDining} />

            <AiAssistantSection
              savedPlaceNames={savedPlaceNames}
              pendingPrompt={pendingAiPrompt}
              onConsumePendingPrompt={() => setPendingAiPrompt(null)}
            />

            <ReviewsSection />
          </>
        )}
      </main>

      <Footer />

      <BookingModal
        target={bookingTarget}
        onClose={() => setBookingTarget(null)}
      />

      <TripDrawer
        isOpen={tripDrawerOpen}
        savedDestinations={savedDestinations}
        onClose={() => setTripDrawerOpen(false)}
        onRemove={handleToggleSave}
        onBuildAiPlan={handleBuildAiPlanFromDrawer}
      />
    </div>
  );
}
