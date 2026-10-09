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
import { Building2, Loader2, Lock, Mail, Eye, EyeOff, Sparkles, Copy, Check, ArrowLeft } from 'lucide-react';

const DEMO_EMAIL = 'demo.owner@hostelhub.test';
const DEMO_PASSWORD = 'DemoHostel123!';

export default function LoginClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...' });
    setLoading(false);
    router.push('/app/dashboard');
  }

  function handleFillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    toast({
      title: 'Demo credentials loaded! ✨',
      description: 'Click "Sign In" to access the demo dashboard.',
    });
  }

  function handleCopy(text: string, field: 'email' | 'password') {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: `Copied ${field === 'email' ? 'Email' : 'Password'} to clipboard`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 transition-colors">
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
            <p className="text-sm text-slate-500 dark:text-slate-400">Smart Management Platform</p>
          </div>
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1.5 pb-4">
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Enter your credentials to access your hostel dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-slate-800 dark:text-slate-200 font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="login-email"
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-slate-800 dark:text-slate-200 font-medium">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-indigo-500"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Button
                id="login-submit"
                type="submit"
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md transition-colors"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>

              <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Box */}
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Sample Demo Credentials
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Auto-fill Form
            </button>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 rounded border border-indigo-100 dark:border-indigo-950">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Email:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 select-all">{DEMO_EMAIL}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_EMAIL, 'email')}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                  title="Copy email"
                >
                  {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white/80 dark:bg-slate-900/80 px-2.5 py-1.5 rounded border border-indigo-100 dark:border-indigo-950">
              <span className="text-slate-500 dark:text-slate-400 font-sans">Password:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 select-all">{DEMO_PASSWORD}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(DEMO_PASSWORD, 'password')}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                  title="Copy password"
                >
                  {copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 text-center">
            Click <strong className="text-indigo-600 dark:text-indigo-400 font-medium">Auto-fill Form</strong> above to instantly load test credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
