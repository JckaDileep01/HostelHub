'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2, Lock, Mail, User, Phone, ArrowLeft } from 'lucide-react';
import type { UserRole } from '@/lib/types';

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'hostel_owner', label: 'Hostel Owner', description: 'Manage hostels, rooms, billing, and staff' },
  { value: 'caretaker', label: 'Caretaker / Warden', description: 'Mobile interface for daily operations' },
];

export default function SignupClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('hostel_owner');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          phone,
        },
      },
    });

    if (error) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (data.user) {
      if (!data.session) {
        toast({
          title: 'Confirm your email',
          description: 'Check your inbox to verify your account, then sign in.',
        });
        setLoading(false);
        router.push('/login');
        return;
      }

      if (role === 'hostel_owner') {
        const { error: workspaceError } = await supabase.rpc('create_owner_workspace', {
          p_name: `${fullName}'s Hostel`,
        });
        if (workspaceError) {
          toast({
            title: 'Account created',
            description: 'Your account is ready. Workspace setup can be completed from the dashboard.',
          });
        }
      }

      toast({
        title: 'Account created!',
        description: 'Welcome to HostelHub. Setting up your workspace...',
      });
      router.push('/app/dashboard');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 py-8 transition-colors">
      <div className="w-full max-w-md space-y-4">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">HostelHub</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Create your account</p>
          </div>
        </div>

        {/* Sign Up Card */}
        <Card className="shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Get Started</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Create your account to start managing hostels
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-800 dark:text-slate-200 font-medium">I am a...</Label>
                <div className="grid grid-cols-2 gap-3" role="group" aria-label="Select your role">
                  {ROLES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      id={`role-${r.value}`}
                      onClick={() => setRole(r.value)}
                      aria-pressed={role === r.value}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${
                        role === r.value
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 dark:border-indigo-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950'
                      }`}
                    >
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{r.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-slate-800 dark:text-slate-200 font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-slate-800 dark:text-slate-200 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-slate-800 dark:text-slate-200 font-medium">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-slate-800 dark:text-slate-200 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                id="signup-submit"
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-colors"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
