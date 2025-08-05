import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, CheckCircle, AlertCircle, Plus, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TaskAssignmentForm } from '@/components/forms/TaskAssignmentForm';
import { AbsenceApprovalModal } from '@/components/modals/AbsenceApprovalModal';

export const LeadDashboard = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [analysts, setAnalysts] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
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
      setAllTasks(tasks || []);
      setAnalysts(allAnalysts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
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
        title: "Solicitud aprobada",
        description: "La solicitud de ausencia ha sido aprobada"
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "No se pudo aprobar la solicitud",
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
        title: "Solicitud rechazada",
        description: "La solicitud de ausencia ha sido rechazada"
      });

      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "No se pudo rechazar la solicitud",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getTaskStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', variant: 'secondary' as const },
      in_progress: { label: 'En progreso', variant: 'default' as const },
      completed: { label: 'Completada', variant: 'default' as const }
    };
    return statusConfig[status] || { label: status, variant: 'outline' as const };
  };

  const getOnlineAnalysts = () => {
    // Simplified logic for demo - in real app would check actual schedule and time
    return analysts.filter(analyst => {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      return analyst.work_days?.[today]?.active;
    });
  };

  const onlineAnalysts = getOnlineAnalysts();

  if (loading) {
    return <div className="p-6">Cargando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tareas Activas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Analistas Online</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineAnalysts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analistas</CardTitle>
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
          <TabsTrigger value="requests">Solicitudes Pendientes</TabsTrigger>
          <TabsTrigger value="tasks">Gestión de Tareas</TabsTrigger>
          <TabsTrigger value="team">Equipo</TabsTrigger>
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de Ausencia Pendientes</CardTitle>
              <CardDescription>
                Solicitudes que requieren tu aprobación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay solicitudes pendientes
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
                            {format(new Date(request.start_date), 'PPP', { locale: es })} - {' '}
                            {format(new Date(request.end_date), 'PPP', { locale: es })}
                          </p>
                          <p className="text-sm mt-1">{request.reason}</p>
                        </div>
                        <Badge variant="secondary">Pendiente</Badge>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Revisar
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
                <CardTitle>Gestión de Tareas</CardTitle>
                <CardDescription>
                  Asigna y supervisa tareas del equipo
                </CardDescription>
              </div>
              <Button onClick={() => setShowTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Asignar Tarea
              </Button>
            </CardHeader>
            <CardContent>
              {allTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No hay tareas asignadas
                </p>
              ) : (
                <div className="space-y-4">
                  {allTasks.map((task) => (
                    <div key={task.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Asignado a: {task.assigned_to_profile?.name}
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
                          Vence: {format(new Date(task.due_date), 'PPp', { locale: es })}
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
              <CardTitle>Estado del Equipo</CardTitle>
              <CardDescription>
                Vista general del equipo de analistas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {analysts.map((analyst) => {
                  const isOnline = onlineAnalysts.includes(analyst);
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
                  const todaySchedule = analyst.work_days?.[today];
                  
                  return (
                    <div key={analyst.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <div>
                          <p className="font-medium">{analyst.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isOnline ? 'En línea' : 'Desconectado'}
                          </p>
                        </div>
                      </div>
                      {todaySchedule?.active && (
                        <div className="text-sm text-muted-foreground">
                          <p>Horario: {analyst.start_time} - {analyst.end_time}</p>
                          <p>Modalidad: {todaySchedule.mode === 'home' ? 'Casa' : 'Oficina'}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Ausencias</CardTitle>
              <CardDescription>
                Vista de ausencias aprobadas del equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Calendario en desarrollo - próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </div>
  );
};