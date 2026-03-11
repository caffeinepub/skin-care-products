import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateProduct, useUpdateProduct } from '../hooks/useProductMutations';
import { toast } from 'sonner';
import type { Product, ProductCategory, SkinType, Currency } from '../backend';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'cleanser' as string,
    skinType: 'normal' as SkinType,
    keyIngredients: '',
    concerns: '',
    priceAmount: '',
    priceCurrency: 'usd' as string,
    description: '',
    usageInstructions: '',
    imageUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category.__kind__,
        skinType: product.skinType,
        keyIngredients: product.keyIngredients.join(', '),
        concerns: product.concerns.join(', '),
        priceAmount: product.price.amount.toString(),
        priceCurrency: product.price.currency.__kind__,
        description: product.description,
        usageInstructions: product.usageInstructions,
        imageUrl: product.imageUrl,
      });
    }
  }, [product]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.priceAmount || isNaN(Number(formData.priceAmount)) || Number(formData.priceAmount) < 0) {
      newErrors.priceAmount = 'Valid price is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const productData: Product = {
      id: product?.id || BigInt(0),
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: { __kind__: formData.category, [formData.category]: null } as ProductCategory,
      skinType: formData.skinType,
      keyIngredients: formData.keyIngredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean),
      concerns: formData.concerns
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean),
      price: {
        amount: Number(formData.priceAmount),
        currency: { __kind__: formData.priceCurrency, [formData.priceCurrency]: null } as Currency,
      },
      description: formData.description.trim(),
      usageInstructions: formData.usageInstructions.trim(),
      imageUrl: formData.imageUrl.trim(),
    };

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({
          id: product.id,
          update: {
            name: productData.name,
            brand: productData.brand,
            category: productData.category,
            skinType: productData.skinType,
            keyIngredients: productData.keyIngredients,
            concerns: productData.concerns,
            price: productData.price,
            description: productData.description,
            usageInstructions: productData.usageInstructions,
            imageUrl: productData.imageUrl,
          },
        });
        toast.success('Product updated successfully');
      } else {
        await createProduct.mutateAsync(productData);
        toast.success('Product created successfully');
      }
      onOpenChange(false);
    } catch (err: any) {
      const errorMessage = err?.message || 'An error occurred';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('Please sign in to manage products');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update product information' : 'Fill in the details to add a new product'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Product Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Hydrating Face Serum"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">
                Brand <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g., CeraVe"
              />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleanser">Cleanser</SelectItem>
                  <SelectItem value="serum">Serum</SelectItem>
                  <SelectItem value="moisturizer">Moisturizer</SelectItem>
                  <SelectItem value="sunscreen">Sunscreen</SelectItem>
                  <SelectItem value="exfoliator">Exfoliator</SelectItem>
                  <SelectItem value="mask">Mask</SelectItem>
                  <SelectItem value="toner">Toner</SelectItem>
                  <SelectItem value="eyeTreatment">Eye Treatment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type</Label>
              <Select
                value={formData.skinType}
                onValueChange={(value) => setFormData({ ...formData, skinType: value as SkinType })}
              >
                <SelectTrigger id="skinType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oily">Oily</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="combination">Combination</SelectItem>
                  <SelectItem value="sensitive">Sensitive</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="priceAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceAmount}
                onChange={(e) => setFormData({ ...formData, priceAmount: e.target.value })}
                placeholder="29.99"
              />
              {errors.priceAmount && <p className="text-sm text-destructive">{errors.priceAmount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceCurrency">Currency</Label>
              <Select
                value={formData.priceCurrency}
                onValueChange={(value) => setFormData({ ...formData, priceCurrency: value })}
              >
                <SelectTrigger id="priceCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD ($)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="gbp">GBP (£)</SelectItem>
                  <SelectItem value="jpy">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyIngredients">Key Ingredients (comma-separated)</Label>
            <Input
              id="keyIngredients"
              value={formData.keyIngredients}
              onChange={(e) => setFormData({ ...formData, keyIngredients: e.target.value })}
              placeholder="e.g., Hyaluronic Acid, Vitamin C, Niacinamide"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concerns">Addresses Concerns (comma-separated)</Label>
            <Input
              id="concerns"
              value={formData.concerns}
              onChange={(e) => setFormData({ ...formData, concerns: e.target.value })}
              placeholder="e.g., Dryness, Fine Lines, Dullness"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the product..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageInstructions">Usage Instructions</Label>
            <Textarea
              id="usageInstructions"
              value={formData.usageInstructions}
              onChange={(e) => setFormData({ ...formData, usageInstructions: e.target.value })}
              placeholder="How to use this product..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditing ? 'Update Product' : 'Create Product'}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
