import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutGrid, Users, ShoppingCart, Settings, ChefHat, Receipt } from 'lucide-react';

const features = [
  {
    icon: LayoutGrid,
    title: 'Маси',
    description: 'Управление на ресторантски маси и статуси',
    href: '/tables',
    primary: true,
  },
  {
    icon: ShoppingCart,
    title: 'Поръчки',
    description: 'Преглед и управление на активни поръчки',
    href: '#',
    disabled: true,
  },
  {
    icon: Receipt,
    title: 'Сметки',
    description: 'История на приключени сметки',
    href: '#',
    disabled: true,
  },
  {
    icon: ChefHat,
    title: 'Кухня',
    description: 'Екран за кухня и приготвяне',
    href: '#',
    disabled: true,
  },
  {
    icon: Users,
    title: 'Персонал',
    description: 'Управление на служители и смени',
    href: '#',
    disabled: true,
  },
  {
    icon: Settings,
    title: 'Настройки',
    description: 'Конфигурация на системата',
    href: '#',
    disabled: true,
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-card">
        <div className="container py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ChefHat className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight">GDS POS</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Ресторантска система за управление
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className={`transition-all ${
                feature.disabled
                  ? 'opacity-50'
                  : 'hover:shadow-lg hover:shadow-primary/5'
              } ${feature.primary ? 'ring-2 ring-primary' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      feature.primary
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {feature.disabled ? (
                  <Button variant="outline" disabled className="w-full">
                    Очаквайте скоро
                  </Button>
                ) : (
                  <Button asChild className="w-full" variant={feature.primary ? 'default' : 'outline'}>
                    <Link to={feature.href}>Отвори</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
