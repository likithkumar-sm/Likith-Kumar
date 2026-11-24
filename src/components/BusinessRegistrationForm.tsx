import {CheckCircle2} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {BUSINESS_CATEGORIES} from '../data/businessesSeed';
import type {CreateBusinessPayload} from '../services/businessService';
import type {BusinessCategoryValue, BusinessDocument} from '../types/business';

interface BusinessRegistrationFormProps {
  initialBusiness?: BusinessDocument | null;
  submitLabel?: string;
  onSubmit: (payload: CreateBusinessPayload) => Promise<void>;
  onCancel?: () => void;
}

export function BusinessRegistrationForm({
  initialBusiness,
  submitLabel,
  onSubmit,
  onCancel,
}: BusinessRegistrationFormProps) {
  const [name, setName] = useState(initialBusiness?.name ?? '');
  const [category, setCategory] = useState<BusinessCategoryValue>(
    initialBusiness?.category ?? 'Hotels',
  );
  const [image, setImage] = useState(initialBusiness?.image ?? '');
  const [shortDescription, setShortDescription] = useState(
    initialBusiness?.shortDescription ?? '',
  );
  const [description, setDescription] = useState(
    initialBusiness?.description ?? '',
  );
  const [city, setCity] = useState(initialBusiness?.location.city ?? '');
  const [state, setState] = useState(initialBusiness?.location.state ?? '');
  const [address, setAddress] = useState(
    initialBusiness?.location.address ?? '',
  );
  const [phone, setPhone] = useState(initialBusiness?.contact.phone ?? '');
  const [email, setEmail] = useState(initialBusiness?.contact.email ?? '');
  const [operatingHours, setOperatingHours] = useState(
    initialBusiness?.operatingHours ?? '09:00 AM – 08:00 PM (Daily)',
  );
  const [priceRange, setPriceRange] = useState(
    initialBusiness?.priceRange ?? '',
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (
      !name.trim() ||
      !shortDescription.trim() ||
      !city.trim() ||
      !state.trim() ||
      !address.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !operatingHours.trim()
    ) {
      setError('Please complete all required business details.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        category,
        image: image.trim() || undefined,
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim(),
        city: city.trim(),
        state: state.trim(),
        address: address.trim(),
        phone: phone.trim(),
        email: email.trim(),
        operatingHours: operatingHours.trim(),
        priceRange: priceRange.trim() || 'Contact for rates',
      });
      setSuccess(true);
      if (!initialBusiness) {
        setName('');
        setImage('');
        setShortDescription('');
        setDescription('');
        setCity('');
        setState('');
        setAddress('');
        setPhone('');
        setEmail('');
        setPriceRange('');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to submit business listing.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E7DEC9] rounded-xl p-6 sm:p-8 space-y-5"
    >
      <div>
        <h3 className="font-display text-2xl font-semibold text-[#133828]">
          {initialBusiness
            ? `Edit Listing: ${initialBusiness.name}`
            : 'Business Registration Form'}
        </h3>
        <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
          {initialBusiness
            ? 'Update your business details below.'
            : 'Submitted listings enter the Administrator review queue before appearing in the public directory.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="biz-name"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Business Name *
          </label>
          <input
            id="biz-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Nilgiri Heritage Homestay"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>

        <div>
          <label
            htmlFor="biz-category"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Business Category *
          </label>
          <select
            id="biz-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BusinessCategoryValue)}
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          >
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="biz-city"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            City / Town *
          </label>
          <input
            id="biz-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Coonoor"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>

        <div>
          <label
            htmlFor="biz-state"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            State *
          </label>
          <input
            id="biz-state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. Tamil Nadu"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="biz-address"
          className="block text-xs font-medium text-[#425349] mb-1"
        >
          Full Street / Landmark Address *
        </label>
        <input
          id="biz-address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. 18 Bedford Circle, Near Sim's Park, Coonoor 643101"
          className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="biz-phone"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Contact Phone *
          </label>
          <input
            id="biz-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +91 98400 12345"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>

        <div>
          <label
            htmlFor="biz-email"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Contact Email *
          </label>
          <input
            id="biz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="bookings@yourbusiness.in"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="biz-hours"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Operating Hours *
          </label>
          <input
            id="biz-hours"
            type="text"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            placeholder="e.g. 08:00 AM – 09:00 PM (Daily)"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>

        <div>
          <label
            htmlFor="biz-price"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Estimated Rate / Price Range
          </label>
          <input
            id="biz-price"
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. ₹3,500 / night or ₹800 for two"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>
      </div>

      {!initialBusiness && (
        <div>
          <label
            htmlFor="biz-image"
            className="block text-xs font-medium text-[#425349] mb-1"
          >
            Business Image URL (Optional — category photo used if blank)
          </label>
          <input
            id="biz-image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="biz-short-desc"
          className="block text-xs font-medium text-[#425349] mb-1"
        >
          Short Summary *
        </label>
        <input
          id="biz-short-desc"
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          placeholder="One-sentence summary displayed on the directory card..."
          className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
        />
      </div>

      <div>
        <label
          htmlFor="biz-full-desc"
          className="block text-xs font-medium text-[#425349] mb-1"
        >
          Full Description
        </label>
        <textarea
          id="biz-full-desc"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your services, heritage story, facilities, and booking policies..."
          className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-[#8C2626]">
          {error}
        </p>
      )}

      {success && (
        <div className="flex items-center gap-2 text-xs font-medium text-[#133828] bg-[#F3EDE2] px-3.5 py-2.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4 text-[#256146]" />
          <span>
            {initialBusiness
              ? 'Business listing updated.'
              : 'Business submitted for Administrator approval.'}
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-[#425349] hover:text-[#133828] cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:bg-[#8DA095] rounded-lg transition-colors cursor-pointer"
        >
          {isSubmitting
            ? 'Submitting...'
            : submitLabel ||
              (initialBusiness ? 'Save Changes' : 'Submit Business for Approval')}
        </button>
      </div>
    </form>
  );
}
