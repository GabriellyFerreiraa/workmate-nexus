import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Home, Building, Users, CheckCircle, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { AbsenceRequestForm } from '@/components/forms/AbsenceRequestForm';
import { SelfAssignTaskForm } from '@/components/forms/SelfAssignTaskForm';
import { TeamCalendar } from '@/components/calendar/TeamCalendar';
import { UserAvatar } from '@/components/UserAvatar';
export const AnalystDashboard = () => {
  const {
    userProfile,
    user
  } = useAuth();
  const [absenceRequests, setAbsenceRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [onlineAnalysts, setOnlineAnalysts] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSelfTaskForm, setShowSelfTaskForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const fetchData = async () => {
    if (!user) return;
    try {
      // Fetch absence requests
      const {
        data: absences
      } = await supabase.from('absence_requests').select('*').eq('analyst_id', user.id).order('created_at', {
        ascending: false
      });

      // Fetch tasks
      const {
        data: userTasks
      } = await supabase.from('tasks').select('*, assigned_by_profile:profiles!tasks_assigned_by_fkey(name, avatar_url)').eq('assigned_to', user.id).order('created_at', {
        ascending: false
      });

      // Fetch online analysts (simplified for now)
      const {
        data: analysts
      } = await supabase.from('profiles').select('*').neq('user_id', user.id);
      setAbsenceRequests(absences || []);
      setTasks(userTasks || []);
      setOnlineAnalysts(analysts || []);
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
  const markTaskCompleted = async (taskId: string) => {
    try {
      const {
        error
      } = await supabase.from('tasks').update({
        status: 'completed',
        completed_at: new Date().toISOString()
      }).eq('id', taskId);
      if (error) throw error;
      toast({
        title: "Task completed",
        description: "The task has been marked as completed"
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Could not update task",
        variant: "destructive"
      });
    }
  };
  const deleteTask = async (taskId: string) => {
    try {
      const {
        error
      } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      toast({
        title: "Task removed",
        description: "The task notification has been removed"
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Could not remove task",
        variant: "destructive"
      });
    }
  };
  const deleteAbsenceRequest = async (requestId: string) => {
    try {
      const {
        error
      } = await supabase.from('absence_requests').delete().eq('id', requestId);
      if (error) throw error;
      toast({
        title: "Request removed",
        description: "The absence request notification has been removed"
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting absence request:', error);
      toast({
        title: "Error",
        description: "Could not remove request",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    fetchData();
  }, [user]);
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'Pending',
        variant: 'secondary' as const
      },
      approved: {
        label: 'Approved',
        variant: 'success' as const
      },
      rejected: {
        label: 'Rejected',
        variant: 'destructive' as const
      },
      cancel_requested: {
        label: 'Cancellation requested',
        variant: 'secondary' as const
      },
      cancelled: {
        label: 'Cancelled',
        variant: 'outline' as const
      }
    };
    return statusConfig[status] || {
      label: status,
      variant: 'outline' as const
    };
  };
  const getTaskStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        label: 'Pending',
        variant: 'secondary' as const
      },
      in_progress: {
        label: 'In progress',
        variant: 'default' as const
      },
      completed: {
        label: 'Completed',
        variant: 'success' as const
      }
    };
    return statusConfig[status] || {
      label: status,
      variant: 'outline' as const
    };
  };
  const getCurrentShiftInfo = () => {
    if (!userProfile?.work_days) return null;
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'short'
    }).toLowerCase();
    const todaySchedule = userProfile.work_days[today];
    if (!todaySchedule?.active) {
      return {
        isWorkDay: false,
        mode: null,
        shift: null
      };
    }
    const formatTime = (time: string) => time.slice(0, 5); // Remove seconds

    return {
      isWorkDay: true,
      mode: todaySchedule.mode,
      shift: `${formatTime(userProfile.start_time)} - ${formatTime(userProfile.end_time)}`
    };
  };
  const shiftInfo = getCurrentShiftInfo();
  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }
  return <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Shift</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {shiftInfo?.isWorkDay ? shiftInfo.shift : 'Day off'}
            </div>
            {shiftInfo?.isWorkDay && <div className="flex items-center mt-2">
                {shiftInfo.mode === 'home' ? <Home className="h-4 w-4 mr-1" /> : <Building className="h-4 w-4 mr-1" />}
                <span className="text-sm text-muted-foreground capitalize">
                  {shiftInfo.mode === 'home' ? 'Home' : 'Office'}
                </span>
              </div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(task => task.status !== 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {absenceRequests.filter(req => req.status === 'pending').length}
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
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="absences">Absence Requests</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  Tasks assigned to you or self-assigned
                </CardDescription>
              </div>
              <Button onClick={() => setShowSelfTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Self-assign task
              </Button>
            </CardHeader>
            <CardContent>
              {tasks.filter(task => task.status !== 'completed').length === 0 ? <p className="text-center text-muted-foreground py-4">
                    You have no active tasks
                  </p> : <div className="space-y-4">
                    {tasks.filter(task => task.status !== 'completed').map(task => <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-[hsl(var(--panel))]">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.title}</h4>
                            {task.description && <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className="bg-orange-500">
                                  {getTaskStatusBadge(task.status).label}
                                </Badge>
                                {task.assigned_by === task.assigned_to ? (
                                  <Badge variant="outline">Self-assigned</Badge>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Lead-assigned by</span>
                                    <UserAvatar src={task.assigned_by_profile?.avatar_url} name={task.assigned_by_profile?.name} size="xs" />
                                    <span>{task.assigned_by_profile?.name}</span>
                                  </div>
                                )}
                                {task.due_date && (
                                  <span className="text-xs text-muted-foreground">
                                    Due: {format(new Date(task.due_date), 'PPp')}
                                  </span>
                                )}
                              </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {task.status !== 'completed' && <Button size="sm" onClick={() => markTaskCompleted(task.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>}
                            {task.status === 'completed' && <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)} className="bg-[hsl(var(--panel))] hover:bg-[hsl(var(--panel))]">
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>}
                          </div>
                        </div>)}
                  </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="absences" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Absence Requests</CardTitle>
                <CardDescription>
                  Manage your absence requests
                </CardDescription>
              </div>
              <Button onClick={() => setShowRequestForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </CardHeader>
            <CardContent>
              {absenceRequests.filter(req => req.status === 'pending' || req.status === 'cancel_requested').length === 0 ? <p className="text-center text-muted-foreground py-4">No pending absence requests</p> : <div className="space-y-4">
                  {absenceRequests.filter(req => req.status === 'pending' || req.status === 'cancel_requested').map(request => <div key={request.id} className="p-4 border rounded-lg bg-[hsl(var(--panel))]">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {format(new Date(request.start_date), 'PPP')} - {' '}
                              {format(new Date(request.end_date), 'PPP')}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500">
                              {getStatusBadge(request.status).label}
                            </Badge>
                          </div>
                        </div>
                        {request.lead_comment && <div className="mt-3 p-3 bg-muted rounded">
                            <p className="text-sm"><strong>Lead Comment:</strong> {request.lead_comment}</p>
                          </div>}
                      </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Online Team</CardTitle>
              <CardDescription>
                Currently connected analysts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {onlineAnalysts.length === 0 ? <p className="text-center text-muted-foreground py-4">
                  No other analysts connected
                </p> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {onlineAnalysts.map(analyst => <div key={analyst.id} className="p-3 border rounded-lg bg-[hsl(var(--panel))]">
                      <div className="flex items-center gap-3">
                        <UserAvatar src={analyst.avatar_url} name={analyst.name} size="sm" />
                        <div>
                          <p className="font-medium">{analyst.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {analyst.role}
                          </p>
                        </div>
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>Tasks you have completed</CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.filter(task => task.status === 'completed').length === 0 ? <p className="text-center text-muted-foreground py-4">No completed tasks</p> : <div className="space-y-4">
                  {tasks.filter(task => task.status === 'completed').map(task => <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg bg-[hsl(var(--panel))]">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge {...getTaskStatusBadge(task.status)}>
                              {getTaskStatusBadge(task.status).label}
                            </Badge>
                            {task.assigned_by === task.assigned_to ? (
                              <Badge variant="outline">Self-assigned</Badge>
                            ) : (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Lead-assigned by</span>
                                <UserAvatar src={task.assigned_by_profile?.avatar_url} name={task.assigned_by_profile?.name} size="xs" />
                                <span>{task.assigned_by_profile?.name}</span>
                              </div>
                            )}
                            {task.due_date && (
                              <span className="text-xs text-muted-foreground">
                                Due: {format(new Date(task.due_date), 'PPp')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)} className="bg-[hsl(var(--panel))] hover:bg-[hsl(var(--panel))]">
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>)}
                </div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Processed Absence Requests</CardTitle>
              <CardDescription>Approved, rejected or cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              {absenceRequests.filter(req => ['approved', 'rejected', 'cancelled'].includes(req.status)).length === 0 ? <p className="text-center text-muted-foreground py-4">No processed requests</p> : <div className="space-y-4">
                  {absenceRequests.filter(req => ['approved', 'rejected', 'cancelled'].includes(req.status)).map(request => <div key={request.id} className="p-4 border rounded-lg bg-[hsl(var(--panel))] px-[16px] py-[16px] mx-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {format(new Date(request.start_date), 'PPP')} - {' '}
                              {format(new Date(request.end_date), 'PPP')}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge {...getStatusBadge(request.status)}>
                              {getStatusBadge(request.status).label}
                            </Badge>
                            <Button size="sm" variant="outline" onClick={() => deleteAbsenceRequest(request.id)} className="bg-[hsl(var(--panel))] hover:bg-[hsl(var(--panel))]">
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                        {request.lead_comment && <div className="mt-3 p-3 bg-muted rounded">
                            <p className="text-sm">
                              <strong>Lead Comment:</strong> {request.lead_comment}
                            </p>
                          </div>}
                      </div>)}
                </div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team Calendar - Always Visible */}
      <TeamCalendar />

      {/* Absence Request Form Modal */}
      {showRequestForm && <AbsenceRequestForm onClose={() => setShowRequestForm(false)} onSuccess={() => {
      setShowRequestForm(false);
      fetchData();
    }} />}

      {/* Self-Assign Task Form Modal */}
      {showSelfTaskForm && <SelfAssignTaskForm onClose={() => setShowSelfTaskForm(false)} onSuccess={() => {
      setShowSelfTaskForm(false);
      fetchData();
    }} />}
    </div>;
};