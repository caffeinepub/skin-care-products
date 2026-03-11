import { useState } from 'react';
import { X, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { useGetProductById } from '../hooks/useProductQueries';
import { useDeleteProduct } from '../hooks/useProductMutations';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProductFormDialog from './ProductFormDialog';
import type { Product } from '../backend';

interface ProductDetailsDialogProps {
  productId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductDetailsDialog({
  productId,
  open,
  onOpenChange,
}: ProductDetailsDialogProps) {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: product, isLoading, error } = useGetProductById(productId);
  const deleteProduct = useDeleteProduct();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(productId);
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

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
    <>
      <Dialog open={open && !showEditDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error || !product ? (
            <div className="py-8">
              <Alert variant="destructive">
                <AlertDescription>
                  Product not found. It may have been deleted.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{product.name}</DialogTitle>
                    <DialogDescription className="text-base">
                      {product.brand}
                    </DialogDescription>
                  </div>
                  {isAuthenticated && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowEditDialog(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Price and Badges */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(product.price.amount, product.price.currency)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {formatCategory(product.category)}
                    </Badge>
                    <Badge variant="outline">
                      {formatSkinType(product.skinType)}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                {product.description && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Key Ingredients */}
                {product.keyIngredients.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Key Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.keyIngredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {product.concerns.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Addresses Concerns</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.concerns.map((concern, index) => (
                        <Badge key={index} variant="secondary">
                          {concern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage Instructions */}
                {product.usageInstructions && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">How to Use</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.usageInstructions}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {product && showEditDialog && (
        <ProductFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          product={product}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
