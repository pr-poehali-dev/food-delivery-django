import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Dish {
  id: number;
  title: string;
  ingredients: string;
  price: number;
  image: string;
  category: string;
  is_available?: boolean;
  created_at?: string;
}

interface CartItem extends Dish {
  quantity: number;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  total_price: number;
  status: string;
  order_type: string;
  created_at: string;
  items?: any[];
}

const DISHES_API = 'https://functions.poehali.dev/78634b3f-6fa0-451f-b8a2-855a23bfef82';
const ORDERS_API = 'https://functions.poehali.dev/e3fdaa86-c004-4003-9fe7-4d9aaea9b154';

export default function Index() {
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'guest' | 'user' | 'staff'>('guest');
  const [activeSection, setActiveSection] = useState('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showDishDialog, setShowDishDialog] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const [newDish, setNewDish] = useState({
    title: '',
    ingredients: '',
    price: 0,
    image: '/placeholder.svg',
    category: ''
  });

  useEffect(() => {
    loadDishes();
    if (userRole === 'staff') {
      loadOrders();
    }
  }, [userRole]);

  const loadDishes = async () => {
    try {
      const response = await fetch(DISHES_API);
      const data = await response.json();
      setDishes(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить блюда', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(ORDERS_API);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить заказы', variant: 'destructive' });
    }
  };

  const filteredDishes = dishes.filter(dish =>
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

  const handleCheckout = async () => {
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      toast({ title: 'Ошибка', description: 'Заполните все обязательные поля', variant: 'destructive' });
      return;
    }

    try {
      const orderData = {
        customer_name: checkoutData.name,
        customer_phone: checkoutData.phone,
        customer_email: checkoutData.email,
        delivery_address: checkoutData.address,
        total_price: totalPrice,
        order_type: 'delivery',
        items: cart.map(item => ({
          dish_id: item.id,
          dish_title: item.title,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch(ORDERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Ваш заказ принят!' });
        setCart([]);
        setShowCheckout(false);
        setCheckoutData({ name: '', phone: '', email: '', address: '' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось оформить заказ', variant: 'destructive' });
    }
  };

  const handleSaveDish = async () => {
    try {
      const method = editingDish ? 'PUT' : 'POST';
      const url = editingDish ? `${DISHES_API}?id=${editingDish.id}` : DISHES_API;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDish)
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: editingDish ? 'Блюдо обновлено' : 'Блюдо добавлено' });
        loadDishes();
        setShowDishDialog(false);
        setEditingDish(null);
        setNewDish({ title: '', ingredients: '', price: 0, image: '/placeholder.svg', category: '' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить блюдо', variant: 'destructive' });
    }
  };

  const handleDeleteDish = async (dishId: number) => {
    try {
      const response = await fetch(`${DISHES_API}?id=${dishId}`, { method: 'DELETE' });
      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Блюдо удалено' });
        loadDishes();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить блюдо', variant: 'destructive' });
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`${ORDERS_API}?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast({ title: 'Успешно!', description: 'Статус заказа обновлён' });
        loadOrders();
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить статус', variant: 'destructive' });
    }
  };

  if (userRole === 'guest') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Добро пожаловать в FoodExpress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setUserRole('user')} className="w-full" size="lg">
              <Icon name="User" className="mr-2 h-5 w-5" />
              Войти как клиент
            </Button>
            <Button onClick={() => setUserRole('staff')} variant="outline" className="w-full" size="lg">
              <Icon name="UserCog" className="mr-2 h-5 w-5" />
              Войти как персонал
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="UtensilsCrossed" className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FoodExpress</span>
            <Badge variant="outline" className="ml-2">
              {userRole === 'staff' ? 'Персонал' : 'Клиент'}
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveSection('menu')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'menu' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Меню
            </button>
            {userRole === 'staff' && (
              <button
                onClick={() => setActiveSection('orders')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === 'orders' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Заказы
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setUserRole('guest');
                setCart([]);
              }}
            >
              <Icon name="LogOut" className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </nav>

          {userRole === 'user' && (
            <Sheet open={showCheckout} onOpenChange={setShowCheckout}>
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
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Корзина</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col pt-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Icon name="ShoppingBag" className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Корзина пуста</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
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
                      
                      <Separator />
                      
                      <div className="space-y-3">
                        <div>
                          <Label>Имя *</Label>
                          <Input
                            value={checkoutData.name}
                            onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })}
                            placeholder="Иван Иванов"
                          />
                        </div>
                        <div>
                          <Label>Телефон *</Label>
                          <Input
                            value={checkoutData.phone}
                            onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value })}
                            placeholder="+7 (999) 999-99-99"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={checkoutData.email}
                            onChange={(e) => setCheckoutData({ ...checkoutData, email: e.target.value })}
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <Label>Адрес доставки *</Label>
                          <Textarea
                            value={checkoutData.address}
                            onChange={(e) => setCheckoutData({ ...checkoutData, address: e.target.value })}
                            placeholder="Улица, дом, квартира"
                            rows={2}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Итого:</span>
                        <span>{totalPrice} ₽</span>
                      </div>
                      
                      <Button onClick={handleCheckout} className="w-full" size="lg">
                        Оформить заказ
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </header>

      <main className="container py-8 flex-1">
        {activeSection === 'menu' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Наше меню</h1>
                <p className="text-muted-foreground">
                  {userRole === 'staff' ? 'Управление блюдами' : 'Выберите любимые блюда'}
                </p>
              </div>
              {userRole === 'staff' && (
                <Dialog open={showDishDialog} onOpenChange={setShowDishDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingDish(null);
                      setNewDish({ title: '', ingredients: '', price: 0, image: '/placeholder.svg', category: '' });
                    }}>
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Добавить блюдо
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDish ? 'Редактировать блюдо' : 'Новое блюдо'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Название</Label>
                        <Input
                          value={newDish.title}
                          onChange={(e) => setNewDish({ ...newDish, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Ингредиенты</Label>
                        <Textarea
                          value={newDish.ingredients}
                          onChange={(e) => setNewDish({ ...newDish, ingredients: e.target.value })}
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label>Цена (₽)</Label>
                        <Input
                          type="number"
                          value={newDish.price}
                          onChange={(e) => setNewDish({ ...newDish, price: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div>
                        <Label>Категория</Label>
                        <Input
                          value={newDish.category}
                          onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>URL изображения</Label>
                        <Input
                          value={newDish.image}
                          onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleSaveDish} className="w-full">
                        {editingDish ? 'Сохранить' : 'Добавить'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDishes.map(dish => (
                  <Card
                    key={dish.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
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
                        {userRole === 'user' ? (
                          <Button onClick={() => addToCart(dish)} size="sm">
                            <Icon name="Plus" className="h-4 w-4 mr-1" />
                            В корзину
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingDish(dish);
                                setNewDish({
                                  title: dish.title,
                                  ingredients: dish.ingredients,
                                  price: dish.price,
                                  image: dish.image,
                                  category: dish.category
                                });
                                setShowDishDialog(true);
                              }}
                            >
                              <Icon name="Edit" className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteDish(dish.id)}
                            >
                              <Icon name="Trash2" className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'orders' && userRole === 'staff' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Заказы</h1>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="PackageOpen" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Заказов пока нет</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Заказ #{order.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.status === 'done' ? 'default' :
                            order.status === 'cooking' ? 'secondary' :
                            order.status === 'cancelled' ? 'destructive' : 'outline'
                          }
                        >
                          {order.status === 'pending' && 'Ожидает'}
                          {order.status === 'cooking' && 'Готовится'}
                          {order.status === 'done' && 'Готово'}
                          {order.status === 'cancelled' && 'Отменён'}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Клиент:</strong> {order.customer_name}</p>
                        <p><strong>Телефон:</strong> {order.customer_phone}</p>
                        <p><strong>Адрес:</strong> {order.delivery_address}</p>
                        <p><strong>Сумма:</strong> {order.total_price} ₽</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ожидает</SelectItem>
                            <SelectItem value="cooking">Готовится</SelectItem>
                            <SelectItem value="done">Готово</SelectItem>
                            <SelectItem value="cancelled">Отменён</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
