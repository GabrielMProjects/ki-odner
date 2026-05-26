export interface ProductImage {
  small_image_url: string;
  medium_image_url: string;
  large_image_url: string;
  original_image_url: string;
}

export interface ProductPrice {
  price: string;
  formatted_price: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string;
  url_key: string;
  base_image: ProductImage;
  images: ProductImage[];
  is_new: boolean;
  is_featured: boolean;
  on_sale: boolean;
  is_saleable: boolean;
  min_price: string;
  prices: {
    regular: ProductPrice;
    final: ProductPrice;
  };
  ratings: {
    average: string;
    total: number;
  };
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
