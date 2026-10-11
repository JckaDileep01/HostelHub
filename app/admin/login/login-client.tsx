'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldAlert,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  Globe,
  Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function SuperAdminLoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Verify the signed-in user actually has super_admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError || !profileData) {
      await supabase.auth.signOut();
      toast({
        title: 'Access denied',
        description: 'Unable to verify your account. Please contact support.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    if (profileData.role !== 'super_admin') {
      await supabase.auth.signOut();
      toast({
        title: 'Access denied',
        description:
          'This portal is restricted to Super Admins only. Please use the regular login page.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: '✅ Welcome, Super Admin!',
      description: 'Redirecting to the Command Center…',
    });
    setLoading(false);
    router.push('/admin/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-700/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-3xl" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-md space-y-5 z-10">
        {/* Back Link */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Regular Login
          </Link>
        </div>

        {/* Brand Header */}
        <div className="flex items-center justify-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-indigo-700/40 ring-1 ring-white/10">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            {/* Live pulse dot */}
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">HostelHub</h1>
              <Badge className="text-[10px] px-1.5 py-0 h-4 font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                SuperAdmin
              </Badge>
            </div>
            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-0.5">
              <Globe className="h-3.5 w-3.5 text-emerald-400" />
              Command Center Portal
            </p>
          </div>
        </div>

        {/* Secure Access Banner */}
        <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg py-2 px-3">
          <Database className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span>Restricted access — Super Admin credentials required</span>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl text-slate-100">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-bold text-white">Super Admin Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Access the global platform command center
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="superadmin-email"
                  className="text-slate-300 font-medium text-sm"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="superadmin-email"
                    type="email"
                    placeholder="superadmin@hostelhub.app"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="superadmin-password"
                  className="text-slate-300 font-medium text-sm"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="superadmin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                id="superadmin-login-submit"
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-700/30 transition-all"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Verifying Access…' : 'Sign In to Command Center'}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Not a Super Admin?{' '}
                <Link
                  href="/login"
                  className="text-indigo-400 font-medium hover:text-indigo-300 hover:underline"
                >
                  Use regular login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Security Notice */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 font-medium text-slate-300">
            <Lock className="w-3.5 h-3.5 text-indigo-400" /> Secure Multi-Tenant Authentication
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Access to this portal is strictly restricted to authorized super administrators with verified roles in Kupera.
          </p>
        </div>
      </div>
    </div>
  );
}
