import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  isSessionInvalidError,
  isTemporaryApiError,
  subscribeToSessionInvalidation,
} from '../services/api';
import {
  getMe,
  login,
  logout,
  register,
  signInWithGoogle as signInWithGoogleService,
  User,
} from '../services/authService';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
} from '../services/tokenStorage';

type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
  name: string;
  phone: string;
  email: string;
  password: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  sessionUnavailable: boolean;
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signInWithGoogle: () => Promise<User | null>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
};

const AuthContext = createContext({} as AuthContextData);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionUnavailable, setSessionUnavailable] = useState(false);

  const loadUser = useCallback(async () => {
    setLoading(true);

    try {
      const [accessToken, refreshToken] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
      ]);

      if (!accessToken && !refreshToken) {
        setUser(null);
        setSessionUnavailable(false);
        return;
      }

      const userData = await getMe();
      setUser(userData);
      setSessionUnavailable(false);
    } catch (error) {
      if (isSessionInvalidError(error)) {
        setUser(null);
        setSessionUnavailable(false);
      } else if (isTemporaryApiError(error)) {
        setSessionUnavailable(true);
      } else {
        try {
          await clearTokens();
        } catch {
          // The UI must still leave the authenticated state if secure storage fails.
        }

        setUser(null);
        setSessionUnavailable(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  async function signIn(data: SignInData) {
    const userData = await login(data);
    setUser(userData);
    setSessionUnavailable(false);
  }

  async function signUp(data: SignUpData) {
    const userData = await register(data);
    setUser(userData);
    setSessionUnavailable(false);
  }

  async function signInWithGoogle() {
    const userData = await signInWithGoogleService();

    if (userData) {
      setUser(userData);
      setSessionUnavailable(false);
    }

    return userData;
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      setUser(null);
      setSessionUnavailable(false);
    }
  }

  useEffect(() => {
    return subscribeToSessionInvalidation(() => {
      setUser(null);
      setSessionUnavailable(false);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        sessionUnavailable,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
