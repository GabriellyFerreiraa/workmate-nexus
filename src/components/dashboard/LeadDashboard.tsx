import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, CheckCircle, AlertCircle, Plus, Clock, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TaskAssignmentForm } from '@/components/forms/TaskAssignmentForm';
import { AbsenceApprovalModal } from '@/components/modals/AbsenceApprovalModal';
import { TeamCalendar } from '@/components/calendar/TeamCalendar';
import { ShiftEditForm } from '@/components/forms/ShiftEditForm';

export const LeadDashboard = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [approvedAbsences, setApprovedAbsences] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAnalyst, setSelectedAnalyst] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch pending absence requests
      const { data: requests } = await supabase
        .from('absence_requests')
        .select('*, analyst_profile:profiles!absence_requests_analyst_id_fkey(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch approved absences for today
      const today = new Date().toISOString().split('T')[0];
      const { data: absences } = await supabase
        .from('absence_requests')
        .select('*')
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      // Fetch all tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*, assigned_to_profile:profiles!tasks_assigned_to_fkey(name)')
        .order('created_at', { ascending: false });

      // Fetch all analysts
      const { data: allAnalysts } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'analyst');

      setPendingRequests(requests || []);
      setApprovedAbsences(absences || []);
      setAllTasks(tasks || []);
      setAnalysts(allAnalysts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Could not load data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string, comment = '') => {
    try {
      const { error } = await supabase
        .from('absence_requests')
        .update({ 
          status: 'approved',
          lead_comment: comment,
          approved_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request approved",
        description: "The absence request has been approved"
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Could not approve request",
        variant: "destructive"
      });
    }
  };

  const rejectRequest = async (requestId: string, comment: string) => {
    try {
      const { error } = await supabase
        .from('absence_requests')
        .update({ 
          status: 'rejected',
          lead_comment: comment
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Request rejected",
        description: "The absence request has been rejected"
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Could not reject request",
        variant: "destructive"
      });
    }
  };

  const deleteAnalyst = async (analystId: string, analystName: string) => {
    if (!confirm(`Are you sure you want to delete ${analystName}? This will permanently remove all their data including tasks and absence requests.`)) {
      return;
    }

    try {
      // Delete all related data first
      await supabase
        .from('tasks')
        .delete()
        .eq('assigned_to', analystId);

      await supabase
        .from('absence_requests')
        .delete()
        .eq('analyst_id', analystId);

      // Finally delete the profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', analystId);

      if (error) throw error;

      toast({
        title: "Analyst deleted",
        description: `${analystName} has been successfully removed from the system`
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting analyst:', error);
      toast({
        title: "Error",
        description: "Could not delete analyst",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getTaskStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      in_progress: { label: 'In progress', variant: 'default' as const },
      completed: { label: 'Completed', variant: 'success' as const }
    };
    return statusConfig[status] || { label: status, variant: 'outline' as const };
  };

  const isAnalystOnline = (analyst: any) => {
    const now = new Date();
    const today = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const todaySchedule = analyst.work_days?.[today];
    
    // Check if analyst is scheduled to work today
    if (!todaySchedule?.active) return false;
    
    // Check if analyst has an approved absence for today
    const hasAbsenceToday = approvedAbsences.some(absence => 
      absence.analyst_id === analyst.user_id
    );
    if (hasAbsenceToday) return false;
    
    // Check if current time is within work hours
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    const startTime = analyst.start_time || '09:00';
    const endTime = analyst.end_time || '18:00';
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const getOnlineAnalysts = () => {
    return analysts.filter(analyst => isAnalystOnline(analyst));
  };

  const onlineAnalysts = getOnlineAnalysts();

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allTasks.filter(task => task.status !== 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Analysts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineAnalysts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analysts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Absence Requests</CardTitle>
              <CardDescription>
                Requests that require your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No pending requests
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {request.analyst_profile?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.start_date), 'PPP')} - {' '}
                            {format(new Date(request.end_date), 'PPP')}
                          </p>
                          <p className="text-sm mt-1">{request.reason}</p>
                        </div>
                        <Badge variant="secondary">Pending</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Task Management</CardTitle>
                <CardDescription>
                  Assign and supervise team tasks
                </CardDescription>
              </div>
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Assign Task
              </Button>
            </CardHeader>
            <CardContent>
              {allTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No assigned tasks
                </p>
              ) : (
                <div className="space-y-4">
                  {allTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg bg-background">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {task.assigned_to_profile?.name}
                          </p>
                          {task.description && (
                            <p className="text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                        <Badge {...getTaskStatusBadge(task.status)}>
                          {getTaskStatusBadge(task.status).label}
                        </Badge>
                      </div>
                      {task.due_date && (
                        <p className="text-xs text-muted-foreground">
                          Due: {format(new Date(task.due_date), 'PPp')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Status</CardTitle>
              <CardDescription>
                General view of the analyst team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analysts.map((analyst) => {
                  const isOnline = onlineAnalysts.includes(analyst);
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                  const todaySchedule = analyst.work_days?.[today];
                  
                   return (
                     <div key={analyst.id} className={`p-4 border rounded-lg ${!isOnline ? 'opacity-50' : ''}`}>
                       <div className="flex items-center gap-3 mb-3">
                         <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                         <div>
                           <p className="font-medium">{analyst.name}</p>
                           <p className="text-xs text-muted-foreground">
                             {isOnline ? 'Online' : 'Offline'}
                           </p>
                         </div>
                       </div>
                       {todaySchedule?.active && (
                         <div className="text-sm text-muted-foreground mb-3">
                           <p>Schedule: {analyst.start_time} - {analyst.end_time}</p>
                           <p>Mode: {todaySchedule.mode === 'home' ? 'Home' : 'Office'}</p>
                         </div>
                       )}
                       {!todaySchedule?.active && (
                         <div className="text-sm text-muted-foreground mb-3">
                           <p>Not scheduled today</p>
                         </div>
                       )}
                        <div className="space-y-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAnalyst(analyst)}
                            className="w-full"
                          >
                            Edit Schedule
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAnalyst(analyst.user_id, analyst.name)}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Analyst
                          </Button>
                        </div>
                     </div>
                   );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      {/* Team Calendar - Always Visible */}
      <TeamCalendar />

      {/* Task Assignment Form Modal */}
      {showTaskForm && (
        <TaskAssignmentForm
          analysts={analysts}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => {
            setShowTaskForm(false);
            fetchData();
          }}
        />
      )}

      {/* Absence Approval Modal */}
      {selectedRequest && (
        <AbsenceApprovalModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={(comment) => {
            approveRequest(selectedRequest.id, comment);
            setSelectedRequest(null);
          }}
          onReject={(comment) => {
            rejectRequest(selectedRequest.id, comment);
            setSelectedRequest(null);
          }}
        />
      )}

      {/* Shift Edit Modal */}
      {selectedAnalyst && (
        <ShiftEditForm
          analyst={selectedAnalyst}
          onClose={() => setSelectedAnalyst(null)}
          onSuccess={() => {
            setSelectedAnalyst(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};