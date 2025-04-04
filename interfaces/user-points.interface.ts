import { MissionsInterface } from "./missions.interface";

export interface UserPointsInterface {
  value?: number;
  progress?: number;
  mission?: MissionsInterface;
  acvievement?: string;
}
