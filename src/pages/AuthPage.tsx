import {ArrowLeft, CheckCircle2, KeyRound, ShieldCheck, UserPlus} from 'lucide-react';
import {useState, type FormEvent} from 'react';
import {useAuth} from '../context/AuthContext';

type AuthMode = 'login' | 'register' | 'reset' | 'admin_setup';

interface AuthPageProps {
  initialMode?: AuthMode;
  onSuccess: () => void;
  onBackHome: () => void;
}

export function AuthPage({
  initialMode = 'login',
  onSuccess,
  onBackHome,
}: AuthPageProps) {
  const {bootstrapStatus, login, register, claimAdmin, requestPasswordReset} =
    useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'tourist' | 'business_owner'>('tourist');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showAdminClaimTab =
    !bootstrapStatus.adminClaimed || bootstrapStatus.passcodeRequired;

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login({email, password});
        onSuccess();
      } else if (mode === 'register') {
        await register({name, email, password, role, city, phone});
        onSuccess();
      } else if (mode === 'admin_setup') {
        await claimAdmin({
          name,
          email,
          password,
          passcode: bootstrapStatus.passcodeRequired ? passcode : undefined,
        });
        onSuccess();
      } else if (mode === 'reset') {
        const msg = await requestPasswordReset(email);
        setNotice(msg);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-[#FAF8F4] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg mx-auto">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#133828] hover:text-[#997027] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal</span>
        </button>

        <div className="bg-white border border-[#E7DEC9] rounded-xl p-6 sm:p-8 shadow-[0_8px_24px_-12px_rgba(19,56,40,0.08)]">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#997027] mb-1">
              Swadesh Trails Account
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#133828]">
              {mode === 'login' && 'Sign In to Your Portal'}
              {mode === 'register' && 'Create a Community Account'}
              {mode === 'reset' && 'Reset Password'}
              {mode === 'admin_setup' && 'Administrator Setup'}
            </h1>
          </div>

          {/* Segmented Mode Selector */}
          <div className="flex flex-wrap gap-1.5 bg-[#F3EDE2] p-1 rounded-lg border border-[#E7DEC9] mb-6">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'login'
                  ? 'bg-[#133828] text-white'
                  : 'text-[#425349] hover:text-[#133828]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                mode === 'register'
                  ? 'bg-[#133828] text-white'
                  : 'text-[#425349] hover:text-[#133828]'
              }`}
            >
              Register
            </button>
            {showAdminClaimTab && (
              <button
                type="button"
                onClick={() => switchMode('admin_setup')}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'admin_setup'
                    ? 'bg-[#133828] text-white'
                    : 'text-[#425349] hover:text-[#133828]'
                }`}
              >
                Admin Setup
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {(mode === 'register' || mode === 'admin_setup') && (
              <div>
                <label
                  htmlFor="auth-name"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-[#425349] mb-1"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs font-medium text-[#425349] mb-1"
                >
                  Password {mode === 'admin_setup' ? '(min 8 characters)' : '(min 6 characters)'}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                />
              </div>
            )}

            {mode === 'register' && (
              <>
                <div>
                  <span className="block text-xs font-medium text-[#425349] mb-1.5">
                    Select Account Role
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('tourist')}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        role === 'tourist'
                          ? 'bg-[#133828] text-white border-[#133828]'
                          : 'bg-[#FAF8F4] text-[#17261E] border-[#D5C8AD] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <span className="block text-sm font-semibold">Tourist</span>
                      <span
                        className={`block text-xs mt-0.5 ${
                          role === 'tourist' ? 'text-[#E7DEC9]' : 'text-[#5A6C61]'
                        }`}
                      >
                        Save trips &amp; reviews
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('business_owner')}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        role === 'business_owner'
                          ? 'bg-[#133828] text-white border-[#133828]'
                          : 'bg-[#FAF8F4] text-[#17261E] border-[#D5C8AD] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      <span className="block text-sm font-semibold">Business Owner</span>
                      <span
                        className={`block text-xs mt-0.5 ${
                          role === 'business_owner' ? 'text-[#E7DEC9]' : 'text-[#5A6C61]'
                        }`}
                      >
                        Submit &amp; manage listings
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="auth-city"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      City / State
                    </label>
                    <input
                      id="auth-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Bengaluru"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="auth-phone"
                      className="block text-xs font-medium text-[#425349] mb-1"
                    >
                      Phone (Optional)
                    </label>
                    <input
                      id="auth-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#D5C8AD] rounded-lg text-sm text-[#17261E] focus:outline-none focus:border-[#133828]"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'admin_setup' && (
              <div className="bg-[#F3EDE2] border border-[#E7DEC9] rounded-lg p-3.5 text-xs text-[#425349] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#133828]">
                  <ShieldCheck className="w-4 h-4 text-[#256146]" />
                  <span>First-Run Administrator Account Setup</span>
                </div>
                <p>
                  {bootstrapStatus.passcodeRequired
                    ? 'Enter the configured ADMIN_PASSCODE to register an Administrator.'
                    : 'Claim the Administrator account to review and approve or reject submitted business listings.'}
                </p>
                {bootstrapStatus.passcodeRequired && (
                  <input
                    type="password"
                    required
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Administrator passcode"
                    className="w-full px-3 py-2 bg-white border border-[#D5C8AD] rounded-lg text-sm text-[#17261E]"
                  />
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs font-medium text-[#8C2626]">
                {error}
              </p>
            )}

            {notice && (
              <div className="flex items-start gap-2 text-xs font-medium text-[#133828] bg-[#F3EDE2] p-3 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-[#256146] shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#133828] hover:bg-[#1B4A35] disabled:bg-[#8DA095] rounded-lg transition-colors cursor-pointer"
            >
              {mode === 'login' && <KeyRound className="w-4 h-4" />}
              {mode === 'register' && <UserPlus className="w-4 h-4" />}
              {mode === 'admin_setup' && <ShieldCheck className="w-4 h-4" />}
              <span>
                {isLoading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : mode === 'register'
                      ? 'Create Account'
                      : mode === 'admin_setup'
                        ? 'Claim Administrator Role'
                        : 'Send Password Reset Request'}
              </span>
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#F3EDE2] flex items-center justify-between text-xs text-[#5A6C61]">
            {mode === 'login' ? (
              <button
                type="button"
                onClick={() => switchMode('reset')}
                className="text-[#997027] hover:text-[#133828] font-medium underline underline-offset-4 cursor-pointer"
              >
                Forgot password?
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-[#997027] hover:text-[#133828] font-medium underline underline-offset-4 cursor-pointer"
              >
                Back to Sign In
              </button>
            )}

            <span>Role-based Protected Portal</span>
          </div>
        </div>
      </div>
    </section>
  );
}
