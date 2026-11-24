import {CheckCircle2, Edit3, Loader2, Star, Trash2} from 'lucide-react';
import {useEffect, useMemo, useState, type FormEvent} from 'react';
import {useAuth} from '../context/AuthContext';
import {INITIAL_REVIEWS, type ReviewCategory} from '../data/portalData';
import {reviewService} from '../services/reviewService';
import type {PortalReviewCategory, ReviewDocument} from '../types/portal';

const REVIEW_TABS: ReviewCategory[] = [
  'All',
  'Destinations',
  'Stays & Dining',
  'Local Businesses',
];

const FALLBACK_REVIEWS: ReviewDocument[] = INITIAL_REVIEWS.map((r) => ({
  _id: r.id,
  targetType: 'portal',
  targetId: 'portal',
  targetName: r.placeName,
  category: r.category,
  author: r.author,
  hometown: r.hometown,
  rating: r.rating,
  date: r.date,
  comment: r.comment,
  createdAt: '2026-10-10T09:00:00.000Z',
  updatedAt: '2026-10-10T09:00:00.000Z',
}));

export function ReviewsSection() {
  const {user, token} = useAuth();
  const [reviews, setReviews] = useState<ReviewDocument[]>(FALLBACK_REVIEWS);
  const [activeTab, setActiveTab] = useState<ReviewCategory>('All');

  // Create form state
  const [author, setAuthor] = useState('');
  const [hometown, setHometown] = useState('');
  const [placeName, setPlaceName] = useState('');
  const [category, setCategory] = useState<PortalReviewCategory>('Destinations');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Edit review state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editBusy, setEditBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setAuthor((prev) => prev || user.name);
      setHometown((prev) => prev || user.city);
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    reviewService
      .list()
      .then((list) => {
        if (!cancelled && list.length > 0) {
          setReviews(list);
        }
      })
      .catch(() => {
        // Retain fallback reviews if API unavailable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = total > 0 ? sum / total : 0;
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((r) => r.rating === stars).length;
      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
      return {stars, count, pct};
    });
    return {total, avg, distribution};
  }, [reviews]);

  const filteredReviews =
    activeTab === 'All' ? reviews : reviews.filter((r) => r.category === activeTab);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!author.trim() || !placeName.trim() || comment.trim().length < 10) {
      setFormError(
        'Please enter your name, the place visited, and a short reflection (at least 10 characters).',
      );
      return;
    }

    setSubmitting(true);
    try {
      const created = await reviewService.create(
        {
          author: author.trim(),
          hometown: hometown.trim() || 'Visiting Traveler',
          targetName: placeName.trim(),
          category,
          rating,
          comment: comment.trim(),
          targetType: 'portal',
        },
        token,
      );

      setReviews((prev) => [created, ...prev]);
      if (!user) {
        setAuthor('');
        setHometown('');
      }
      setPlaceName('');
      setRating(5);
      setComment('');
      setSubmittedNotice(true);
      setTimeout(() => setSubmittedNotice(false), 4000);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to save review.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (rev: ReviewDocument) => {
    setEditingId(rev._id);
    setEditComment(rev.comment);
    setEditRating(rev.rating);
  };

  const handleSaveEdit = async (id: string) => {
    if (!token) return;
    setEditBusy(true);
    try {
      const updated = await reviewService.update(
        id,
        {comment: editComment.trim(), rating: editRating},
        token,
      );
      setReviews((prev) => prev.map((r) => (r._id === id ? updated : r)));
      setEditingId(null);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to update review.',
      );
    } finally {
      setEditBusy(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!token) return;
    try {
      await reviewService.remove(id, token);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to delete review.',
      );
    }
  };

  return (
    <section
      id="reviews"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
    >
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-2">
            05. Traveler Reviews &amp; Ratings
          </p>
          <h2
            className="font-display text-3xl sm:text-4xl font-semibold text-[#133828] tracking-tight"
            style={{textWrap: 'balance'}}
          >
            Field notes from recent visitors across India.
          </h2>
        </div>

        <div
          role="tablist"
          aria-label="Filter traveler reviews"
          className="flex flex-wrap items-center gap-1.5 bg-[#F3EDE2] p-1.5 rounded-lg border border-[#E7DEC9]"
        >
          {REVIEW_TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#133828] ${
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Rating Summary + Write Review Form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-xl p-6">
            <div className="flex items-baseline justify-between gap-4 pb-5 border-b border-[#D5C8AD]">
              <div>
                <div className="font-display text-4xl font-semibold text-[#133828] tabular-nums">
                  {stats.avg.toFixed(1)}{' '}
                  <span className="text-lg font-normal text-[#5A6C61]">/ 5.0</span>
                </div>
                <p className="text-xs text-[#495A50] mt-1 tabular-nums">
                  Based on {stats.total} verified community reviews
                </p>
              </div>
              <div
                className="flex items-center gap-1"
                aria-label={`Rated ${stats.avg.toFixed(1)} out of 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(stats.avg)
                        ? 'text-[#B88B3A] fill-[#B88B3A]'
                        : 'text-[#D5C8AD]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-5 space-y-2.5">
              {stats.distribution.map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-xs">
                  <span className="w-10 text-[#133828] font-medium tabular-nums shrink-0">
                    {row.stars} ★
                  </span>
                  <div className="flex-1 h-2 bg-[#E7DEC9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#133828] rounded-full transition-all duration-300"
                      style={{width: `${row.pct}%`}}
                    />
                  </div>
                  <span className="w-9 text-right text-[#5A6C61] tabular-nums shrink-0">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-4"
          >
            <h3 className="font-display text-xl font-semibold text-[#133828]">
              Share Your Experience
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="rev-author"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Your Name
                </label>
                <input
                  id="rev-author"
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. Rohan Kulkarni"
                  className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="rev-hometown"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  City / Origin
                </label>
                <input
                  id="rev-hometown"
                  type="text"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  placeholder="e.g. Mysuru"
                  className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="rev-place"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Place or Business Visited
                </label>
                <input
                  id="rev-place"
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Kumbhalgarh Citadel"
                  className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="rev-category"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Category
                </label>
                <select
                  id="rev-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as PortalReviewCategory)
                  }
                  className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828] cursor-pointer"
                >
                  <option value="Destinations">Destinations</option>
                  <option value="Stays & Dining">Stays &amp; Dining</option>
                  <option value="Local Businesses">Local Businesses</option>
                </select>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-[#425349] mb-1.5">
                Rating
              </span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-label={`Rate ${value} out of 5 stars`}
                    onClick={() => setRating(value)}
                    className="p-1.5 rounded-md hover:bg-[#F3EDE2] transition-colors cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        value <= rating
                          ? 'text-[#B88B3A] fill-[#B88B3A]'
                          : 'text-[#D5C8AD]'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-medium text-[#133828] tabular-nums">
                  {rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label
                htmlFor="rev-comment"
                className="block text-xs font-medium text-[#425349] mb-1"
              >
                Your Review
              </label>
              <textarea
                id="rev-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share tips on timing, hospitality, or trail conditions..."
                className="w-full px-3.5 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
              />
            </div>

            {formError && (
              <p role="alert" className="text-xs text-[#8C2626] font-medium">
                {formError}
              </p>
            )}

            {submittedNotice && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#133828] bg-[#F3EDE2] px-3 py-2 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-[#256146]" />
                <span>Thank you — your review is now saved and published.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:opacity-60 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B88B3A]"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{submitting ? 'Publishing...' : 'Publish Review'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Review Feed */}
        <div className="lg:col-span-7 space-y-5">
          {filteredReviews.map((review) => {
            const canManage =
              Boolean(user && token) &&
              (user?.role === 'admin' ||
                (review.userId && review.userId === user?.id));
            const isEditing = editingId === review._id;

            return (
              <article
                key={review._id}
                className="bg-white border border-[#E7DEC9] rounded-xl p-6 shadow-[0_4px_16px_-10px_rgba(19,56,40,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-[#133828]">
                      {review.targetName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A6C61] mt-1">
                      <span className="font-semibold text-[#17261E]">{review.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.hometown}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#997027] font-medium">{review.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{review.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center gap-1 shrink-0"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= review.rating
                              ? 'text-[#B88B3A] fill-[#B88B3A]'
                              : 'text-[#E7DEC9]'
                          }`}
                        />
                      ))}
                    </div>

                    {canManage && !isEditing && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="Edit review"
                          onClick={() => handleStartEdit(review)}
                          className="p-1.5 text-[#425349] hover:text-[#133828] rounded cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete review"
                          onClick={() => void handleDeleteReview(review._id)}
                          className="p-1.5 text-[#8C2626] hover:text-[#661919] rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditRating(val)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              val <= editRating
                                ? 'text-[#B88B3A] fill-[#B88B3A]'
                                : 'text-[#D5C8AD]'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={editBusy}
                        onClick={() => void handleSaveEdit(review._id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#133828] rounded-md cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-medium text-[#5A6C61] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#3A4B41] leading-relaxed">{review.comment}</p>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
