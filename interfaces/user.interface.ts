import { UserStatusEnum } from "./user-status.enum";

export interface UserRegister {
  name: string;
  email: string;
  birthdate: string;
  phone: string;
  password: string;
}

export interface UserInterface {
  _id: string;
  name: string;
  email: string;
  recoveryEmail: string;
  pushNotificationToken: string[];
  birthdate?: string;
  password: string;
  refreshToken: string;
  phone: string;
  status: UserStatusEnum;
  createdAt: Date;
  wallet: string;
  weight:number;
  profilePicture: string;
}

