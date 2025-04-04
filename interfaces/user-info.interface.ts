import { UserInterface } from "./user.interface";


export interface UserInfoInterface {
  user: UserInterface;
  level: number;
  experience: number;
  weight?: number;
  height?: number;
  timeRunning: number;
  kilometers: number;
  calories: number;
  runs: number;
}