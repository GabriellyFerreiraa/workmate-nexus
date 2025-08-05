import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres')
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
  path: ["endDate"]
});

type FormData = z.infer<typeof schema>;

interface AbsenceRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AbsenceRequestForm = ({ onClose, onSuccess }: AbsenceRequestFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('absence_requests')
        .insert({
          analyst_id: user.id,
          start_date: data.startDate,
          end_date: data.endDate,
          reason: data.reason,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de ausencia ha sido enviada para revisión"
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating absence request:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud",
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
          <DialogTitle>Nueva Solicitud de Ausencia</DialogTitle>
          <DialogDescription>
            Completa los datos para enviar tu solicitud de ausencia
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">{errors.startDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Motivo</Label>
            <Textarea
              id="reason"
              placeholder="Describe el motivo de tu ausencia..."
              {...register('reason')}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};