import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../services/api";

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, content }: { userId: string; content: string }) =>
      createPost(userId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
