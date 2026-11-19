export type PresentationSize = string;

export interface PresentationOption {
  id?: number;
  nombre: string;
  precio: number;
}

export interface ToppingOption {
  id?: number;
  nombre: string;
  precio: number;
  stock: number;
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