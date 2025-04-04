import { MyProducts } from "./products.interface";

export interface UserInventoryUpdateInterface {
  used?: number;
  durability: number;
  gem1?: MyProducts;
  gem2?: MyProducts;
  gem3?: MyProducts;
}
