import {CheckCircle2, Loader2, X} from 'lucide-react';
import {useEffect, useState, type FormEvent} from 'react';
import {useAuth} from '../context/AuthContext';
import {bookingService} from '../services/bookingService';
import type {BookingTargetType} from '../types/portal';

export interface BookingTarget {
  targetType: BookingTargetType;
  targetId?: string;
  title: string;
  subtitle: string;
  priceInfo: string;
}

interface BookingModalProps {
  target: BookingTarget | null;
  onClose: () => void;
}

export function BookingModal({target, onClose}: BookingModalProps) {
  const {user, token} = useAuth();

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [guestsCount, setGuestsCount] = useState('2');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setConfirmedId(null);
    setError(null);
    setSubmitting(false);
    if (user) {
      setGuestName((prev) => prev || user.name);
      setGuestEmail((prev) => prev || user.email);
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [target, user, onClose]);

  if (!target) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!guestName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!emailPattern.test(guestEmail.trim())) {
      setError('Please provide a valid email address for confirmation.');
      return;
    }
    if (!visitDate) {
      setError('Please select a preferred visit date.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingService.create(
        {
          targetType: target.targetType,
          targetId: target.targetId,
          targetName: target.title,
          targetSubtitle: target.subtitle,
          priceInfo: target.priceInfo,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          visitDate,
          guestsCount,
          notes: notes.trim(),
        },
        token,
      );
      setConfirmedId(booking._id);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit booking inquiry right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C2419]/65 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAF8F4] border border-[#D5C8AD] rounded-xl max-w-lg w-full p-6 sm:p-7 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7DEC9]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#997027]">
              Direct Local Inquiry
            </p>
            <h2
              id="booking-modal-title"
              className="font-display text-2xl font-semibold text-[#133828] mt-0.5"
            >
              {target.title}
            </h2>
            <p className="text-xs text-[#5A6C61] mt-1">
              {target.subtitle} ·{' '}
              <span className="font-medium text-[#133828]">{target.priceInfo}</span>
            </p>
          </div>

          <button
            type="button"
            aria-label="Close inquiry modal"
            onClick={onClose}
            className="w-9 h-9 rounded-lg text-[#425349] hover:bg-[#F3EDE2] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedId ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-11 h-11 text-[#256146] mx-auto" />
            <h3 className="font-display text-2xl font-semibold text-[#133828]">
              Inquiry Saved for {target.title}
            </h3>
            <p className="text-xs font-mono text-[#5A6C61] tabular-nums">
              Booking Reference: {confirmedId}
            </p>
            <p className="text-sm text-[#425349] leading-relaxed max-w-sm mx-auto">
              Thank you, <strong>{guestName}</strong>. Your request for{' '}
              <strong className="tabular-nums">{guestsCount}</strong> guest(s) on{' '}
              <strong className="tabular-nums">{visitDate}</strong> has been stored in
              our portal database. Confirmation details apply to{' '}
              <strong>{guestEmail}</strong>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="pt-5 space-y-4">
            <div>
              <label
                htmlFor="inq-name"
                className="block text-xs font-medium text-[#425349] mb-1"
              >
                Full Name
              </label>
              <input
                id="inq-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
              />
            </div>

            <div>
              <label
                htmlFor="inq-email"
                className="block text-xs font-medium text-[#425349] mb-1"
              >
                Email Address
              </label>
              <input
                id="inq-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="inq-date"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Preferred Date
                </label>
                <input
                  id="inq-date"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="inq-guests"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Guests / Party Size
                </label>
                <select
                  id="inq-guests"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="6+">6+ Group</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="inq-notes"
                className="block text-xs font-medium text-[#425349] mb-1"
              >
                Special Preferences (Optional)
              </label>
              <textarea
                id="inq-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dietary needs, early morning pickup, accessibility requests..."
                className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-[#8C2626]">
                {error}
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-[#425349] hover:text-[#133828] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{submitting ? 'Sending...' : 'Send Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
