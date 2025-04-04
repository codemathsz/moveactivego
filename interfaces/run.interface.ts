import { MyProducts } from "./products.interface";

export interface RunInterface {
  name: string;
  local: {
    latitude: number;
    longitude: number;
  };
  localEnd: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  date: string;
  route: {
    latitude: number;
    longitude: number;
  }[];
  endDate?: string;
  duration: string;
  calories: number;
  gemaId?: string;
  product?: MyProducts;
  slot1?: MyProducts;
  slot2?: MyProducts;
  slot3?: MyProducts;
  skill?: MyProducts;
  maxSpeed: number;
  minSpeed: number;
  avgSpeed: number;
  city:string;
}