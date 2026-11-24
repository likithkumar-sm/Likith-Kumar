import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  MapPin,
  Star,
  Ticket,
} from 'lucide-react';
import {useEffect, useState, type FormEvent} from 'react';
import {LocationMiniMap} from '../components/LocationMiniMap';
import {PortalImage} from '../components/PortalImage';
import {useAuth} from '../context/AuthContext';
import {destinationService} from '../services/destinationService';
import type {DestinationDocument} from '../types/destination';

interface DestinationDetailsPageProps {
  slug: string;
  allDestinations: DestinationDocument[];
  savedIds: string[];
  onBack: () => void;
  onSelectDestination: (dest: DestinationDocument) => void;
  onToggleSave: (id: string) => void;
  onAskAiAbout: (dest: DestinationDocument) => void;
  onInquirePartner: (partnerName: string, destinationName: string) => void;
  onDestinationUpdated: (updated: DestinationDocument) => void;
}

export function DestinationDetailsPage({
  slug,
  allDestinations,
  savedIds,
  onBack,
  onSelectDestination,
  onToggleSave,
  onAskAiAbout,
  onInquirePartner,
  onDestinationUpdated,
}: DestinationDetailsPageProps) {
  const {token} = useAuth();
  const initialMatch =
    allDestinations.find((d) => d.slug === slug || d._id === slug) ?? null;

  const [destination, setDestination] = useState<DestinationDocument | null>(initialMatch);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!initialMatch);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Destination review form state
  const [author, setAuthor] = useState('');
  const [hometown, setHometown] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'auto'});
    setActivePhotoIndex(0);
    setReviewError(null);
    setReviewSuccess(false);

    let cancelled = false;
    const matched = allDestinations.find((d) => d.slug === slug || d._id === slug) ?? null;
    if (matched) {
      setDestination(matched);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    destinationService
      .getBySlugOrId(slug)
      .then((fresh) => {
        if (!cancelled) {
          setDestination(fresh);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && !matched) {
          setLoadError(
            err instanceof Error ? err.message : 'Unable to load destination details.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, allDestinations]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-6 w-48 bg-[#E7DEC9] rounded mb-6 animate-pulse" />
        <div className="aspect-[16/9] bg-[#E7DEC9] rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-48 bg-[#F3EDE2] rounded-xl animate-pulse" />
          <div className="h-48 bg-[#F3EDE2] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (loadError || !destination) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#133828] mb-3">
          Destination Not Found
        </h1>
        <p className="text-sm text-[#495A50] mb-6">
          {loadError || 'The requested destination record could not be located.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </button>
      </div>
    );
  }

  const isSaved = savedIds.includes(destination._id);
  const photos =
    destination.gallery.length > 0 ? destination.gallery : [destination.image];
  const activePhoto = photos[activePhotoIndex] ?? destination.image;

  const relatedDestinations = allDestinations
    .filter((d) => d._id !== destination._id)
    .slice(0, 3);

  const handleCopyAddress = () => {
    const fullText = `${destination.name}, ${destination.location.address}, ${destination.location.district}, ${destination.location.state} ${destination.location.pinCode}`;
    void navigator.clipboard?.writeText(fullText);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!author.trim() || comment.trim().length < 10) {
      setReviewError('Please enter your name and a review of at least 10 characters.');
      return;
    }

    setSubmittingReview(true);
    try {
      const updated = await destinationService.submitReview(
        destination._id,
        {
          author: author.trim(),
          hometown: hometown.trim() || 'India Traveler',
          rating,
          comment: comment.trim(),
        },
        token,
      );
      setDestination(updated);
      onDestinationUpdated(updated);
      setAuthor('');
      setHometown('');
      setRating(5);
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: unknown) {
      setReviewError(
        err instanceof Error ? err.message : 'Unable to save review right now.',
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] pb-20">
      {/* Breadcrumb & Back Navigation Strip */}
      <div className="bg-[#F3EDE2] border-b border-[#E7DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-[#495A50]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-semibold text-[#133828] hover:text-[#997027] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Destinations</span>
            </button>
            <span aria-hidden="true">/</span>
            <span>{destination.location.state}</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#133828] font-medium truncate max-w-[220px] sm:max-w-none">
              {destination.name}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(destination._id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#133828] bg-white hover:bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
          >
            <Bookmark
              className={`w-4 h-4 ${isSaved ? 'text-[#B88B3A] fill-[#B88B3A]' : ''}`}
            />
            <span>{isSaved ? 'Saved in Trip' : 'Save to Trip'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Title & Summary Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
              {destination.category} · {destination.location.district},{' '}
              {destination.location.state}
            </p>
            <h1
              className="font-display text-3xl sm:text-5xl font-semibold text-[#133828] tracking-tight leading-[1.1]"
              style={{textWrap: 'balance'}}
            >
              {destination.name}
            </h1>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 font-display text-2xl font-semibold text-[#133828] tabular-nums">
                <Star className="w-5 h-5 text-[#B88B3A] fill-[#B88B3A]" />
                <span>{destination.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[#5A6C61] tabular-nums">
                {destination.reviewCount} verified reviews
              </p>
            </div>
          </div>
        </div>

        {/* Hero Photograph + Thumbnail Gallery Switcher */}
        <div className="mb-12 space-y-3">
          <div className="aspect-[16/9] max-h-[540px] w-full rounded-xl overflow-hidden border border-[#E7DEC9] bg-[#E7DEC9]">
            <PortalImage
              src={activePhoto}
              alt={`${destination.name} photograph`}
              title={destination.name}
              className="w-full h-full object-cover"
            />
          </div>

          {photos.length > 1 && (
            <div className="flex items-center gap-3">
              {photos.map((photoUrl, idx) => (
                <button
                  key={`${photoUrl}-${idx}`}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  aria-label={`View photo ${idx + 1} of ${destination.name}`}
                  className={`w-28 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === activePhotoIndex
                      ? 'border-[#133828] opacity-100'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <PortalImage
                    src={photoUrl}
                    alt={`${destination.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Two-Column Editorial Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column (7 cols): Description, Highlights & Destination Reviews */}
          <div className="lg:col-span-7 space-y-12">
            {/* Description */}
            <section aria-labelledby="about-dest-heading">
              <h2
                id="about-dest-heading"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#133828] mb-4"
              >
                About This Destination
              </h2>
              <div className="space-y-4 text-base text-[#35463D] leading-relaxed">
                {destination.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>

            {/* Visitor Highlights */}
            <section
              aria-labelledby="highlights-heading"
              className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-xl p-6 sm:p-7"
            >
              <h2
                id="highlights-heading"
                className="font-display text-xl font-semibold text-[#133828] mb-4"
              >
                Key Highlights &amp; Trail Notes
              </h2>
              <ul className="space-y-3 text-sm sm:text-base text-[#35463D]">
                {destination.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#256146] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Destination Ratings & Reviews */}
            <section aria-labelledby="dest-reviews-heading" className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DEC9] pb-4">
                <div>
                  <h2
                    id="dest-reviews-heading"
                    className="font-display text-2xl font-semibold text-[#133828]"
                  >
                    Visitor Ratings &amp; Reviews
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5A6C61] mt-1 tabular-nums">
                    Average {destination.rating.toFixed(1)} out of 5 across{' '}
                    {destination.reviewCount} traveler reports
                  </p>
                </div>
              </div>

              {/* Existing Destination Reviews */}
              <div className="space-y-4">
                {destination.reviews.map((rev) => (
                  <article
                    key={rev._id}
                    className="bg-white border border-[#E7DEC9] rounded-xl p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="text-xs text-[#5A6C61]">
                        <strong className="text-sm text-[#133828] font-semibold">
                          {rev.author}
                        </strong>
                        <span aria-hidden="true"> · </span>
                        <span>{rev.hometown}</span>
                        <span aria-hidden="true"> · </span>
                        <span>{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'text-[#B88B3A] fill-[#B88B3A]'
                                : 'text-[#E7DEC9]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#35463D] leading-relaxed">{rev.comment}</p>
                  </article>
                ))}
              </div>

              {/* Submit Review for this Destination */}
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-4"
              >
                <h3 className="font-display text-lg font-semibold text-[#133828]">
                  Write a Review for {destination.name}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="dest-rev-author"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      id="dest-rev-author"
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Karthik Sharma"
                      className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="dest-rev-home"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      City / State
                    </label>
                    <input
                      id="dest-rev-home"
                      type="text"
                      value={hometown}
                      onChange={(e) => setHometown(e.target.value)}
                      placeholder="e.g. Hyderabad, Telangana"
                      className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#425349] mb-1">
                    Your Rating
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        aria-label={`Rate ${val} stars`}
                        onClick={() => setRating(val)}
                        className="p-1 rounded hover:bg-[#F3EDE2] cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            val <= rating
                              ? 'text-[#B88B3A] fill-[#B88B3A]'
                              : 'text-[#D5C8AD]'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-[#133828] tabular-nums">
                      {rating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="dest-rev-comment"
                    className="block text-xs font-medium text-[#425349] mb-1"
                  >
                    Experience &amp; Tips
                  </label>
                  <textarea
                    id="dest-rev-comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share road conditions, entry queue tips, or best photography timing..."
                    className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                  />
                </div>

                {reviewError && (
                  <p role="alert" className="text-xs font-medium text-[#8C2626]">
                    {reviewError}
                  </p>
                )}

                {reviewSuccess && (
                  <div className="flex items-center gap-2 text-xs font-medium text-[#133828] bg-[#F3EDE2] px-3 py-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-[#256146]" />
                    <span>Review published and average rating updated.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:bg-[#8DA095] rounded-lg transition-colors cursor-pointer"
                >
                  {submittingReview ? 'Publishing...' : 'Submit Destination Review'}
                </button>
              </form>
            </section>
          </div>

          {/* Right Column (5 cols): Visitor Logistics Card & Actions */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 sm:p-7 shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)] space-y-6">
              <h2 className="font-display text-2xl font-semibold text-[#133828] pb-4 border-b border-[#E7DEC9]">
                Visitor Logistics
              </h2>

              <dl className="space-y-5 text-sm">
                {/* Location & Full Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-1">
                      Location &amp; Address
                    </dt>
                    <dd className="text-[#133828] font-medium leading-relaxed">
                      {destination.location.address}
                      <span className="block text-[#425349] font-normal">
                        {destination.location.district}, {destination.location.state} —{' '}
                        <span className="tabular-nums">{destination.location.pinCode}</span>
                      </span>
                      <span className="block text-xs font-mono text-[#5A6C61] mt-1 tabular-nums">
                        GPS: {destination.location.coordinates.lat.toFixed(4)}° N,{' '}
                        {destination.location.coordinates.lng.toFixed(4)}° E
                      </span>
                    </dd>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#133828] hover:text-[#997027] cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedCoords ? 'Address copied' : 'Copy full address'}</span>
                    </button>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Clock className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-1">
                      Opening Hours
                    </dt>
                    <dd className="text-[#133828] font-medium tabular-nums">
                      {destination.openingHours}
                    </dd>
                  </div>
                </div>

                {/* Estimated Entry Fees */}
                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Ticket className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-1">
                      Estimated Entry Fees
                    </dt>
                    <dd className="space-y-1 text-[#133828] tabular-nums">
                      <div className="flex justify-between">
                        <span className="text-[#425349]">Indian Nationals</span>
                        <span className="font-semibold">
                          {destination.entryFee.indianAdult === 0
                            ? 'Free'
                            : `₹${destination.entryFee.indianAdult}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#425349]">Foreign Visitors</span>
                        <span className="font-semibold">
                          {destination.entryFee.foreignAdult === 0
                            ? 'Free'
                            : `₹${destination.entryFee.foreignAdult}`}
                        </span>
                      </div>
                      {destination.entryFee.cameraFee !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-[#425349]">Camera / Gear Fee</span>
                          <span className="font-semibold">
                            ₹{destination.entryFee.cameraFee}
                          </span>
                        </div>
                      )}
                      {destination.entryFee.notes && (
                        <p className="text-xs text-[#5A6C61] pt-1">
                          {destination.entryFee.notes}
                        </p>
                      )}
                    </dd>
                  </div>
                </div>

                {/* Season & Duration */}
                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Calendar className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-1">
                      Best Season &amp; Visit Duration
                    </dt>
                    <dd className="text-[#133828] font-medium">
                      {destination.bestSeason} · Suggested {destination.duration}
                    </dd>
                  </div>
                </div>
              </dl>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#E7DEC9] space-y-3">
                <button
                  type="button"
                  onClick={() => onAskAiAbout(destination)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#E2C583]" />
                  <span>Ask AI Concierge About This Place</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onInquirePartner(destination.nearbyPartner, destination.name)
                  }
                  className="w-full py-2.5 px-4 text-sm font-semibold text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] border border-[#D5C8AD] rounded-lg transition-colors cursor-pointer"
                >
                  Book Nearby Partner: {destination.nearbyPartner}
                </button>
              </div>

              <div className="pt-4 border-t border-[#E7DEC9]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-2.5">
                  Interactive Location &amp; Directions
                </h3>
                <LocationMiniMap
                  title={destination.name}
                  subtitle={`${destination.location.district}, ${destination.location.state}`}
                  coordinates={destination.location.coordinates}
                  pinColor="green"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Related Destinations Strip */}
        {relatedDestinations.length > 0 && (
          <section
            aria-labelledby="more-dest-heading"
            className="mt-16 pt-12 border-t border-[#E7DEC9]"
          >
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2
                id="more-dest-heading"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#133828]"
              >
                Explore More Indian Destinations
              </h2>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-[#133828] hover:text-[#997027] underline underline-offset-4 cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedDestinations.map((rel) => (
                <article
                  key={rel._id}
                  className="bg-white border border-[#E7DEC9] rounded-xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#F3EDE2] overflow-hidden">
                    <PortalImage
                      src={rel.image}
                      alt={rel.name}
                      title={rel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#997027] font-semibold mb-1">
                        {rel.category} · {rel.location.state}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-[#133828] mb-2">
                        {rel.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectDestination(rel)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#133828] hover:text-[#997027] mt-2 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
