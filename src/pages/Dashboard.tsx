import { useAuth } from '@/hooks/useAuth';
import { AnalystDashboard } from '@/components/dashboard/AnalystDashboard';
import { LeadDashboard } from '@/components/dashboard/LeadDashboard';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { userProfile, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-muted-foreground mb-4">
            Please contact the administrator to set up your profile.
          </p>
          <Button onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">DeskControl</h1>
            <div className="hidden md:block text-sm text-muted-foreground">
              {userProfile.role === 'lead' ? 'Lead Dashboard' : 'Analyst Dashboard'}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userProfile.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userProfile.role}
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {userProfile.role === 'lead' ? (
          <LeadDashboard />
        ) : (
          <AnalystDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;