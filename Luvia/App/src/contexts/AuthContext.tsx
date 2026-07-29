import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  getMe,
  login,
  logout,
  register,
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

  async function loadUser() {
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
  }

  async function signIn(data: SignInData) {
    const userData = await login(data);
    setUser(userData);
  }

  async function signUp(data: SignUpData) {
    const userData = await register(data);
    setUser(userData);
  }

  async function signOut() {
    await logout();
    setUser(null);
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
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