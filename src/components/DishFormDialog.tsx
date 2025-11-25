import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dish } from '@/types';

interface DishFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dish?: Dish | null;
  onSave: (dish: Omit<Dish, 'id'> | Dish) => void;
}

export function DishFormDialog({ open, onOpenChange, dish, onSave }: DishFormDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    price: '',
    image: '',
    category: ''
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        title: dish.title,
        ingredients: dish.ingredients,
        price: dish.price.toString(),
        image: dish.image,
        category: dish.category
      });
    } else {
      setFormData({
        title: '',
        ingredients: '',
        price: '',
        image: '/placeholder.svg',
        category: ''
      });
    }
  }, [dish, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dishData = {
      ...formData,
      price: parseFloat(formData.price),
      ...(dish ? { id: dish.id } : {})
    };
    onSave(dishData as Dish);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{dish ? 'Редактировать блюдо' : 'Добавить блюдо'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="ingredients">Состав</Label>
            <Textarea
              id="ingredients"
              value={formData.ingredients}
              onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Категория</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Пицца, Суши, Бургеры..."
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Цена (₽)</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="image">URL изображения</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              placeholder="/placeholder.svg"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {dish ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
