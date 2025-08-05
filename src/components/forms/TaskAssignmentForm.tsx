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
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  assignedTo: z.string().min(1, 'Debe seleccionar un analista'),
  priority: z.number().min(1).max(5),
  dueDate: z.string().optional()
});

type FormData = z.infer<typeof schema>;

interface TaskAssignmentFormProps {
  analysts: any[];
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskAssignmentForm = ({ analysts, onClose, onSuccess }: TaskAssignmentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
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
        ...(data.dueDate && { due_date: new Date(data.dueDate).toISOString() })
      };

      const { error } = await supabase
        .from('tasks')
        .insert(taskData);

      if (error) throw error;

      toast({
        title: "Tarea asignada",
        description: "La tarea ha sido asignada exitosamente"
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "No se pudo asignar la tarea",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Nueva Tarea</DialogTitle>
          <DialogDescription>
            Asigna una nueva tarea a un analista del equipo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título de la tarea</Label>
            <Input
              id="title"
              placeholder="Título descriptivo de la tarea"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Detalles adicionales sobre la tarea..."
              {...register('description')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Asignar a</Label>
            <Select onValueChange={(value) => setValue('assignedTo', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un analista" />
              </SelectTrigger>
              <SelectContent>
                {analysts.map((analyst) => (
                  <SelectItem key={analyst.user_id} value={analyst.user_id}>
                    {analyst.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedTo && (
              <p className="text-sm text-destructive">{errors.assignedTo.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridad</Label>
              <Select onValueChange={(value) => setValue('priority', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Baja</SelectItem>
                  <SelectItem value="2">2 - Normal</SelectItem>
                  <SelectItem value="3">3 - Media</SelectItem>
                  <SelectItem value="4">4 - Alta</SelectItem>
                  <SelectItem value="5">5 - Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Fecha límite (opcional)</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                {...register('dueDate')}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Asignando...' : 'Asignar Tarea'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};