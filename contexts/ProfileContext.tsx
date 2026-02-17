import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { UserInfoInterface } from '../interfaces/user-info.interface';
import { getUserInfo } from '../apis/user.api';

interface ProfileProviderProps {
  children: React.ReactNode;
}

const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

export const useProfile = () => useContext(ProfileContext);

export const profiles = [
  {
    name: 'Usuario',
    email: 'email@gmail.com',
    level: '1',
    imageUri: require('../assets/images/avatar-placeholder.png'),
    birthdate: '01/01/1990',
  },
];


export interface ProfileContextType {
  profile: any;
  userInfo: UserInfoInterface | null;
  setProfile: React.Dispatch<React.SetStateAction<typeof profiles[0]>>;
  getProfile: (jwt: string) => void;
  refreshUserInfo: () => Promise<void>;
}

export const ProfileProvider = ({ children }: ProfileProviderProps) => {
  const { jwt } = useAuth();
  const [profile, setProfile] = useState(profiles[0]);
  const [userInfo, setUserInfo] = useState<UserInfoInterface | null>(null);

  const getProfile = useCallback(async (token: string) => {
    const response = await getUserInfo(token);
    setUserInfo(response);
  }, []);

  const refreshUserInfo = useCallback(async () => {
    if (!jwt) return;
    const response = await getUserInfo(jwt);
    setUserInfo(response);
  }, [jwt]);

  useEffect(() => {
    if (jwt) {
      getProfile(jwt);
    }
  }, [jwt, getProfile]);

  return (
    <ProfileContext.Provider value={{ profile, userInfo, setProfile, getProfile, refreshUserInfo }}>
      {children}
    </ProfileContext.Provider>
  );
};
