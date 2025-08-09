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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
const absenceReasons = ['Service Desk Day', 'Examen Leave', 'Recognition (ScoreCard)', 'Vacation Leave', 'Moving Leave', 'Sick Leave', 'Marriage Leave', 'Unpaid Leave'] as const;
const schema = z.object({
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.enum(absenceReasons).refine(val => absenceReasons.includes(val), {
    message: 'Please select a valid reason'
  }),
  details: z.string().min(10, 'Details must be at least 10 characters')
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after or equal to start date",
  path: ["endDate"]
});
type FormData = z.infer<typeof schema>;
interface AbsenceRequestFormProps {
  onClose: () => void;
  onSuccess: () => void;
}
export const AbsenceRequestForm = ({
  onClose,
  onSuccess
}: AbsenceRequestFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    user
  } = useAuth();
  const {
    register,
    handleSubmit,
    control,
    formState: {
      errors
    }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });
  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.from('absence_requests').insert({
        analyst_id: user.id,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: `${data.reason} - ${data.details}`,
        status: 'pending'
      });
      if (error) throw error;
      toast({
        title: "Request submitted",
        description: "Your absence request has been submitted for review"
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating absence request:', error);
      toast({
        title: "Error",
        description: "Could not submit request",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900">
        <DialogHeader>
          <DialogTitle>New Absence Request</DialogTitle>
          <DialogDescription>
            Complete the form to submit your absence request
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Controller name="reason" control={control} render={({
            field
          }) => <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select absence reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {absenceReasons.map(reason => <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>)}
                  </SelectContent>
                </Select>} />
            {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="details">Details</Label>
            <Textarea id="details" placeholder="Provide additional details about your absence request..." {...register('details')} />
            {errors.details && <p className="text-sm text-destructive">{errors.details.message}</p>}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
};