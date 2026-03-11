import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const formatPrice = (amount: number, currency: any) => {
    const currencySymbol = currency.__kind__ === 'usd' ? '$' : currency.__kind__ === 'eur' ? '€' : currency.__kind__ === 'gbp' ? '£' : currency.__kind__ === 'jpy' ? '¥' : '';
    return `${currencySymbol}${amount.toFixed(2)}`;
  };

  const formatCategory = (category: any) => {
    const kind = category.__kind__;
    return kind === 'eyeTreatment' ? 'Eye Treatment' : kind.charAt(0).toUpperCase() + kind.slice(1);
  };

  const formatSkinType = (skinType: string) => {
    return skinType.charAt(0).toUpperCase() + skinType.slice(1);
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 flex-1">
            {product.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">{product.brand}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {formatCategory(product.category)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {formatSkinType(product.skinType)}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-xl font-bold text-primary">
          {formatPrice(product.price.amount, product.price.currency)}
        </p>
      </CardFooter>
    </Card>
  );
}
