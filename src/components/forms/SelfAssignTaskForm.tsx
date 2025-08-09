import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  priority: z.number().min(1).max(5),
  dueDate: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface SelfAssignTaskFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const SelfAssignTaskForm = ({ onClose, onSuccess }: SelfAssignTaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 1 }
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        assigned_to: user.id,
        assigned_by: user.id,
        priority: data.priority,
        status: 'pending' as const,
        ...(data.dueDate && { due_date: new Date(data.dueDate).toISOString() })
      };

      const { error } = await supabase.from('tasks').insert(taskData);
      if (error) throw error;

      toast({
        title: 'Task Self-assigned',
        description: 'Your task has been created successfully'
      });
      onSuccess();
    } catch (error) {
      console.error('Error self-assigning task:', error);
      toast({
        title: 'Error',
        description: 'Could not create the task',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900">
        <DialogHeader>
          <DialogTitle>Self-assign Task</DialogTitle>
          <DialogDescription>Create a task for yourself</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" placeholder="Descriptive task title" className="bg-slate-800" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="Additional details about the task..." className="bg-slate-800" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={(value) => setValue('priority', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Low</SelectItem>
                  <SelectItem value="2">2 - Normal</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input id="dueDate" type="datetime-local" className="bg-slate-800" {...register('dueDate')} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="bg-slate-800 hover:bg-slate-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};