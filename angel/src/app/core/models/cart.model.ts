export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    sku: string;
  };
  quantity: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}
