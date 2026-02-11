import { useInfiniteQuery } from "@tanstack/react-query";
import { getPosts } from "../services/api";

const INITIAL_LIMIT = 15;
const LOAD_MORE_LIMIT = 20;

interface UsePostsOptions {
  sort: string;
  search?: string;
}

export function usePosts({ sort, search }: UsePostsOptions) {
  return useInfiniteQuery({
    queryKey: ["posts", { sort, search }],
    queryFn: ({ pageParam }) => {
      const page = pageParam as number;
      const limit = page === 1 ? INITIAL_LIMIT : LOAD_MORE_LIMIT;
      return getPosts(page, limit, sort, search);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
}
