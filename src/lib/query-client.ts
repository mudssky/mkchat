import { QueryClient } from "@tanstack/react-query";

const QUERY_STALE_TIME = 1000 * 30;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME,
        gcTime: QUERY_GC_TIME,
        refetchOnWindowFocus: false,
      },
    },
  });
}
