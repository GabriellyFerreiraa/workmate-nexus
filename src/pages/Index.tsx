import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Clock, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="relative">
          <div className="container mx-auto px-4 py-20">
            <div className="text-center max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary rounded-full mb-4">
                  <Shield className="h-8 w-8 text-primary-foreground" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  DeskControl
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Sistema integral de gestión para analistas de Service Desk. 
                  Gestiona ausencias, asigna tareas y supervisa tu equipo de manera eficiente.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth">
                    Comenzar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/auth">
                    Iniciar Sesión
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades Principales</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Una solución completa para la gestión de equipos de Service Desk con herramientas 
            especializadas para analistas y leads.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestión de Ausencias</CardTitle>
              <CardDescription>
                Solicita y aprueba ausencias de manera eficiente con un sistema de comentarios y seguimiento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Asignación de Tareas</CardTitle>
              <CardDescription>
                Asigna y supervisa tareas del equipo con prioridades, fechas límite y seguimiento de progreso.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Control de Turnos</CardTitle>
              <CardDescription>
                Gestiona horarios, modalidades de trabajo (oficina/casa) y visualiza el estado del equipo.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Roles Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Dashboards Especializados</h2>
            <p className="text-muted-foreground">
              Diferentes interfaces optimizadas para cada rol en tu equipo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-4">Dashboard de Analista</CardTitle>
                <CardDescription>
                  Herramientas para gestionar tu trabajo diario de manera eficiente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Visualizar solicitudes de ausencia</li>
                  <li>• Gestionar tareas asignadas</li>
                  <li>• Ver turno actual y modalidad</li>
                  <li>• Estado del equipo en tiempo real</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-8">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-4">Dashboard de Lead</CardTitle>
                <CardDescription>
                  Control total para supervisar y gestionar tu equipo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Aprobar/rechazar ausencias</li>
                  <li>• Asignar tareas a analistas</li>
                  <li>• Gestionar horarios del equipo</li>
                  <li>• Calendario de ausencias</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Listo para optimizar tu Service Desk?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comienza a usar DeskControl hoy y transforma la gestión de tu equipo con herramientas 
            profesionales y una interfaz intuitiva.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/auth">
              Comenzar Ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
