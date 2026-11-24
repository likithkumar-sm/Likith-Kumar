import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Edit3,
  LogOut,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import {useCallback, useEffect, useState, type FormEvent} from 'react';
import {
  AdminCategoriesPanel,
  AdminDestinationsPanel,
  AdminUsersPanel,
} from '../components/AdminCollectionsPanel';
import {BusinessRegistrationForm} from '../components/BusinessRegistrationForm';
import {useAuth} from '../context/AuthContext';
import {bookingService} from '../services/bookingService';
import {
  businessService,
  type CreateBusinessPayload,
} from '../services/businessService';
import {userService} from '../services/userService';
import type {BusinessDocument, UserProfile} from '../types/business';
import type {DestinationDocument} from '../types/destination';
import type {BookingDocument, CategoryDocument} from '../types/portal';

type DashboardTab =
  | 'workspace'
  | 'bookings'
  | 'destinations'
  | 'categories'
  | 'users'
  | 'register_business'
  | 'profile';

interface DashboardPageProps {
  initialTab?: 'workspace' | 'register_business' | 'profile';
  savedDestinations: DestinationDocument[];
  allDestinations: DestinationDocument[];
  categories: CategoryDocument[];
  onBackHome: () => void;
  onRequireLogin: () => void;
  onViewBusinessDetails: (biz: BusinessDocument) => void;
  onViewDestinationDetails: (dest: DestinationDocument) => void;
  onPublicDirectoryChanged: () => void;
}

export function DashboardPage({
  initialTab = 'workspace',
  savedDestinations,
  allDestinations,
  categories,
  onBackHome,
  onRequireLogin,
  onViewBusinessDetails,
  onViewDestinationDetails,
  onPublicDirectoryChanged,
}: DashboardPageProps) {
  const {user, token, logout, updateProfile, changePassword} = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // Business Owner & Admin data
  const [ownerBusinesses, setOwnerBusinesses] = useState<BusinessDocument[]>([]);
  const [adminQueue, setAdminQueue] = useState<BusinessDocument[]>([]);
  const [adminFilter, setAdminFilter] = useState<
    'all' | 'pending' | 'approved' | 'rejected'
  >('all');
  const [editingBusiness, setEditingBusiness] = useState<BusinessDocument | null>(
    null,
  );
  const [moderationNotes, setModerationNotes] = useState<Record<string, string>>(
    {},
  );
  const [bookings, setBookings] = useState<BookingDocument[]>([]);
  const [portalUsers, setPortalUsers] = useState<UserProfile[]>([]);

  const [loadingListings, setLoadingListings] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Profile state
  const [profileName, setProfileName] = useState(user?.name ?? '');
  const [profileCity, setProfileCity] = useState(user?.city ?? '');
  const [profilePhone, setProfilePhone] = useState(user?.phone ?? '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Change password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileCity(user.city);
      setProfilePhone(user.phone);
    }
  }, [user]);

  const loadRoleData = useCallback(async () => {
    if (!user || !token) return;
    setLoadingListings(true);
    setActionError(null);
    try {
      const bookingList = await bookingService.list(token);
      setBookings(bookingList);

      if (user.role === 'business_owner') {
        const list = await businessService.listMine(token);
        setOwnerBusinesses(list);
      } else if (user.role === 'admin') {
        const [queue, usersList] = await Promise.all([
          businessService.listAllForAdmin(token),
          userService.listAll(token),
        ]);
        setAdminQueue(queue);
        setPortalUsers(usersList);
      }
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to load dashboard records.',
      );
    } finally {
      setLoadingListings(false);
    }
  }, [user, token]);

  useEffect(() => {
    void loadRoleData();
  }, [loadRoleData]);

  // Protected Route Gate
  if (!user || !token) {
    return (
      <section className="max-w-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="bg-white border border-[#E7DEC9] rounded-xl p-8 shadow-sm space-y-4">
          <ShieldAlert className="w-10 h-10 text-[#997027] mx-auto" />
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#133828]">
            Protected Portal Route
          </h1>
          <p className="text-sm text-[#495A50] leading-relaxed">
            Please sign in or register an account to access your role-based dashboard,
            manage business listings, or track bookings.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRequireLogin}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
            >
              Sign In or Register
            </button>
            <button
              type="button"
              onClick={onBackHome}
              className="px-4 py-2.5 text-sm font-medium text-[#133828] bg-[#F3EDE2] hover:bg-[#E7DEC9] rounded-lg cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const handleCreateOrUpdateBusiness = async (payload: CreateBusinessPayload) => {
    if (editingBusiness) {
      await businessService.update(editingBusiness._id, payload, token);
      setEditingBusiness(null);
    } else {
      await businessService.create(payload, token);
    }
    await loadRoleData();
    onPublicDirectoryChanged();
    setActiveTab('workspace');
  };

  const handleDeleteBusiness = async (id: string) => {
    setActionError(null);
    try {
      await businessService.remove(id, token);
      await loadRoleData();
      onPublicDirectoryChanged();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to delete business.',
      );
    }
  };

  const handleModerate = async (
    id: string,
    status: 'approved' | 'rejected',
  ) => {
    setActionError(null);
    try {
      const note = moderationNotes[id] ?? '';
      await businessService.moderateStatus(id, status, note, token);
      await loadRoleData();
      onPublicDirectoryChanged();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to update status.',
      );
    }
  };

  const handleBookingStatus = async (
    id: string,
    status: 'confirmed' | 'cancelled',
  ) => {
    setActionError(null);
    try {
      await bookingService.update(id, {status}, token);
      await loadRoleData();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to update booking status.',
      );
    }
  };

  const handleDeleteBooking = async (id: string) => {
    setActionError(null);
    try {
      await bookingService.remove(id, token);
      await loadRoleData();
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : 'Unable to delete booking.',
      );
    }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);
    await updateProfile({
      name: profileName,
      city: profileCity,
      phone: profilePhone,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwMessage(null);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setPwMessage('Password updated securely.');
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : 'Password update failed.');
    }
  };

  const roleLabel =
    user.role === 'admin'
      ? 'Administrator'
      : user.role === 'business_owner'
        ? 'Business Owner'
        : 'Tourist';

  const filteredAdminQueue =
    adminFilter === 'all'
      ? adminQueue
      : adminQueue.filter((b) => b.status === adminFilter);

  const pendingCount = adminQueue.filter((b) => b.status === 'pending').length;

  return (
    <section className="bg-[#FAF8F4] min-h-[75vh] py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#E7DEC9] mb-8">
          <div>
            <button
              type="button"
              onClick={onBackHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#997027] hover:text-[#133828] mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Portal</span>
            </button>
            <h1 className="font-display text-3xl font-semibold text-[#133828]">
              {roleLabel} Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
              Signed in as <strong className="text-[#133828]">{user.name}</strong> ({user.email})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingBusiness(null);
                setActiveTab('workspace');
              }}
              className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'workspace'
                  ? 'bg-[#133828] text-white'
                  : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
              }`}
            >
              {user.role === 'admin'
                ? `Businesses (${pendingCount} Pending)`
                : user.role === 'business_owner'
                  ? 'My Listings'
                  : 'My Trips'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('bookings')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-[#133828] text-white'
                  : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span className="tabular-nums">Bookings ({bookings.length})</span>
            </button>

            {(user.role === 'business_owner' || user.role === 'admin') && (
              <button
                type="button"
                onClick={() => {
                  setEditingBusiness(null);
                  setActiveTab('register_business');
                }}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'register_business'
                    ? 'bg-[#133828] text-white'
                    : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Business</span>
              </button>
            )}

            {user.role === 'admin' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('destinations')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'destinations'
                      ? 'bg-[#133828] text-white'
                      : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
                  }`}
                >
                  Destinations
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'categories'
                      ? 'bg-[#133828] text-white'
                      : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
                  }`}
                >
                  Categories
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('users')}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-[#133828] text-white'
                      : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
                  }`}
                >
                  Users
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-[#133828] text-white'
                  : 'bg-[#F3EDE2] text-[#133828] hover:bg-[#E7DEC9]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => {
                void logout().then(onBackHome);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {actionError && (
          <div
            role="alert"
            className="mb-6 bg-[#FDF2F2] border border-[#E5B8B8] text-[#7A2020] rounded-lg p-3.5 text-sm"
          >
            {actionError}
          </div>
        )}

        {/* TAB 1: ROLE WORKSPACE */}
        {activeTab === 'workspace' && (
          <>
            {user.role === 'tourist' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E7DEC9] rounded-xl p-6">
                  <h2 className="font-display text-2xl font-semibold text-[#133828] mb-2">
                    Your Saved Travel Shortlist ({savedDestinations.length})
                  </h2>
                  <p className="text-sm text-[#5A6C61] mb-6">
                    Bookmark destinations across India to organize your upcoming journey.
                  </p>

                  {savedDestinations.length === 0 ? (
                    <p className="text-sm text-[#495A50]">
                      You have no saved destinations yet. Explore the directory to save spots.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {savedDestinations.map((d) => (
                        <div
                          key={d._id}
                          className="border border-[#E7DEC9] rounded-lg p-4 bg-[#FAF8F4] flex flex-col justify-between"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#997027]">
                              {d.category} · {d.location.state}
                            </p>
                            <h3 className="font-display text-lg font-semibold text-[#133828] mt-1">
                              {d.name}
                            </h3>
                            <p className="text-xs text-[#5A6C61] mt-1">
                              {d.openingHours}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onViewDestinationDetails(d)}
                            className="mt-4 text-left text-xs font-semibold text-[#133828] hover:text-[#997027] underline underline-offset-4 cursor-pointer"
                          >
                            Open Destination Details
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {user.role === 'business_owner' && (
              <div className="space-y-6">
                {editingBusiness ? (
                  <BusinessRegistrationForm
                    initialBusiness={editingBusiness}
                    onSubmit={handleCreateOrUpdateBusiness}
                    onCancel={() => setEditingBusiness(null)}
                  />
                ) : (
                  <div className="bg-white border border-[#E7DEC9] rounded-xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="font-display text-2xl font-semibold text-[#133828]">
                          Your Submitted Business Listings ({ownerBusinesses.length})
                        </h2>
                        <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
                          Manage details, monitor Administrator approval status, or add a new listing.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('register_business')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Business</span>
                      </button>
                    </div>

                    {loadingListings ? (
                      <p className="text-sm text-[#5A6C61]">Loading your listings...</p>
                    ) : ownerBusinesses.length === 0 ? (
                      <div className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-lg p-8 text-center">
                        <p className="font-display text-lg font-semibold text-[#133828] mb-2">
                          No businesses registered yet
                        </p>
                        <p className="text-sm text-[#495A50] mb-5">
                          Register your hotel, restaurant, homestay, travel agency, taxi service,
                          handicraft shop, or tour guide profile for community travelers.
                        </p>
                        <button
                          type="button"
                          onClick={() => setActiveTab('register_business')}
                          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
                        >
                          Submit First Business
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ownerBusinesses.map((biz) => (
                          <div
                            key={biz._id}
                            className="border border-[#E7DEC9] rounded-xl p-5 bg-[#FAF8F4] flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-[#997027]">
                                  {biz.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#5A6C61]">
                                  {biz.location.city}, {biz.location.state}
                                </span>
                                <span aria-hidden="true">·</span>
                                {biz.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#133828]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#256146]" />
                                    Approved
                                  </span>
                                )}
                                {biz.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#997027]">
                                    <Clock className="w-3.5 h-3.5" />
                                    Pending Review
                                  </span>
                                )}
                                {biz.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#8C2626]">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Rejected
                                  </span>
                                )}
                              </div>
                              <h3 className="font-display text-xl font-semibold text-[#133828]">
                                {biz.name}
                              </h3>
                              <p className="text-xs text-[#425349]">
                                {biz.contact.phone} · {biz.operatingHours}
                              </p>
                              {biz.moderationNote && (
                                <p className="text-xs text-[#5A6C61] pt-1">
                                  Reviewer note: {biz.moderationNote}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => onViewBusinessDetails(biz)}
                                className="px-3.5 py-2 text-xs font-medium text-[#133828] bg-white border border-[#D5C8AD] hover:bg-[#F3EDE2] rounded-lg cursor-pointer"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBusiness(biz)}
                                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-[#133828] bg-white border border-[#D5C8AD] hover:bg-[#F3EDE2] rounded-lg cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteBusiness(biz._id)}
                                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {user.role === 'admin' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#E7DEC9] rounded-xl p-5">
                    <div className="font-display text-3xl font-semibold text-[#133828] tabular-nums">
                      {adminQueue.length}
                    </div>
                    <div className="text-xs text-[#5A6C61] mt-1">Total Directory Submissions</div>
                  </div>
                  <div className="bg-white border border-[#E7DEC9] rounded-xl p-5">
                    <div className="font-display text-3xl font-semibold text-[#997027] tabular-nums">
                      {adminQueue.filter((b) => b.status === 'pending').length}
                    </div>
                    <div className="text-xs text-[#5A6C61] mt-1">Pending Approval</div>
                  </div>
                  <div className="bg-white border border-[#E7DEC9] rounded-xl p-5">
                    <div className="font-display text-3xl font-semibold text-[#256146] tabular-nums">
                      {adminQueue.filter((b) => b.status === 'approved').length}
                    </div>
                    <div className="text-xs text-[#5A6C61] mt-1">Approved &amp; Live</div>
                  </div>
                  <div className="bg-white border border-[#E7DEC9] rounded-xl p-5">
                    <div className="font-display text-3xl font-semibold text-[#8C2626] tabular-nums">
                      {adminQueue.filter((b) => b.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-[#5A6C61] mt-1">Rejected Submissions</div>
                  </div>
                </div>

                <div className="bg-white border border-[#E7DEC9] rounded-xl p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="font-display text-2xl font-semibold text-[#133828]">
                        Business Approval &amp; Moderation Queue
                      </h2>
                      <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
                        Approve verified local businesses for public listing or reject incomplete submissions.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 bg-[#F3EDE2] p-1 rounded-lg border border-[#E7DEC9]">
                      {(['all', 'pending', 'approved', 'rejected'] as const).map(
                        (statusTab) => (
                          <button
                            key={statusTab}
                            type="button"
                            onClick={() => setAdminFilter(statusTab)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize cursor-pointer ${
                              adminFilter === statusTab
                                ? 'bg-[#133828] text-white'
                                : 'text-[#425349] hover:text-[#133828]'
                            }`}
                          >
                            {statusTab}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {loadingListings ? (
                    <p className="text-sm text-[#5A6C61]">Loading moderation queue...</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredAdminQueue.map((biz) => (
                        <div
                          key={biz._id}
                          className="border border-[#E7DEC9] rounded-xl p-5 bg-[#FAF8F4] space-y-4"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="font-semibold text-[#997027]">
                                  {biz.category}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#5A6C61]">
                                  {biz.location.city}, {biz.location.state}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#5A6C61]">
                                  Owner: {biz.ownerName}
                                </span>
                                <span aria-hidden="true">·</span>
                                {biz.status === 'approved' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#256146]">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Approved
                                  </span>
                                )}
                                {biz.status === 'pending' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#997027]">
                                    <Clock className="w-3.5 h-3.5" />
                                    Pending Review
                                  </span>
                                )}
                                {biz.status === 'rejected' && (
                                  <span className="inline-flex items-center gap-1 font-semibold text-[#8C2626]">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Rejected
                                  </span>
                                )}
                              </div>
                              <h3 className="font-display text-xl font-semibold text-[#133828]">
                                {biz.name}
                              </h3>
                              <p className="text-sm text-[#425349]">
                                {biz.shortDescription}
                              </p>
                              <p className="text-xs text-[#5A6C61]">
                                {biz.location.address} · {biz.contact.phone} ·{' '}
                                {biz.contact.email}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => onViewBusinessDetails(biz)}
                                className="px-3.5 py-2 text-xs font-medium text-[#133828] bg-white border border-[#D5C8AD] hover:bg-[#F3EDE2] rounded-lg cursor-pointer"
                              >
                                Inspect
                              </button>
                              {biz.status !== 'approved' && (
                                <button
                                  type="button"
                                  onClick={() => void handleModerate(biz._id, 'approved')}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                              )}
                              {biz.status !== 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => void handleModerate(biz._id, 'rejected')}
                                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Reject</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => void handleDeleteBusiness(biz._id)}
                                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#E7DEC9]">
                            <input
                              type="text"
                              value={moderationNotes[biz._id] ?? biz.moderationNote ?? ''}
                              onChange={(e) =>
                                setModerationNotes((prev) => ({
                                  ...prev,
                                  [biz._id]: e.target.value,
                                }))
                              }
                              placeholder="Optional reviewer note for the business owner..."
                              className="w-full px-3 py-2 bg-white border border-[#D5C8AD] rounded-lg text-xs text-[#17261E] focus:outline-none focus:border-[#133828]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: BOOKINGS CRUD (ALL ROLES) */}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#133828]">
                {user.role === 'admin'
                  ? `All Portal Bookings & Inquiries (${bookings.length})`
                  : user.role === 'business_owner'
                    ? `Business Booking Inquiries (${bookings.length})`
                    : `Your Trip Inquiries & Bookings (${bookings.length})`}
              </h2>
              <p className="text-xs sm:text-sm text-[#5A6C61] mt-1">
                Track reservation status, confirm local inquiries, or cancel scheduled visits.
              </p>
            </div>

            {bookings.length === 0 ? (
              <p className="text-sm text-[#5A6C61]">
                No booking inquiries recorded yet. Use “Inquire” on any business, hotel, homestay, or restaurant to submit one.
              </p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b._id}
                    className="border border-[#E7DEC9] rounded-xl p-5 bg-[#FAF8F4] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[#5A6C61]">{b._id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize font-semibold text-[#997027]">
                          {b.targetType.replace('_', ' ')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold capitalize ${
                            b.status === 'confirmed'
                              ? 'text-[#256146]'
                              : b.status === 'cancelled'
                                ? 'text-[#8C2626]'
                                : 'text-[#997027]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-[#133828]">
                        {b.targetName}
                      </h3>
                      <p className="text-xs text-[#425349] tabular-nums">
                        Guest: <strong>{b.guestName}</strong> ({b.guestEmail}) · Date:{' '}
                        <strong>{b.visitDate}</strong> · Party: <strong>{b.guestsCount}</strong>
                      </p>
                      {b.notes && (
                        <p className="text-xs text-[#5A6C61] pt-1">Note: {b.notes}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {(user.role === 'admin' || user.role === 'business_owner') &&
                        b.status !== 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => void handleBookingStatus(b._id, 'confirmed')}
                            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm</span>
                          </button>
                        )}
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => void handleBookingStatus(b._id, 'cancelled')}
                          className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancel</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteBooking(b._id)}
                        className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#7A2020] bg-white border border-[#E5B8B8] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMIN DESTINATIONS CRUD */}
        {activeTab === 'destinations' && user.role === 'admin' && (
          <AdminDestinationsPanel
            token={token}
            destinations={allDestinations}
            onChanged={async () => {
              onPublicDirectoryChanged();
            }}
            onError={(msg) => setActionError(msg)}
          />
        )}

        {/* TAB 4: ADMIN CATEGORIES CRUD */}
        {activeTab === 'categories' && user.role === 'admin' && (
          <AdminCategoriesPanel
            token={token}
            categories={categories}
            onChanged={async () => {
              onPublicDirectoryChanged();
            }}
            onError={(msg) => setActionError(msg)}
          />
        )}

        {/* TAB 5: ADMIN USERS CRUD */}
        {activeTab === 'users' && user.role === 'admin' && (
          <AdminUsersPanel
            token={token}
            currentUserId={user.id}
            users={portalUsers}
            onChanged={loadRoleData}
            onError={(msg) => setActionError(msg)}
          />
        )}

        {/* TAB 6: REGISTER BUSINESS FORM */}
        {activeTab === 'register_business' && (
          <div className="max-w-3xl">
            {user.role === 'tourist' ? (
              <div className="bg-white border border-[#E7DEC9] rounded-xl p-8 text-center space-y-3">
                <h2 className="font-display text-2xl font-semibold text-[#133828]">
                  Business Owner Account Required
                </h2>
                <p className="text-sm text-[#495A50]">
                  Your current account is registered as a Tourist. Please register a
                  Business Owner account to submit and manage business listings.
                </p>
              </div>
            ) : (
              <BusinessRegistrationForm
                onSubmit={handleCreateOrUpdateBusiness}
                onCancel={() => setActiveTab('workspace')}
              />
            )}
          </div>
        )}

        {/* TAB 7: USER PROFILE & PASSWORD */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form
              onSubmit={(e) => void handleSaveProfile(e)}
              className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-[#133828]">
                User Profile
              </h2>
              <div>
                <label className="block text-xs font-medium text-[#425349] mb-1">
                  Account Role
                </label>
                <input
                  type="text"
                  disabled
                  value={roleLabel}
                  className="w-full px-3.5 py-2.5 bg-[#F3EDE2] border border-[#E7DEC9] rounded-lg text-sm text-[#5A6C61]"
                />
              </div>
              <div>
                <label
                  htmlFor="prof-name"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="prof-city"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  City / State
                </label>
                <input
                  id="prof-city"
                  type="text"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="prof-phone"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="prof-phone"
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              {profileSaved && (
                <p className="text-xs font-medium text-[#256146]">
                  Profile details saved.
                </p>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
              >
                Update Profile
              </button>
            </form>

            <form
              onSubmit={(e) => void handleChangePassword(e)}
              className="bg-white border border-[#E7DEC9] rounded-xl p-6 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-[#133828]">
                Update Password
              </h2>
              <div>
                <label
                  htmlFor="pw-curr"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Current Password
                </label>
                <input
                  id="pw-curr"
                  type="password"
                  required
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              <div>
                <label
                  htmlFor="pw-new"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  New Password (min 6 characters)
                </label>
                <input
                  id="pw-new"
                  type="password"
                  required
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
              {pwError && (
                <p role="alert" className="text-xs font-medium text-[#8C2626]">
                  {pwError}
                </p>
              )}
              {pwMessage && (
                <p className="text-xs font-medium text-[#256146]">{pwMessage}</p>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] rounded-lg cursor-pointer"
              >
                Change Password
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
