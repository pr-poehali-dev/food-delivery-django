import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    
    if (success) {
      toast({
        title: 'Успешный вход',
        description: 'Вы успешно вошли в систему'
      });
      onOpenChange(false);
      setEmail('');
      setPassword('');
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка входа',
        description: 'Неверный email или пароль'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вход в систему</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@food.ru"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              required
            />
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Демо-доступы:</p>
            <p>• Админ: admin@food.ru / admin</p>
            <p>• Клиент: user@food.ru / user</p>
          </div>
          <Button type="submit" className="w-full">Войти</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
