import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getMe,
  login,
  logout,
  register,
  signInWithGoogle as signInWithGoogleService,
  User,
} from '../services/authService';
import { getAccessToken } from '../services/tokenStorage';

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

  const loadUser = useCallback(async () => {
    setLoading(true);

    try {
      const token = await getAccessToken();

      if (!token) {
        setUser(null);
        return;
      }

      const userData = await getMe();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  async function signIn(data: SignInData) {
    const userData = await login(data);
    setUser(userData);
  }

  async function signUp(data: SignUpData) {
    const userData = await register(data);
    setUser(userData);
  }

  async function signInWithGoogle() {
    const userData = await signInWithGoogleService();

    if (userData) {
      setUser(userData);
    }

    return userData;
  }

  async function signOut() {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
