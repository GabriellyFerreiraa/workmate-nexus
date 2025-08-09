import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
const shiftFormSchema = z.object({
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  lunch_start: z.string().min(1, 'Lunch start time is required'),
  lunch_end: z.string().min(1, 'Lunch end time is required'),
  break1_start: z.string().min(1, 'Break 1 start time is required'),
  break1_end: z.string().min(1, 'Break 1 end time is required'),
  break2_start: z.string().min(1, 'Break 2 start time is required'),
  break2_end: z.string().min(1, 'Break 2 end time is required'),
  work_days: z.object({
    mon: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    tue: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    wed: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    thu: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    fri: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    sat: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    }),
    sun: z.object({
      active: z.boolean(),
      mode: z.enum(['home', 'office'])
    })
  })
});
type ShiftFormData = z.infer<typeof shiftFormSchema>;
interface ShiftEditFormProps {
  analyst: any;
  onClose: () => void;
  onSuccess: () => void;
}
export const ShiftEditForm = ({
  analyst,
  onClose,
  onSuccess
}: ShiftEditFormProps) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      start_time: analyst.start_time || '09:00',
      end_time: analyst.end_time || '18:00',
      lunch_start: analyst.lunch_start || '12:00',
      lunch_end: analyst.lunch_end || '13:00',
      break1_start: analyst.break1_start || '10:00',
      break1_end: analyst.break1_end || '10:15',
      break2_start: analyst.break2_start || '15:00',
      break2_end: analyst.break2_end || '15:15',
      work_days: analyst.work_days || {
        mon: {
          active: true,
          mode: 'office'
        },
        tue: {
          active: true,
          mode: 'office'
        },
        wed: {
          active: true,
          mode: 'office'
        },
        thu: {
          active: true,
          mode: 'office'
        },
        fri: {
          active: true,
          mode: 'office'
        },
        sat: {
          active: false,
          mode: 'office'
        },
        sun: {
          active: false,
          mode: 'office'
        }
      }
    }
  });
  const onSubmit = async (data: ShiftFormData) => {
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        start_time: data.start_time,
        end_time: data.end_time,
        lunch_start: data.lunch_start,
        lunch_end: data.lunch_end,
        break1_start: data.break1_start,
        break1_end: data.break1_end,
        break2_start: data.break2_start,
        break2_end: data.break2_end,
        work_days: data.work_days
      }).eq('id', analyst.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Shift schedule updated successfully"
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Error",
        description: "Could not update shift schedule",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const days = [{
    key: 'mon',
    label: 'Monday'
  }, {
    key: 'tue',
    label: 'Tuesday'
  }, {
    key: 'wed',
    label: 'Wednesday'
  }, {
    key: 'thu',
    label: 'Thursday'
  }, {
    key: 'fri',
    label: 'Friday'
  }, {
    key: 'sat',
    label: 'Saturday'
  }, {
    key: 'sun',
    label: 'Sunday'
  }];
  return <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900">
        <DialogHeader>
          <DialogTitle>Edit Shift Schedule - {analyst.name}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Work Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Hours</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="start_time" render={({
                field
              }) => <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="bg-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="end_time" render={({
                field
              }) => <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" className="bg-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </CardContent>
            </Card>

            {/* Lunch Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lunch Break</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="lunch_start" render={({
                field
              }) => <FormItem>
                      <FormLabel>Lunch Start</FormLabel>
                      <FormControl>
                        <Input type="time" className="bg-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />

                <FormField control={form.control} name="lunch_end" render={({
                field
              }) => <FormItem>
                      <FormLabel>Lunch End</FormLabel>
                      <FormControl>
                        <Input type="time" className="bg-slate-700" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>} />
              </CardContent>
            </Card>

            {/* Break Times */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Break Times</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="break1_start" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Break 1 Start</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="break1_end" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Break 1 End</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="break2_start" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Break 2 Start</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="break2_end" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Break 2 End</FormLabel>
                        <FormControl>
                          <Input type="time" className="bg-slate-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>
              </CardContent>
            </Card>

            {/* Work Days */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Work Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {days.map(day => <div key={day.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FormField control={form.control} name={`work_days.${day.key}.active` as any} render={({
                    field
                  }) => <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <Label className="min-w-[80px]">{day.label}</Label>
                          </FormItem>} />
                    </div>

                    <FormField control={form.control} name={`work_days.${day.key}.mode` as any} render={({
                  field
                }) => <FormItem>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange} disabled={!form.watch(`work_days.${day.key}.active` as any)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="office">Office</SelectItem>
                                <SelectItem value="home">Home</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>} />
                  </div>)}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>;
};