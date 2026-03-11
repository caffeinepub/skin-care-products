import { useState } from 'react';
import { Search, Plus, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProductCard from '../components/ProductCard';
import ProductDetailsDialog from '../components/ProductDetailsDialog';
import ProductFormDialog from '../components/ProductFormDialog';
import { useFilterProducts } from '../hooks/useProductQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import type { ProductFilter, ProductCategory, SkinType, Currency } from '../backend';

export default function CatalogPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<ProductCategory | undefined>(undefined);
  const [skinType, setSkinType] = useState<SkinType | undefined>(undefined);
  const [concerns, setConcerns] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [currency] = useState<Currency | undefined>(undefined);

  const [selectedProductId, setSelectedProductId] = useState<bigint | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filters: ProductFilter = {
    searchText: searchText || undefined,
    category,
    skinType,
    concerns: concerns || undefined,
    minPrice,
    maxPrice,
    currency,
  };

  const { data: products = [], isLoading, error } = useFilterProducts(filters);

  const handleClearFilters = () => {
    setSearchText('');
    setCategory(undefined);
    setSkinType(undefined);
    setConcerns('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-accent/30 to-background overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Discover Your Perfect Skin Care
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
                Explore curated products tailored to your skin type and concerns. Find the perfect routine for healthy, glowing skin.
              </p>
            </div>
            <div className="relative aspect-[8/3] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/assets/generated/skincare-hero.dim_1600x600.png"
                alt="Skin care products and botanical elements"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Search and Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            {isAuthenticated ? (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            ) : (
              <Button variant="outline" disabled className="gap-2">
                <Plus className="h-4 w-4" />
                Sign in to Add
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={category?.__kind__ || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setCategory(undefined);
                      } else {
                        setCategory({ __kind__: value, [value]: null } as ProductCategory);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                  <label className="text-sm font-medium">Skin Type</label>
                  <Select
                    value={skinType || 'all'}
                    onValueChange={(value) => {
                      setSkinType(value === 'all' ? undefined : (value as SkinType));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Skin Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skin Types</SelectItem>
                      <SelectItem value="oily">Oily</SelectItem>
                      <SelectItem value="dry">Dry</SelectItem>
                      <SelectItem value="combination">Combination</SelectItem>
                      <SelectItem value="sensitive">Sensitive</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Concerns</label>
                  <Input
                    placeholder="e.g., acne, aging"
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice ?? ''}
                      onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice ?? ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="aspect-square w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load products. Please try again later.
            </AlertDescription>
          </Alert>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or search terms
            </p>
            {isAuthenticated && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id.toString()}
                product={product}
                onClick={() => setSelectedProductId(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dialogs */}
      {selectedProductId !== null && (
        <ProductDetailsDialog
          productId={selectedProductId}
          open={selectedProductId !== null}
          onOpenChange={(open) => !open && setSelectedProductId(null)}
        />
      )}

      {showCreateDialog && (
        <ProductFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
        />
      )}
    </div>
  );
}
