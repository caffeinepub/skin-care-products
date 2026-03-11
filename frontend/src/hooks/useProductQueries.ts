import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Product, ProductId, ProductFilter } from '../backend';

export function useFilterProducts(filters: ProductFilter) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['products', 'list', filters],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.filterProducts(filters);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetProductById(id: ProductId) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['products', 'detail', id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProductById(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}
