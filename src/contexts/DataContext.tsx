import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Dish, Order, CartItem } from '@/types';

interface DataContextType {
  dishes: Dish[];
  orders: Order[];
  addDish: (dish: Omit<Dish, 'id'>) => void;
  updateDish: (id: number, dish: Partial<Dish>) => void;
  deleteDish: (id: number) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrderStatus: (id: number, status: Order['status']) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INITIAL_DISHES: Dish[] = [
  {
    id: 1,
    title: 'Пицца Маргарита',
    ingredients: 'Томаты, моцарелла, базилик, оливковое масло',
    price: 590,
    image: 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/096a6145-26b4-4f69-beb1-23f5cdffb122.jpg',
    category: 'Пицца'
  },
  {
    id: 2,
    title: 'Суши Филадельфия',
    ingredients: 'Лосось, сливочный сыр, авокадо, рис',
    price: 450,
    image: 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/d221d873-5fcf-4132-bbe5-c0fca62178ff.jpg',
    category: 'Суши'
  },
  {
    id: 3,
    title: 'Бургер Классик',
    ingredients: 'Говядина, салат, томаты, сыр чеддер, соус',
    price: 390,
    image: 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/a9e72466-193c-449f-abf8-c940e1d05efe.jpg',
    category: 'Бургеры'
  },
  {
    id: 4,
    title: 'Паста Карбонара',
    ingredients: 'Спагетти, бекон, сливки, пармезан, яйцо',
    price: 420,
    image: '/placeholder.svg',
    category: 'Паста'
  },
  {
    id: 5,
    title: 'Салат Цезарь',
    ingredients: 'Курица, салат айсберг, пармезан, гренки, соус',
    price: 340,
    image: '/placeholder.svg',
    category: 'Салаты'
  },
  {
    id: 6,
    title: 'Том Ям',
    ingredients: 'Креветки, грибы, лимонник, перец чили',
    price: 480,
    image: '/placeholder.svg',
    category: 'Супы'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedDishes = localStorage.getItem('food_dishes');
    const savedOrders = localStorage.getItem('food_orders');
    
    if (savedDishes) {
      setDishes(JSON.parse(savedDishes));
    } else {
      setDishes(INITIAL_DISHES);
    }
    
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  useEffect(() => {
    if (dishes.length > 0) {
      localStorage.setItem('food_dishes', JSON.stringify(dishes));
    }
  }, [dishes]);

  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem('food_orders', JSON.stringify(orders));
    }
  }, [orders]);

  const addDish = (dish: Omit<Dish, 'id'>) => {
    const newDish = { ...dish, id: Date.now() };
    setDishes(prev => [...prev, newDish]);
  };

  const updateDish = (id: number, updatedFields: Partial<Dish>) => {
    setDishes(prev => prev.map(dish => dish.id === id ? { ...dish, ...updatedFields } : dish));
  };

  const deleteDish = (id: number) => {
    setDishes(prev => prev.filter(dish => dish.id !== id));
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const updateOrderStatus = (id: number, status: Order['status']) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  };

  return (
    <DataContext.Provider value={{ 
      dishes, 
      orders, 
      addDish, 
      updateDish, 
      deleteDish, 
      addOrder,
      updateOrderStatus 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
