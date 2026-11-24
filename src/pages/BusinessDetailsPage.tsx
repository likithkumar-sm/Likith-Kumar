import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Tag,
} from 'lucide-react';
import {useEffect, useState, type FormEvent} from 'react';
import {LocationMiniMap} from '../components/LocationMiniMap';
import {PortalImage} from '../components/PortalImage';
import {useAuth} from '../context/AuthContext';
import {businessService} from '../services/businessService';
import type {BusinessDocument} from '../types/business';
import {getBusinessCoordinates} from '../utils/geo';

interface BusinessDetailsPageProps {
  slug: string;
  allBusinesses: BusinessDocument[];
  onBack: () => void;
  onSelectBusiness: (biz: BusinessDocument) => void;
  onInquire: (biz: BusinessDocument) => void;
  onBusinessUpdated: (updated: BusinessDocument) => void;
}

export function BusinessDetailsPage({
  slug,
  allBusinesses,
  onBack,
  onSelectBusiness,
  onInquire,
  onBusinessUpdated,
}: BusinessDetailsPageProps) {
  const {token} = useAuth();
  const initialMatch =
    allBusinesses.find((b) => b.slug === slug || b._id === slug) ?? null;

  const [business, setBusiness] = useState<BusinessDocument | null>(initialMatch);
  const [isLoading, setIsLoading] = useState(!initialMatch);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({top: 0, behavior: 'auto'});
    setReviewError(null);
    setReviewSuccess(false);

    let cancelled = false;
    const matched =
      allBusinesses.find((b) => b.slug === slug || b._id === slug) ?? null;
    if (matched) {
      setBusiness(matched);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }

    businessService
      .getBySlugOrId(slug, token)
      .then((fresh) => {
        if (!cancelled) {
          setBusiness(fresh);
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && !matched) {
          setLoadError(
            err instanceof Error ? err.message : 'Business listing not found.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, allBusinesses, token]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="h-6 w-48 bg-[#E7DEC9] rounded mb-6 animate-pulse" />
        <div className="aspect-[16/9] bg-[#E7DEC9] rounded-xl animate-pulse" />
      </div>
    );
  }

  if (loadError || !business) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold text-[#133828] mb-3">
          Business Listing Unavailable
        </h1>
        <p className="text-sm text-[#495A50] mb-6">
          {loadError || 'The requested business could not be found.'}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Local Business Directory</span>
        </button>
      </div>
    );
  }

  const related = allBusinesses
    .filter((b) => b._id !== business._id && b.status === 'approved')
    .slice(0, 3);

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    if (!author.trim() || comment.trim().length < 10) {
      setReviewError('Please enter your name and a review of at least 10 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await businessService.submitReview(
        business._id,
        {
          author: author.trim(),
          rating,
          comment: comment.trim(),
        },
        token,
      );
      setBusiness(updated);
      onBusinessUpdated(updated);
      setAuthor('');
      setRating(5);
      setComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Unable to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F4] pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-[#F3EDE2] border-b border-[#E7DEC9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-[#495A50]">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 font-semibold text-[#133828] hover:text-[#997027] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Local Business Directory</span>
            </button>
            <span aria-hidden="true">/</span>
            <span>{business.category}</span>
            <span aria-hidden="true">/</span>
            <span className="text-[#133828] font-medium truncate max-w-[220px] sm:max-w-none">
              {business.name}
            </span>
          </div>

          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#133828]">
            <ShieldCheck className="w-4 h-4 text-[#256146]" />
            <span>
              {business.status === 'approved'
                ? 'Verified Directory Listing'
                : business.status === 'pending'
                  ? 'Pending Administrator Approval'
                  : 'Listing Rejected'}
            </span>
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
              {business.category} · {business.location.city}, {business.location.state}
            </p>
            <h1
              className="font-display text-3xl sm:text-5xl font-semibold text-[#133828] tracking-tight leading-[1.1]"
              style={{textWrap: 'balance'}}
            >
              {business.name}
            </h1>
          </div>

          <div className="text-left lg:text-right shrink-0">
            <div className="inline-flex items-center gap-1.5 font-display text-2xl font-semibold text-[#133828] tabular-nums">
              <Star className="w-5 h-5 text-[#B88B3A] fill-[#B88B3A]" />
              <span>{business.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-[#5A6C61] tabular-nums">
              {business.reviewCount} traveler reviews
            </p>
          </div>
        </div>

        {/* Hero Photo */}
        <div className="aspect-[16/9] max-h-[500px] w-full rounded-xl overflow-hidden border border-[#E7DEC9] bg-[#E7DEC9] mb-12">
          <PortalImage
            src={business.image}
            alt={business.name}
            title={business.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-10">
            <section>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#133828] mb-4">
                About {business.name}
              </h2>
              <p className="text-base text-[#35463D] leading-relaxed whitespace-pre-line">
                {business.description}
              </p>
            </section>

            <section className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-xl p-6 sm:p-7">
              <h2 className="font-display text-xl font-semibold text-[#133828] mb-4">
                Services &amp; Highlights
              </h2>
              <ul className="space-y-3 text-sm sm:text-base text-[#35463D]">
                {business.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#256146] shrink-0 mt-1" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Reviews */}
            <section className="space-y-6">
              <h2 className="font-display text-2xl font-semibold text-[#133828] border-b border-[#E7DEC9] pb-3">
                Customer Ratings &amp; Reviews
              </h2>

              {business.reviews.length === 0 ? (
                <p className="text-sm text-[#5A6C61]">
                  No reviews yet. Be the first traveler to share feedback about this business.
                </p>
              ) : (
                <div className="space-y-4">
                  {business.reviews.map((rev) => (
                    <article
                      key={rev._id}
                      className="bg-white border border-[#E7DEC9] rounded-xl p-5"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="text-xs text-[#5A6C61]">
                          <strong className="text-sm text-[#133828] font-semibold">
                            {rev.author}
                          </strong>
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
              )}

              {business.status === 'approved' && (
                <form
                  onSubmit={handleReviewSubmit}
                  className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-4"
                >
                  <h3 className="font-display text-lg font-semibold text-[#133828]">
                    Rate &amp; Review {business.name}
                  </h3>

                  <div>
                    <label
                      htmlFor="biz-rev-author"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      Your Name
                    </label>
                    <input
                      id="biz-rev-author"
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-[#425349] mb-1">
                      Rating
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
                      htmlFor="biz-rev-comment"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      Review
                    </label>
                    <textarea
                      id="biz-rev-comment"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience with service, hospitality, or pricing..."
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
                      <span>Review published successfully.</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:bg-[#8DA095] rounded-lg transition-colors cursor-pointer"
                  >
                    {submitting ? 'Publishing...' : 'Publish Review'}
                  </button>
                </form>
              )}
            </section>
          </div>

          {/* Right Column: Contact, Location & Operating Hours */}
          <aside className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 sm:p-7 shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)] space-y-6">
              <h2 className="font-display text-2xl font-semibold text-[#133828] pb-4 border-b border-[#E7DEC9]">
                Business Information
              </h2>

              <dl className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61]">
                      Category &amp; Pricing
                    </dt>
                    <dd className="text-[#133828] font-medium mt-0.5">
                      {business.category} ·{' '}
                      <span className="tabular-nums">{business.priceRange}</span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <MapPin className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61]">
                      Location &amp; Address
                    </dt>
                    <dd className="text-[#133828] font-medium mt-0.5 leading-relaxed">
                      {business.location.address}
                      <span className="block text-[#425349] font-normal">
                        {business.location.city}, {business.location.state}
                      </span>
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Clock className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61]">
                      Operating Hours
                    </dt>
                    <dd className="text-[#133828] font-medium mt-0.5 tabular-nums">
                      {business.operatingHours}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Phone className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61]">
                      Phone Contact
                    </dt>
                    <dd className="text-[#133828] font-medium mt-0.5 tabular-nums">
                      {business.contact.phone}
                    </dd>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t border-[#F3EDE2]">
                  <Mail className="w-5 h-5 text-[#997027] shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61]">
                      Email Contact
                    </dt>
                    <dd className="text-[#133828] font-medium mt-0.5 break-all">
                      {business.contact.email}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="pt-4 border-t border-[#E7DEC9]">
                <button
                  type="button"
                  onClick={() => onInquire(business)}
                  className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
                >
                  Send Booking / Inquiry Request
                </button>
              </div>

              <div className="pt-4 border-t border-[#E7DEC9]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#5A6C61] mb-2.5">
                  Interactive Location &amp; Directions
                </h3>
                <LocationMiniMap
                  title={business.name}
                  subtitle={`${business.location.city}, ${business.location.state}`}
                  coordinates={getBusinessCoordinates(business)}
                  pinColor="gold"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Related Businesses */}
        {related.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#E7DEC9]">
            <div className="flex items-center justify-between gap-4 mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#133828]">
                More Local Businesses
              </h2>
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-[#133828] hover:text-[#997027] underline underline-offset-4 cursor-pointer"
              >
                View Directory
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rel) => (
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
                      <p className="text-xs font-semibold text-[#997027] mb-1">
                        {rel.category} · {rel.location.city}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-[#133828] mb-2">
                        {rel.name}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onSelectBusiness(rel)}
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
