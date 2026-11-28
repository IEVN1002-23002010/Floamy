export type PresentationSize = string;

export interface PresentationOption {
  id?: number;
  nombre: string;
  precio: number;
  imagen_url?: string | null;
}

export interface ToppingOption {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
  ingrediente_id?: number | null;
  ingrediente_nombre?: string | null;
  ingrediente_unidad?: string | null;
  proveedor_id?: number | null;
  proveedor_nombre?: string;
}

export interface ProductPresentationStock {
  presentationId: number;
  productId?: number | null;
  name: string;
  price: number;
  stock: number;
}

export interface RecipeIngredient {
  id?: number;
  ingrediente_id?: number;
  ingrediente_nombre?: string;
  nombre?: string;
  unidad?: string;
  cantidad_por_litro?: number;
}

export interface ProductItem {
  id?: number;
  name: string;
  flavor: string;
  tone: string;
  stockCup: number;
  stockLiter: number;
  cupProductId?: number;
  literProductId?: number;
  presentations?: ProductPresentationStock[];
  image?: string;
  receta?: RecipeIngredient[];
  recipe?: RecipeIngredient[];
}

export interface CartItem {
  productId?: number;
  name: string;
  size: PresentationSize;
  price: number;
  qty: number;
  toppings?: string[];
  toppingIds?: number[];
}