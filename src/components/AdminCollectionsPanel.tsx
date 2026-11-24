import {Edit3, Plus, Trash2, Users} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {
  destinationService,
  type CreateDestinationPayload,
} from '../services/destinationService';
import {categoryService} from '../services/categoryService';
import {userService} from '../services/userService';
import type {UserProfile, UserRole} from '../types/business';
import type {DestinationCategory, DestinationDocument} from '../types/destination';
import type {CategoryDocument, CategoryScope} from '../types/portal';

interface AdminDestinationsPanelProps {
  token: string;
  destinations: DestinationDocument[];
  onChanged: () => Promise<void> | void;
  onError: (msg: string) => void;
}

export function AdminDestinationsPanel({
  token,
  destinations,
  onChanged,
  onError,
}: AdminDestinationsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<Exclude<DestinationCategory, 'All'>>('Waterfalls');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [openingHours, setOpeningHours] = useState('06:00 – 18:00 Daily');
  const [entryDisplayLabel, setEntryDisplayLabel] = useState('₹100 entry');
  const [bestSeason, setBestSeason] = useState('Oct – Mar');
  const [duration, setDuration] = useState('2.5 hrs');
  const [nearbyPartner, setNearbyPartner] = useState('');
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Waterfalls');
    setShortDescription('');
    setDescription('');
    setState('');
    setDistrict('');
    setAddress('');
    setOpeningHours('06:00 – 18:00 Daily');
    setEntryDisplayLabel('₹100 entry');
    setBestSeason('Oct – Mar');
    setDuration('2.5 hrs');
    setNearbyPartner('');
    setShowForm(false);
  };

  const handleEditClick = (d: DestinationDocument) => {
    setEditingId(d._id);
    setName(d.name);
    setCategory(d.category);
    setShortDescription(d.shortDescription);
    setDescription(d.description);
    setState(d.location.state);
    setDistrict(d.location.district);
    setAddress(d.location.address);
    setOpeningHours(d.openingHours);
    setEntryDisplayLabel(d.entryFee.displayLabel);
    setBestSeason(d.bestSeason);
    setDuration(d.duration);
    setNearbyPartner(d.nearbyPartner);
    setShowForm(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload: CreateDestinationPayload = {
        name: name.trim(),
        category,
        shortDescription: shortDescription.trim(),
        description: description.trim() || shortDescription.trim(),
        state: state.trim(),
        district: district.trim(),
        address: address.trim(),
        openingHours: openingHours.trim(),
        entryDisplayLabel: entryDisplayLabel.trim(),
        bestSeason: bestSeason.trim(),
        duration: duration.trim(),
        nearbyPartner: nearbyPartner.trim(),
      };
      if (editingId) {
        await destinationService.update(editingId, payload, token);
      } else {
        await destinationService.create(payload, token);
      }
      await onChanged();
      resetForm();
    } catch (err: unknown) {
      onError(
        err instanceof Error ? err.message : 'Unable to save destination.',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await destinationService.remove(id, token);
      await onChanged();
    } catch (err: unknown) {
      onError(
        err instanceof Error ? err.message : 'Unable to delete destination.',
      );
    }
  };

  return (
    <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#133828]">
            Tourist Destinations Directory ({destinations.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
            Create, edit, or remove destination records stored in MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showForm ? 'Close Form' : 'Add Destination'}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="bg-[#FAF8F4] border border-[#D5C8AD] rounded-xl p-5 space-y-4"
        >
          <h3 className="font-display text-lg font-semibold text-[#133828]">
            {editingId ? 'Edit Destination' : 'Add New Destination'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <input
              type="text"
              required
              placeholder="Destination name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as Exclude<DestinationCategory, 'All'>)
              }
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            >
              <option value="Waterfalls">Waterfalls</option>
              <option value="Heritage">Heritage</option>
              <option value="Viewpoints">Viewpoints</option>
              <option value="Trails">Trails</option>
            </select>
            <input
              type="text"
              required
              placeholder="District (e.g. Kodagu)"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              required
              placeholder="State (e.g. Karnataka)"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              required
              placeholder="Full address / road marker"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="sm:col-span-2 px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              required
              placeholder="Opening hours"
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              required
              placeholder="Entry fee label (e.g. ₹100 entry)"
              value={entryDisplayLabel}
              onChange={(e) => setEntryDisplayLabel(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              placeholder="Best season (e.g. Oct – Mar)"
              value={bestSeason}
              onChange={(e) => setBestSeason(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
            <input
              type="text"
              placeholder="Typical duration (e.g. 2.5 hrs)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
            />
          </div>
          <input
            type="text"
            placeholder="Nearby cooperative or guide partner (optional)"
            value={nearbyPartner}
            onChange={(e) => setNearbyPartner(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
          />
          <textarea
            required
            rows={2}
            placeholder="Short summary for cards"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
          />
          <textarea
            rows={3}
            placeholder="Full description for destination details page"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
            >
              {busy ? 'Saving...' : editingId ? 'Save Changes' : 'Create Destination'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-medium text-[#5A6C61] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {destinations.map((d) => (
          <div
            key={d._id}
            className="border border-[#E7DEC9] rounded-xl p-4 bg-[#FAF8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs font-semibold text-[#997027]">
                {d.category} · {d.location.district}, {d.location.state}
              </p>
              <h3 className="font-display text-lg font-semibold text-[#133828]">
                {d.name}
              </h3>
              <p className="text-xs text-[#5A6C61]">
                {d.openingHours} · {d.entryFee.displayLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleEditClick(d)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#133828] bg-white border border-[#D5C8AD] rounded-lg cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(d._id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] rounded-lg cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminCategoriesPanelProps {
  token: string;
  categories: CategoryDocument[];
  onChanged: () => Promise<void> | void;
  onError: (msg: string) => void;
}

export function AdminCategoriesPanel({
  token,
  categories,
  onChanged,
  onError,
}: AdminCategoriesPanelProps) {
  const [name, setName] = useState('');
  const [scope, setScope] = useState<CategoryScope>('business');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      if (editingId) {
        await categoryService.update(
          editingId,
          {name: name.trim(), description: description.trim()},
          token,
        );
      } else {
        await categoryService.create(
          {name: name.trim(), scope, description: description.trim()},
          token,
        );
      }
      setEditingId(null);
      setName('');
      setDescription('');
      await onChanged();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Unable to save category.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await categoryService.remove(id, token);
      await onChanged();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Unable to delete category.');
    }
  };

  return (
    <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-[#133828]">
          Portal Categories ({categories.length})
        </h2>
        <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
          Manage destination and local business directory categories.
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="bg-[#FAF8F4] border border-[#D5C8AD] rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-medium text-[#425349] mb-1">
            Category Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Eco Lodges"
            className="w-full px-3 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#425349] mb-1">
            Scope
          </label>
          <select
            disabled={Boolean(editingId)}
            value={scope}
            onChange={(e) => setScope(e.target.value as CategoryScope)}
            className="w-full px-3 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm disabled:opacity-60"
          >
            <option value="business">Local Business</option>
            <option value="destination">Destination</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#425349] mb-1">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short category summary"
            className="w-full px-3 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
          >
            {editingId ? 'Update' : 'Add Category'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setDescription('');
              }}
              className="px-3 py-2 text-xs text-[#5A6C61] cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="border border-[#E7DEC9] rounded-xl p-4 bg-[#FAF8F4] flex items-start justify-between gap-3"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#997027]">
                {cat.scope}
              </p>
              <h3 className="font-display text-lg font-semibold text-[#133828]">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-xs text-[#5A6C61] mt-0.5">{cat.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label={`Edit ${cat.name}`}
                onClick={() => {
                  setEditingId(cat._id);
                  setName(cat.name);
                  setScope(cat.scope);
                  setDescription(cat.description);
                }}
                className="p-1.5 text-[#133828] bg-white border border-[#D5C8AD] rounded-md cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Delete ${cat.name}`}
                onClick={() => void handleDelete(cat._id)}
                className="p-1.5 text-[#7A2020] bg-white border border-[#E5B8B8] rounded-md cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AdminUsersPanelProps {
  token: string;
  currentUserId: string;
  users: UserProfile[];
  onChanged: () => Promise<void> | void;
  onError: (msg: string) => void;
}

export function AdminUsersPanel({
  token,
  currentUserId,
  users,
  onChanged,
  onError,
}: AdminUsersPanelProps) {
  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await userService.update(userId, {role}, token);
      await onChanged();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Unable to update user role.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userService.remove(userId, token);
      await onChanged();
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Unable to delete user.');
    }
  };

  return (
    <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-5">
      <div className="flex items-center gap-2.5">
        <Users className="w-5 h-5 text-[#997027]" />
        <div>
          <h2 className="font-display text-2xl font-semibold text-[#133828]">
            Registered Users ({users.length})
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6C61]">
            View community accounts, manage roles, or remove inactive accounts.
          </p>
        </div>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-[#5A6C61]">No user accounts found.</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="border border-[#E7DEC9] rounded-xl p-4 bg-[#FAF8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h3 className="font-semibold text-sm text-[#133828]">
                  {u.name}{' '}
                  {u.id === currentUserId && (
                    <span className="text-xs font-normal text-[#997027]">(You)</span>
                  )}
                </h3>
                <p className="text-xs text-[#5A6C61]">
                  {u.email} · {u.city || 'India'}
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <select
                  aria-label={`Role for ${u.name}`}
                  value={u.role}
                  disabled={u.id === currentUserId}
                  onChange={(e) =>
                    void handleRoleChange(u.id, e.target.value as UserRole)
                  }
                  className="px-3 py-1.5 bg-white border border-[#D5C8AD] rounded-lg text-xs font-medium text-[#133828] disabled:opacity-60"
                >
                  <option value="tourist">Tourist</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="admin">Administrator</option>
                </select>
                {u.id !== currentUserId && (
                  <button
                    type="button"
                    onClick={() => void handleDeleteUser(u.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
