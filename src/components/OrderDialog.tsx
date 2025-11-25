import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CartItem } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';

interface OrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  totalPrice: number;
  onOrderComplete: () => void;
}

export function OrderDialog({ open, onOpenChange, cartItems, totalPrice, onOrderComplete }: OrderDialogProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userPhone: '',
    userAddress: '',
    orderType: 'delivery' as 'delivery' | 'takeaway'
  });
  const { addOrder } = useData();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addOrder({
      userName: formData.userName,
      userPhone: formData.userPhone,
      userAddress: formData.orderType === 'delivery' ? formData.userAddress : 'Самовывоз',
      items: cartItems,
      totalPrice,
      status: 'pending',
      orderType: formData.orderType
    });

    toast({
      title: 'Заказ оформлен!',
      description: `Заказ №${Date.now()} принят в обработку`
    });

    onOrderComplete();
    onOpenChange(false);
    setFormData({
      userName: '',
      userPhone: '',
      userAddress: '',
      orderType: 'delivery'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Оформление заказа</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="userName">Ваше имя</Label>
            <Input
              id="userName"
              value={formData.userName}
              onChange={(e) => setFormData(prev => ({ ...prev, userName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="userPhone">Телефон</Label>
            <Input
              id="userPhone"
              type="tel"
              value={formData.userPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, userPhone: e.target.value }))}
              placeholder="+7 (___) ___-__-__"
              required
            />
          </div>
          <div>
            <Label>Тип заказа</Label>
            <RadioGroup
              value={formData.orderType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, orderType: value as 'delivery' | 'takeaway' }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery">Доставка</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="takeaway" id="takeaway" />
                <Label htmlFor="takeaway">Самовывоз</Label>
              </div>
            </RadioGroup>
          </div>
          {formData.orderType === 'delivery' && (
            <div>
              <Label htmlFor="userAddress">Адрес доставки</Label>
              <Input
                id="userAddress"
                value={formData.userAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, userAddress: e.target.value }))}
                placeholder="Улица, дом, квартира"
                required
              />
            </div>
          )}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Итого:</span>
              <span>{totalPrice} ₽</span>
            </div>
            <Button type="submit" className="w-full">
              Оформить заказ
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
