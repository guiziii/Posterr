import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repost } from "../services/api";

export function useRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      repost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
