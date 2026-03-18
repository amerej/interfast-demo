import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../../lib/api';
import type { Comment } from '../../../lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CommentSection({
  activityId,
  projectId,
}: {
  activityId: string;
  projectId: string;
}) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', activityId],
    queryFn: () => api.getActivityComments(activityId),
  });

  const createMutation = useMutation({
    mutationFn: (message: string) => api.createComment(activityId, message),
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: ['comments', activityId] });
      const previous = queryClient.getQueryData<Comment[]>(['comments', activityId]);
      queryClient.setQueryData<Comment[]>(['comments', activityId], (old = []) => [
        ...old,
        { id: 'temp-' + Date.now(), activityId, userId: '', message, userName: 'Vous', createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['comments', activityId], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['comments', activityId] }),
    onSuccess: () => {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createMutation.mutate(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="mt-3 ml-1 pl-3 border-l-2 border-border/60">
      {isLoading ? (
        <div className="animate-pulse h-5 bg-secondary rounded w-24" />
      ) : (
        <div className="space-y-2.5">
          {comments?.map((comment) => (
            <div key={comment.id} className="text-[11px]">
              <span className="font-medium">{comment.userName ?? 'Anonyme'}</span>
              <span className="text-muted-foreground/50 ml-2">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString('fr-FR') : ''}
              </span>
              <p className="text-muted-foreground mt-0.5">{comment.message}</p>
            </div>
          ))}
          {comments?.length === 0 && (
            <p className="text-[11px] text-muted-foreground/40">Aucun commentaire</p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
        <Input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Écrire..."
          className="h-7 text-xs rounded-lg"
        />
        <Button type="submit" size="xs" className="rounded-lg" disabled={!newComment.trim() || createMutation.isPending}>
          Envoyer
        </Button>
      </form>
    </div>
  );
}
