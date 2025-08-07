import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, isSameDay, parseISO, getDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { MapPin, Clock, User } from 'lucide-react';
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

interface Analyst {
  id: string;
  user_id: string;
  name: string;
  role: string;
  start_time: string;
  end_time: string;
  work_days: any;
}
interface TeamCalendarProps {
  className?: string;
}
export const TeamCalendar = ({
  className
}: TeamCalendarProps) => {
  const {
    user,
    userProfile
  } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>([]);
  const [analysts, setAnalysts] = useState<Analyst[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate colors for analysts
  const analystColors = ['hsl(var(--primary))', 'hsl(220, 70%, 50%)', 'hsl(270, 70%, 50%)', 'hsl(120, 70%, 45%)', 'hsl(30, 70%, 50%)', 'hsl(300, 70%, 50%)', 'hsl(200, 70%, 50%)', 'hsl(340, 70%, 50%)'];
  const getAnalystColor = (analystId: string, index: number) => {
    return analystColors[index % analystColors.length];
  };
  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch absence requests
      const {
        data: absenceData,
        error: absenceError
      } = await supabase.from('absence_requests').select('*, analyst_profile:profiles!absence_requests_analyst_id_fkey(name)').eq('status', 'approved').order('start_date', {
        ascending: true
      });
      if (absenceError) throw absenceError;
      setAbsenceRequests(absenceData || []);

      // Fetch all analysts
      const {
        data: analystData,
        error: analystError
      } = await supabase.from('profiles').select('*').order('name', { ascending: true });
      if (analystError) throw analystError;
      setAnalysts(analystData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [user]);
  const getAbsencesForDate = (date: Date) => {
    return absenceRequests.filter(request => {
      const startDate = new Date(request.start_date + 'T00:00:00');
      const endDate = new Date(request.end_date + 'T23:59:59');
      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      return checkDate >= new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) && checkDate <= new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
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

  const getWorkingAnalysts = (date: Date) => {
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const dayName = dayNames[getDay(date)];
    const absentsOnDate = getAbsencesForDate(date);
    const absentAnalystIds = absentsOnDate.map(absence => absence.analyst_id);

    return analysts.filter(analyst => {
      // Check if analyst is not absent on this date
      if (absentAnalystIds.includes(analyst.user_id)) return false;
      
      // Check if analyst is scheduled to work on this day
      const workDay = analyst.work_days && typeof analyst.work_days === 'object' ? analyst.work_days[dayName] : null;
      return workDay && workDay.active === true;
    });
  };

  const formatWorkMode = (mode: string) => {
    return mode === 'home' ? 'Work from Home' : 'Office';
  };

  const getWorkModeIcon = (mode: string) => {
    return mode === 'home' ? '🏠' : '🏢';
  };
  const modifiers = {
    hasAbsence: (date: Date) => getAbsencesForDate(date).length > 0
  };
  const modifiersStyles = {
    hasAbsence: {
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      color: 'hsl(var(--primary))',
      fontWeight: '600'
    }
  };
  if (loading) {
    return <Card className={className}>
        <CardHeader>
          <CardTitle>Team Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-sm text-muted-foreground">Loading calendar...</div>
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className={className}>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={date => date && setSelectedDate(date)} modifiers={modifiers} modifiersStyles={modifiersStyles} className={cn("p-4 pointer-events-auto border rounded-md scale-110")} />
          </div>

          {/* Analysts Working Today */}
          <div className="space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Working Today
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>
            
            {getWorkingAnalysts(selectedDate).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No analysts scheduled to work today
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getWorkingAnalysts(selectedDate).map((analyst, index) => {
                  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                  const dayName = dayNames[getDay(selectedDate)];
                  const workDay = analyst.work_days && typeof analyst.work_days === 'object' ? analyst.work_days[dayName] : null;
                  const color = getAnalystColor(analyst.user_id, index);
                  
                  return (
                    <div key={analyst.id} className="p-3 rounded-lg border bg-card/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm" style={{ color }}>
                          {analyst.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {analyst.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{analyst.start_time?.substring(0, 5)} - {analyst.end_time?.substring(0, 5)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span className="text-muted-foreground">
                          {getWorkModeIcon(workDay?.mode || 'office')} {formatWorkMode(workDay?.mode || 'office')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Absences Today */}
          <div className="space-y-3">
            <h3 className="font-medium">
              Absences Today
            </h3>
            
            {getSelectedDateAbsences().length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No absences scheduled for this day
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getSelectedDateAbsences().map((request, index) => {
                  const displayInfo = formatAbsenceDisplay(request);
                  const color = getAnalystColor(request.analyst_id, index);
                  return (
                    <div key={request.id} className="p-2 rounded-md border-l-4 bg-muted/30" style={{
                      borderLeftColor: color
                    }}>
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
        {absenceRequests.length > 0}
      </CardContent>
    </Card>;
};