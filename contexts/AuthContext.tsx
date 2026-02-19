import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { UserInterface } from "../interfaces/user.interface";
import { authenticate, logoutApi } from "../apis/auth.api";
import { getUser } from "../apis/user.api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { setLogoutCallback } from "../apis/base.api";

export interface AuthContextType {
  user: UserInterface | null;
  userTotals: UserTotals | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
  updateProfile: (jwt: string) => Promise<void>;
  refreshUserTotals: () => Promise<void>;
  isLoggedIn: boolean;
  jwt: string | null;
  appVersion: string
}

interface AuthProviderProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children, isLoggedIn, setIsLoggedIn }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInterface | null>(null);
  const [userTotals, setUserTotals] = useState<UserTotals | null>(null);
  const [jwt, setJwt] = useState<string | null>("");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const appState = useRef(AppState.currentState);
  const appVersion: string = "v1.0.25";

  useEffect(() => {
    setIsLoggedIn(loggedIn);
  }, [loggedIn]); 

  useEffect(() => {
    // Registrar callback de logout para ser chamado quando houver 401
    setLogoutCallback(() => {
      // Limpar estados locais
      setUser(null);
      setUserTotals(null);
      setJwt(null);
      setLoggedIn(false);
      setIsLoggedIn(false);
    });

    const restoreAuthState = async () => {
      const token = await getToken();
      if (token) {
        setJwt(token);
        setLoggedIn(true);
        setIsLoggedIn(true);
        try {
          const userInfo = await getUser(token);
          setUser(userInfo);
          setUserTotals(userInfo);
        } catch (error) {
          console.error("Erro ao restaurar dados do usuário:", error);
          // Se falhar ao buscar dados do usuário, fazer logout
          await AsyncStorage.removeItem('token');
          setJwt(null);
          setLoggedIn(false);
          setIsLoggedIn(false);
          setUser(null);
          setUserTotals(null);
        }
      } else {
        setJwt(null);
        setLoggedIn(false);
        setIsLoggedIn(false);
        setUser(null);
        setUserTotals(null);
      }
    };

    restoreAuthState();
  }, []);


  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // Quando o app volta do background
        const restoreAuthState = async () => {
          const token = await getToken();
          if (token) {
            setJwt(token);
            setLoggedIn(true);
            try {
              const userInfo = await getUser(token);
              setUser(userInfo);
              setUserTotals(userInfo);
            } catch (error) {
              console.error("Erro ao restaurar dados do usuário ao voltar do background:", error);
              // Se falhar ao buscar dados do usuário, fazer logout
              await AsyncStorage.removeItem('token');
              setJwt(null);
              setLoggedIn(false);
              setIsLoggedIn(false);
              setUser(null);
              setUserTotals(null);
            }
          } else {
            setJwt(null);
            setLoggedIn(false);
            setUser(null);
            setUserTotals(null);
          }
        };
        restoreAuthState();
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const getToken = async () => {
    const tokenData = await AsyncStorage.getItem('token');
    if (tokenData) {
      const { token, expiration } = JSON.parse(tokenData);
      if (new Date().getTime() < expiration) {
        return token;
      } else {
        await AsyncStorage.removeItem('token');
        return null;
      }
    }
    return null;
  };

  const saveToken = async (token: string) => {
    const expirationTime = 24 * 60 * 60 * 1000;
    const tokenData = {
      token: token,
      expiration: new Date().getTime() + expirationTime,
    };
    await AsyncStorage.setItem('token', JSON.stringify(tokenData));
  };

  const login = async ( email: string, password: string ) => {
    try {
      const response = await authenticate(email, password);
      
      if (response.success) {
        // Salvar token ANTES de buscar dados do usuário
        await saveToken(response.data.token);
        setJwt(response.data.token);
        
        const userInfo = await getUser(response.data.token);
        
        setUser(userInfo);
        setUserTotals(userInfo);
        setLoggedIn(true);
        setIsLoggedIn(true);
        return null;
      } else {
        return response.message
      }
    } catch (error: any) {
      console.error("Erro capturado no AuthContext.login:", error);
      return error?.message || "Erro ao fazer login. Verifique sua conexão.";
    }
  };

  const logout = async () => {
    try {
      if (jwt) {
        await logoutApi(jwt);
      }
    } catch (error) {
      console.error("Erro ao fazer logout na API:", error);
    } finally {
      // Sempre limpar os dados locais, independente do erro da API
      setUser(null);
      setUserTotals(null);
      await AsyncStorage.removeItem('token');
      setJwt(null);
      setLoggedIn(false);
      setIsLoggedIn(false);
    }
  };

  const updateProfile = async (jwt:string) => {
    
    const userInfo = await getUser(jwt);
    setUser(userInfo);
    setUserTotals(userInfo);
  };

  const refreshUserTotals = async () => {
    if (!jwt) return;
    const userInfo = await getUser(jwt);
    setUser(userInfo);
    setUserTotals(userInfo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userTotals,
        login,
        logout,
        updateProfile,
        refreshUserTotals,
        isLoggedIn,
        jwt,
        appVersion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export interface UserTotals {
  name?: string;
  profilePicture?: string;
  total_distance?: number;
  total_calories?: number;
  total_duration?: number;
  total_runs?: number;
}
