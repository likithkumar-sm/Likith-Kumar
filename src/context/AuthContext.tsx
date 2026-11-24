import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {UserProfile} from '../types/business';

interface BootstrapStatus {
  adminClaimed: boolean;
  passcodeRequired: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  token: string | null;
  bootstrapStatus: BootstrapStatus;
  refreshBootstrapStatus: () => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    role: 'tourist' | 'business_owner';
    city?: string;
    phone?: string;
  }) => Promise<UserProfile>;
  claimAdmin: (input: {
    name: string;
    email: string;
    password: string;
    passcode?: string;
  }) => Promise<UserProfile>;
  login: (input: {email: string; password: string}) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (input: {
    name: string;
    city: string;
    phone: string;
  }) => Promise<UserProfile>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({children}: {children: ReactNode}) {
  // Token kept strictly in React memory (never persisted in localStorage/sessionStorage)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus>({
    adminClaimed: false,
    passcodeRequired: false,
  });

  const refreshBootstrapStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/bootstrap-status');
      if (res.ok) {
        const data = (await res.json()) as BootstrapStatus;
        setBootstrapStatus(data);
      }
    } catch {
      // Ignore transient bootstrap check errors
    }
  }, []);

  useEffect(() => {
    void refreshBootstrapStatus();
  }, [refreshBootstrapStatus]);

  const register: AuthContextValue['register'] = async (input) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as {
      user?: UserProfile;
      token?: string;
      error?: string;
    };
    if (!res.ok || !data.user || !data.token) {
      throw new Error(data.error || 'Registration failed.');
    }
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const claimAdmin: AuthContextValue['claimAdmin'] = async (input) => {
    const res = await fetch('/api/auth/claim-admin', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as {
      user?: UserProfile;
      token?: string;
      error?: string;
    };
    if (!res.ok || !data.user || !data.token) {
      throw new Error(data.error || 'Administrator setup failed.');
    }
    setUser(data.user);
    setToken(data.token);
    await refreshBootstrapStatus();
    return data.user;
  };

  const login: AuthContextValue['login'] = async (input) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as {
      user?: UserProfile;
      token?: string;
      error?: string;
    };
    if (!res.ok || !data.user || !data.token) {
      throw new Error(data.error || 'Invalid credentials.');
    }
    setUser(data.user);
    setToken(data.token);
    return data.user;
  };

  const logout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
      }).catch(() => undefined);
    }
    setUser(null);
    setToken(null);
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (input) => {
    if (!token) throw new Error('Please sign in first.');
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });
    const data = (await res.json()) as {user?: UserProfile; error?: string};
    if (!res.ok || !data.user) {
      throw new Error(data.error || 'Could not update profile.');
    }
    setUser(data.user);
    return data.user;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('Please sign in first.');
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({currentPassword, newPassword}),
    });
    const data = (await res.json()) as {error?: string};
    if (!res.ok) {
      throw new Error(data.error || 'Unable to change password.');
    }
  };

  const requestPasswordReset = async (email: string) => {
    const res = await fetch('/api/auth/request-reset', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    });
    const data = (await res.json()) as {message?: string; error?: string};
    if (!res.ok || !data.message) {
      throw new Error(data.error || 'Unable to submit reset request.');
    }
    return data.message;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        bootstrapStatus,
        refreshBootstrapStatus,
        register,
        claimAdmin,
        login,
        logout,
        updateProfile,
        changePassword,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
