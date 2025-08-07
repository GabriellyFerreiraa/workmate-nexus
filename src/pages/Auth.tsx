import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';
import { User, Lock, Mail, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['analyst', 'lead'])
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'analyst'
    }
  });

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(data.email, data.password);
      if (!error) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSignup = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        name: data.name,
        role: data.role
      });
      if (!error) {
        toast({
          title: "Cuenta creada",
          description: "Check your email to confirm your account before logging in"
        });
      }
    } catch (error) {
      console.error('Error during signup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 landing-theme relative">
      <div className="absolute top-20 left-20 w-24 h-24 bg-accent/20 rotate-45 rounded-lg"></div>
      <div className="absolute bottom-32 right-24 w-32 h-32 bg-primary/20 rotate-12 rounded-lg"></div>
      
      <Card className="w-full max-w-md cognizant-card backdrop-blur-md">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/30">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-semibold text-foreground">DeskControl</CardTitle>
          <CardDescription className="text-foreground/70 text-base mt-2">
            Management system for Service Desk analysts
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/20 border border-primary/20">
              <TabsTrigger value="login" className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-foreground/70 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-6 mt-8">
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="login-email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 cognizant-input h-12 text-foreground placeholder:text-foreground/50"
                      {...loginForm.register('email')}
                    />
                  </div>
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="login-password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10 cognizant-input h-12 text-foreground placeholder:text-foreground/50"
                      {...loginForm.register('password')}
                    />
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-6 mt-8">
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="signup-name" className="text-foreground font-medium">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="signup-name"
                      placeholder="Your full name"
                      className="pl-10 cognizant-input h-12 text-foreground placeholder:text-foreground/50"
                      {...signupForm.register('name')}
                    />
                  </div>
                  {signupForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      className="pl-10 cognizant-input h-12 text-foreground placeholder:text-foreground/50"
                      {...signupForm.register('email')}
                    />
                  </div>
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••"
                      className="pl-10 cognizant-input h-12 text-foreground placeholder:text-foreground/50"
                      {...signupForm.register('password')}
                    />
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="signup-role" className="text-foreground font-medium">Role</Label>
                  <Select onValueChange={(value) => signupForm.setValue('role', value as 'analyst' | 'lead')}>
                    <SelectTrigger className="cognizant-input h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupForm.formState.errors.role && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.role.message}
                    </p>
                  )}
                </div>
                
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;