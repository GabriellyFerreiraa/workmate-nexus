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
  assignedTo: z.string().min(1, 'You must select an analyst'),
  priority: z.number().min(1).max(5),
  dueDate: z.string().optional()
});
type FormData = z.infer<typeof schema>;
interface TaskAssignmentFormProps {
  analysts: any[];
  onClose: () => void;
  onSuccess: () => void;
}
export const TaskAssignmentForm = ({
  analysts,
  onClose,
  onSuccess
}: TaskAssignmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    user
  } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    formState: {
      errors
    }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: 1
    }
  });
  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const taskData = {
        title: data.title,
        description: data.description,
        assigned_to: data.assignedTo,
        assigned_by: user.id,
        priority: data.priority,
        status: 'pending' as const,
        ...(data.dueDate && {
          due_date: new Date(data.dueDate).toISOString()
        })
      };
      const {
        error
      } = await supabase.from('tasks').insert(taskData);
      if (error) throw error;
      toast({
        title: "Task Assigned",
        description: "The task has been assigned successfully"
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Could not assign the task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[hsl(var(--panel))]">
        <DialogHeader>
          <DialogTitle>Assign New Task</DialogTitle>
          <DialogDescription>
            Assign a new task to a team analyst
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input id="title" placeholder="Descriptive task title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" placeholder="Additional details about the task..." {...register('description')} />
          </div>
          
          <div className="space-y-2">
            <Label>Assign to</Label>
            <Select onValueChange={value => setValue('assignedTo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an analyst" />
              </SelectTrigger>
              <SelectContent>
                {analysts.map(analyst => <SelectItem key={analyst.user_id} value={analyst.user_id}>
                    {analyst.name}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <input type="hidden" {...register('assignedTo')} />
            {errors.assignedTo && <p className="text-sm text-destructive">{errors.assignedTo.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select onValueChange={value => setValue('priority', parseInt(value))}>
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
              <input type="hidden" {...register('priority', { valueAsNumber: true })} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (optional)</Label>
              <Input id="dueDate" type="datetime-local" {...register('dueDate')} />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Assigning...' : 'Assign Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};