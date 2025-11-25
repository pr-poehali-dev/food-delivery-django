export interface Dish {
  id: number;
  title: string;
  ingredients: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Dish {
  quantity: number;
}

export interface Order {
  id: number;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'cooking' | 'delivery' | 'completed' | 'cancelled';
  orderType: 'delivery' | 'takeaway';
  createdAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}
