import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

interface Dish {
  id: number;
  title: string;
  ingredients: string;
  price: number;
  image: string;
  category: string;
}

interface CartItem extends Dish {
  quantity: number;
}

const mockDishes: Dish[] = [
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

export default function Index() {
  const [activeSection, setActiveSection] = useState('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDishes = mockDishes.filter(dish =>
    dish.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dish.ingredients.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (dish: Dish) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: number) => {
    setCart(prev => prev.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId: number, delta: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === dishId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="UtensilsCrossed" className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FoodExpress</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {['menu', 'orders', 'profile', 'about', 'contacts'].map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === section ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {section === 'menu' && 'Меню'}
                {section === 'orders' && 'Мои заказы'}
                {section === 'profile' && 'Профиль'}
                {section === 'about' && 'О нас'}
                {section === 'contacts' && 'Контакты'}
              </button>
            ))}
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Icon name="ShoppingCart" className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Корзина</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full pt-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center">
                    <Icon name="ShoppingBag" className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Корзина пуста</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-auto space-y-4">
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.price} ₽</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Icon name="Minus" className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Icon name="Plus" className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 ml-auto"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Icon name="Trash2" className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-4">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Итого:</span>
                        <span>{totalPrice} ₽</span>
                      </div>
                      <Button className="w-full" size="lg">
                        Оформить заказ
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="container py-8 flex-1">
        {activeSection === 'menu' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Наше меню</h1>
              <p className="text-muted-foreground">Выберите любимые блюда и добавьте в корзину</p>
            </div>

            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск блюд..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDishes.map(dish => (
                <Card
                  key={dish.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={dish.image}
                      alt={dish.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3">{dish.category}</Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{dish.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {dish.ingredients}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{dish.price} ₽</span>
                      <Button onClick={() => addToCart(dish)} size="sm">
                        <Icon name="Plus" className="h-4 w-4 mr-1" />
                        В корзину
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'orders' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Мои заказы</h1>
            <div className="text-center py-12">
              <Icon name="PackageOpen" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">У вас пока нет заказов</p>
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Профиль</h1>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Имя</label>
                  <Input placeholder="Ваше имя" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input type="email" placeholder="email@example.com" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Телефон</label>
                  <Input placeholder="+7 (___) ___-__-__" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Адрес доставки</label>
                  <Input placeholder="Улица, дом, квартира" className="mt-1" />
                </div>
                <Button className="w-full">Сохранить изменения</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">О нас</h1>
            <Card>
              <CardContent className="p-6 space-y-4">
                <p className="text-lg">
                  FoodExpress — это сервис доставки любимых блюд прямо к вашей двери.
                  Мы работаем с лучшими ресторанами города, чтобы вы могли наслаждаться
                  качественной едой в комфорте вашего дома.
                </p>
                <Separator />
                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  <div className="text-center">
                    <Icon name="Clock" className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Быстро</h3>
                    <p className="text-sm text-muted-foreground">Доставка за 30-40 минут</p>
                  </div>
                  <div className="text-center">
                    <Icon name="ThumbsUp" className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">Качественно</h3>
                    <p className="text-sm text-muted-foreground">Свежие продукты каждый день</p>
                  </div>
                  <div className="text-center">
                    <Icon name="Heart" className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold mb-1">С любовью</h3>
                    <p className="text-sm text-muted-foreground">Готовим для вас с душой</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'contacts' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Контакты</h1>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="Phone" className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Телефон</h3>
                    <p className="text-muted-foreground">+7 (999) 123-45-67</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Icon name="Mail" className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-muted-foreground">info@foodexpress.ru</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Адрес</h3>
                    <p className="text-muted-foreground">г. Москва, ул. Примерная, д. 1</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="border-t mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon name="UtensilsCrossed" className="h-5 w-5 text-primary" />
              <span className="font-semibold">FoodExpress</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FoodExpress. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}