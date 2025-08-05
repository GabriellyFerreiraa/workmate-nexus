import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface AbsenceRequest {
  id: string;
  analyst_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  analyst_profile?: {
    name: string;
  };
}

interface TeamCalendarProps {
  className?: string;
}

export const TeamCalendar = ({ className }: TeamCalendarProps) => {
  const { user, userProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate colors for analysts
  const analystColors = [
    'hsl(var(--primary))',
    'hsl(220, 70%, 50%)',
    'hsl(270, 70%, 50%)',
    'hsl(120, 70%, 45%)',
    'hsl(30, 70%, 50%)',
    'hsl(300, 70%, 50%)',
    'hsl(200, 70%, 50%)',
    'hsl(340, 70%, 50%)',
  ];

  const getAnalystColor = (analystId: string, index: number) => {
    return analystColors[index % analystColors.length];
  };

  const fetchAbsenceRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('absence_requests')
        .select('*, analyst_profile:profiles!absence_requests_analyst_id_fkey(name)')
        .eq('status', 'approved')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setAbsenceRequests(data || []);
    } catch (error) {
      console.error('Error fetching absence requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsenceRequests();
  }, [user]);

  const getAbsencesForDate = (date: Date) => {
    return absenceRequests.filter(request => {
      const startDate = parseISO(request.start_date);
      const endDate = parseISO(request.end_date);
      return date >= startDate && date <= endDate;
    });
  };

  const getSelectedDateAbsences = () => {
    return getAbsencesForDate(selectedDate);
  };

  const formatAbsenceDisplay = (request: AbsenceRequest) => {
    const isOwner = request.analyst_id === user?.id;
    const isLead = userProfile?.role === 'lead' || userProfile?.role === 'admin';
    
    if (isOwner || isLead) {
      return {
        title: request.analyst_profile?.name || 'Analyst',
        subtitle: request.reason
      };
    } else {
      return {
        title: request.analyst_profile?.name || 'Analyst',
        subtitle: 'Day OFF'
      };
    }
  };

  const modifiers = {
    hasAbsence: (date: Date) => getAbsencesForDate(date).length > 0
  };

  const modifiersStyles = {
    hasAbsence: {
      position: 'relative' as const,
      '&:after': {
        content: '""',
        position: 'absolute',
        bottom: '2px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        backgroundColor: 'hsl(var(--primary))'
      }
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Team Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-sm text-muted-foreground">Loading calendar...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Team Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              modifiers={modifiers}
              modifiersStyles={modifiersStyles}
              className={cn("p-3 pointer-events-auto border rounded-md")}
            />
          </div>

          {/* Selected Date Details */}
          <div className="space-y-3">
            <h3 className="font-medium">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            
            {getSelectedDateAbsences().length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No absences scheduled for this day
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Absences ({getSelectedDateAbsences().length})
                </p>
                {getSelectedDateAbsences().map((request, index) => {
                  const displayInfo = formatAbsenceDisplay(request);
                  const color = getAnalystColor(request.analyst_id, index);
                  
                  return (
                    <div
                      key={request.id}
                      className="p-2 rounded-md border-l-4 bg-muted/30"
                      style={{ borderLeftColor: color }}
                    >
                      <p className="text-sm font-medium">
                        {displayInfo.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {displayInfo.subtitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(request.start_date), 'MMM d')} - {format(parseISO(request.end_date), 'MMM d')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend for analyst colors */}
        {absenceRequests.length > 0 && (
          <div className="border-t pt-3">
            <p className="text-xs font-medium mb-2">Analyst Colors</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(absenceRequests.map(r => r.analyst_id)))
                .slice(0, 8)
                .map((analystId, index) => {
                  const request = absenceRequests.find(r => r.analyst_id === analystId);
                  const color = getAnalystColor(analystId, index);
                  
                  return (
                    <div key={analystId} className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs">
                        {request?.analyst_profile?.name || 'Analyst'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};