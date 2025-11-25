import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { LoginDialog } from '@/components/LoginDialog';
import { DishFormDialog } from '@/components/DishFormDialog';
import { OrderDialog } from '@/components/OrderDialog';
import { CartItem, Dish, Order } from '@/types';

export default function Index() {
  const { user, logout, isAdmin } = useAuth();
  const { dishes, orders, addDish, updateDish, deleteDish, updateOrderStatus } = useData();
  const [activeSection, setActiveSection] = useState('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [dishFormOpen, setDishFormOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deletingDishId, setDeletingDishId] = useState<number | null>(null);

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

  const handleSaveDish = (dish: Omit<Dish, 'id'> | Dish) => {
    if ('id' in dish) {
      updateDish(dish.id, dish);
    } else {
      addDish(dish);
    }
    setEditingDish(null);
  };

  const handleDeleteDish = () => {
    if (deletingDishId) {
      deleteDish(deletingDishId);
      setDeletingDishId(null);
    }
  };

  const handleOrderComplete = () => {
    setCart([]);
  };

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      cooking: 'bg-blue-100 text-blue-800',
      delivery: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Ожидает',
      cooking: 'Готовится',
      delivery: 'В доставке',
      completed: 'Выполнен',
      cancelled: 'Отменён'
    };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="UtensilsCrossed" className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FoodExpress</span>
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
            {isAdmin && (
              <button
                onClick={() => setActiveSection('admin-orders')}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  activeSection === 'admin-orders' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                Заказы
              </button>
            )}
            <button
              onClick={() => setActiveSection('about')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'about' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              О нас
            </button>
            <button
              onClick={() => setActiveSection('contacts')}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                activeSection === 'contacts' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Контакты
            </button>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.name}
                  {isAdmin && ' (Админ)'}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Выйти
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>
                Войти
              </Button>
            )}
            {!isAdmin && (
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
                          <Button
                            className="w-full"
                            size="lg"
                            onClick={() => setOrderDialogOpen(true)}
                          >
                            Оформить заказ
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8 flex-1">
        {activeSection === 'menu' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-2">Наше меню</h1>
              <p className="text-muted-foreground">
                {isAdmin ? 'Управление меню ресторана' : 'Выберите любимые блюда и добавьте в корзину'}
              </p>
            </div>

            <div className="flex gap-4 items-center mb-8 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск блюд..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isAdmin && (
                <Button onClick={() => { setEditingDish(null); setDishFormOpen(true); }}>
                  <Icon name="Plus" className="h-4 w-4 mr-2" />
                  Добавить блюдо
                </Button>
              )}
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
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setEditingDish(dish); setDishFormOpen(true); }}
                          >
                            <Icon name="Pencil" className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeletingDishId(dish.id)}
                          >
                            <Icon name="Trash2" className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button onClick={() => addToCart(dish)} size="sm">
                          <Icon name="Plus" className="h-4 w-4 mr-1" />
                          В корзину
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'admin-orders' && isAdmin && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Управление заказами</h1>
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="PackageOpen" className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Пока нет заказов</p>
                </div>
              ) : (
                orders.slice().reverse().map(order => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Заказ #{order.id}</CardTitle>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString('ru-RU')}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Клиент</p>
                          <p className="text-sm text-muted-foreground">{order.userName}</p>
                          <p className="text-sm text-muted-foreground">{order.userPhone}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {order.orderType === 'delivery' ? 'Адрес доставки' : 'Самовывоз'}
                          </p>
                          <p className="text-sm text-muted-foreground">{order.userAddress}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium mb-2">Состав заказа</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.title} x {item.quantity}</span>
                              <span>{item.price * item.quantity} ₽</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Статус заказа</p>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value as Order['status'])}
                          >
                            <SelectTrigger className="w-[180px] mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Ожидает</SelectItem>
                              <SelectItem value="cooking">Готовится</SelectItem>
                              <SelectItem value="delivery">В доставке</SelectItem>
                              <SelectItem value="completed">Выполнен</SelectItem>
                              <SelectItem value="cancelled">Отменён</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Итого</p>
                          <p className="text-2xl font-bold text-primary">{order.totalPrice} ₽</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
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

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      <DishFormDialog
        open={dishFormOpen}
        onOpenChange={setDishFormOpen}
        dish={editingDish}
        onSave={handleSaveDish}
      />
      <OrderDialog
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        cartItems={cart}
        totalPrice={totalPrice}
        onOrderComplete={handleOrderComplete}
      />
      <AlertDialog open={!!deletingDishId} onOpenChange={() => setDeletingDishId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить блюдо?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Блюдо будет удалено из меню.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDish}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
