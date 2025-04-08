import React, { createContext, useState, useContext, useEffect } from "react";
import { UserInterface } from "../interfaces/user.interface";
import { authenticate, logoutApi } from "../apis/auth.api";
import { getUser } from "../apis/user.api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AuthContextType {
  user: UserInterface | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (jwt: string) => Promise<void>;
  isLoggedIn: boolean;
  jwt: string | null;
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
  const [jwt, setJwt] = useState<string | null>("");
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);

  useEffect(() => {
    setIsLoggedIn(loggedIn);
  }, [loggedIn]);

  useEffect(() =>{
    (async () => {
      const token = await getToken()
      if (token) {
        setJwt(token);
        setLoggedIn(true);
      }else{
        setLoggedIn(false);
      }
    })();
  },[])

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

  const login = async (credentials: { email: string; password: string }) => {
    const { email, password } = credentials;

    const response = await authenticate(email, password);
    
    if (response.success) {
      const userInfo = await getUser(response.data.token);
      saveToken(response.data.token)
      console.log(userInfo);
      
      setUser(userInfo);
      setJwt(response.data.token);  
      setLoggedIn(true);
      setIsLoggedIn(true);
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const logout = async () => {
    console.log("aaa");

    if(!jwt) return
    console.log("a");
    
    const responseLogout = await logoutApi(jwt);
    
    if(responseLogout.success){
      console.log("logout");
      setUser(null);
      await AsyncStorage.removeItem('token');
      setJwt(null);
      setLoggedIn(false);
      setIsLoggedIn(false);
    }
  };

  const updateProfile = async (jwt:string) => {
    
    const userInfo = await getUser(jwt);
    setUser(userInfo);
  };

  return <AuthContext.Provider value={{ user, login, logout, updateProfile, isLoggedIn, jwt }}>{children}</AuthContext.Provider>;
};
