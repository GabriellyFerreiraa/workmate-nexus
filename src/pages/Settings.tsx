import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, User, Bell, Shield, Moon, Sun, Monitor } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
const Settings = () => {
  const {
    userProfile,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    theme,
    setTheme
  } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    area: userProfile?.area || ''
  });

  // Notification settings (mock data for demo)
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: false,
    taskReminders: true,
    absenceUpdates: true
  });
  const handleProfileUpdate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        name: profileData.name,
        area: profileData.area
      }).eq('user_id', user.id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const getThemeIcon = () => {
    switch (theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6 bg-slate-900">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Profile Settings */}
        <Card className="bg-slate-900">
          <CardHeader className="bg-slate-900">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 bg-slate-900">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile?.avatar_url} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600">
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">
                  Upload a new profile picture
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={profileData.name} onChange={e => setProfileData(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder="Enter your name" className="bg-slate-700" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Work Area</Label>
                <Input id="area" value={profileData.area} onChange={e => setProfileData(prev => ({
                ...prev,
                area: e.target.value
              }))} placeholder="Enter your work area" className="bg-slate-700" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={userProfile?.role || ''} disabled className="bg-muted capitalize" />
                <p className="text-xs text-muted-foreground">
                  Role is managed by administrators
                </p>
              </div>
            </div>

            <Button onClick={handleProfileUpdate} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-slate-900">
          <CardHeader className="bg-slate-900">
            <CardTitle className="flex items-center gap-2">
              {getThemeIcon()}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-slate-900">
          <CardHeader className="bg-slate-900">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch checked={notifications.email} onCheckedChange={checked => setNotifications(prev => ({
              ...prev,
              email: checked
            }))} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Desktop Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show browser notifications
                </p>
              </div>
              <Switch checked={notifications.desktop} onCheckedChange={checked => setNotifications(prev => ({
              ...prev,
              desktop: checked
            }))} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Task Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming task deadlines
                </p>
              </div>
              <Switch checked={notifications.taskReminders} onCheckedChange={checked => setNotifications(prev => ({
              ...prev,
              taskReminders: checked
            }))} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Absence Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about absence request status
                </p>
              </div>
              <Switch checked={notifications.absenceUpdates} onCheckedChange={checked => setNotifications(prev => ({
              ...prev,
              absenceUpdates: checked
            }))} />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-slate-900">
          <CardHeader className="bg-slate-900">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
               <Button variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600">
                Change Password
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline" size="sm" className="bg-slate-700 hover:bg-slate-600">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>;
};
export default Settings;