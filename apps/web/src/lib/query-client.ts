import { QueryClient } from '@tanstack/react-query'

type QueryClientOverrides = {
  queriesRetry?: number | false
  mutationsRetry?: number | false
}

export const createAppQueryClient = (
  overrides?: QueryClientOverrides,
) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: overrides?.queriesRetry ?? 1,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: overrides?.mutationsRetry ?? 0,
      },
    },
  })

export const queryClient = createAppQueryClient()
