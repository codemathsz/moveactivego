import { MyProducts } from "./products.interface";

export interface UserInventoryInterface {
  product?: MyProducts;
  used?: number;
  durability: number;
  box?: string;
  gem1?: MyProducts;
  gem2?: MyProducts;
  gem3?: MyProducts;
}
