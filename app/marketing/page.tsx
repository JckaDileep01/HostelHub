'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  BedDouble,
  CreditCard,
  Zap,
  Shield,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Phone,
  Mail,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  Bell,
  FileText,
  Wifi,
  ChevronDown,
  Globe2,
  MapPin,
  Clock,
  Layers,
  Award,
  Lock,
  Headphones,
  Check,
  Send,
  MessageSquare,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  ExternalLink,
} from 'lucide-react';

const APP_SUBDOMAIN = process.env.NEXT_PUBLIC_APP_SUBDOMAIN || 'https://app.kupera.in';
const ADMIN_SUBDOMAIN = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || 'https://admin.kupera.in';

const NAV_LINKS = [
  { href: '#solutions', label: 'Solutions' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#about', label: 'About Kupera' },
];

const PLATFORM_PILLARS = [
  {
    icon: Building2,
    tag: 'Property & Inventory',
    title: 'Precision Room & Floor Management',
    desc: 'Interactive visual floor layouts, multi-sharing room configurations, automatic bed status synchronization, and real-time vacant capacity detection.',
    accent: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
  },
  {
    icon: Users,
    tag: 'Resident Journey',
    title: 'Digital Onboarding & Aadhaar KYC',
    desc: 'Paperless check-in in under 2 minutes. Secure document storage, Aadhaar instant preview, customized digital rental agreements, and resident emergency contacts.',
    accent: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
  },
  {
    icon: CreditCard,
    tag: 'Cashflow Engine',
    title: 'Zero Platform Fee UPI & Auto-Billing',
    desc: 'Automated 1st-of-month rent invoice generation, direct-to-bank UPI transfers, instant GST/branded PDF receipts via WhatsApp, and automated reconciliation.',
    accent: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/30',
  },
  {
    icon: Bell,
    tag: 'Autonomous Operations',
    title: 'AI Smart Voice & WhatsApp Reminders',
    desc: 'Intelligent multi-lingual voice reminder calls scheduled prior to due date that drop late payments by over 60%, without awkward manual calls from staff.',
    accent: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
  },
  {
    icon: BarChart3,
    tag: 'Executive Intelligence',
    title: 'Full Financial Ledger & Net Margins',
    desc: 'Track operational costs (cook, electricity, Wi-Fi, plumber) right alongside tenant receivables to calculate true monthly net profitability.',
    accent: 'from-rose-500/20 to-red-500/20',
    border: 'border-rose-500/30',
  },
  {
    icon: Shield,
    tag: 'Enterprise Security',
    title: 'Multi-Role Access & Cloud Isolation',
    desc: 'Granular permissions for owners, caretakers, and wardens. Supabase row-level cryptographic isolation ensuring each property’s data is 100% private.',
    accent: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-500/30',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Configure Your Hostel Layout',
    desc: 'Add your property details, floors, room numbers, and bed pricing in less than 4 minutes using our guided setup wizard.',
    badge: 'Quick Setup',
  },
  {
    step: '02',
    title: 'Onboard Residents with KYC',
    desc: 'Collect Aadhaar proof, assign beds, log security deposits, and automatically trigger their first month rental invoice.',
    badge: 'Paperless',
  },
  {
    step: '03',
    title: 'Collect Rent Automatically',
    desc: 'Tenants receive secure payment links with QR code and UPI support. Receipts are dispatched automatically upon verification.',
    badge: '0% Fees',
  },
  {
    step: '04',
    title: 'Track Net Profit & Growth',
    desc: 'Log staff expenses, monitor live occupancy trends, and manage multiple hostel branches seamlessly from a unified command dashboard.',
    badge: 'Unified Control',
  },
];

const PRICING = [
  {
    name: 'Starter Pilot',
    price: '0',
    period: 'Free for 30 Days',
    badge: 'Free Trial',
    badgeColor: 'bg-emerald-500',
    highlighted: false,
    desc: 'Ideal for single hostels, PGs, or co-living setups experiencing digital operations for the first time.',
    features: [
      'Manage up to 1 Hostel Property',
      'Unlimited Rooms & Bed Allocations',
      'Paperless Digital Tenant KYC',
      'Automated Rent Invoices & PDF Receipts',
      'Resident Self-Service Payment Portal',
      'Daily Expense & Ledger Tracking',
      'Community Email & Ticket Support',
    ],
    cta: 'Start 30-Day Free Trial',
  },
  {
    name: 'Kupera Pro',
    price: '599',
    period: 'per month',
    badge: 'Most Popular',
    badgeColor: 'bg-indigo-600',
    highlighted: true,
    desc: 'For ambitious hostel proprietors and chains demanding high occupancy, automated collections, and zero manual hassle.',
    features: [
      'Unlimited Hostels & Branch Properties',
      'Autonomous AI Voice Call Payment Reminders',
      'Direct WhatsApp Alert & Receipt Integration',
      '0% Platform Cut on All UPI Collections',
      'Comprehensive Profit & Loss Analytics',
      'Multi-User Roles (Owner, Caretaker, Warden)',
      'Exportable Excel & CA Audit Tax Reports',
      'Priority Phone & Dedicated Account Support',
    ],
    cta: 'Activate Kupera Pro',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rajeshwar Reddy',
    role: 'Proprietor, Sri Sai Comforts PG (340 Beds) — Hyderabad',
    text: 'Before Kupera, my caretakers spent the first 10 days of every month chasing rent in cash or matching UPI screenshots. Now, 85% of tenants pay on time through the digital links, and the AI voice reminder does the reminding for us.',
    metric: '4.5 hrs saved daily',
  },
  {
    name: 'Priya Sharma',
    role: 'Founder, Olive Living Girls Luxury Hostel — Bengaluru',
    text: 'Aadhaar KYC and bed allocation was our biggest bottleneck during peak admission season. Kupera made it seamless on mobile phones. Our tenants love the instant branded PDF receipts they receive.',
    metric: '99.2% rent collected on time',
  },
  {
    name: 'Manoj Deshmukh',
    role: 'Director, Pride Co-Living (3 Hostels) — Pune',
    text: 'Switching to Kupera saved us tens of thousands in percentage gateway charges because Kupera takes 0% cut from our rent. The expense logging also gives me clear clarity on our true monthly hostel profit.',
    metric: '₹48,000 saved annually in fees',
  },
];

const BUSINESS_STATS = [
  { value: '550+', label: 'Verified Hostels & PGs' },
  { value: '18,500+', label: 'Active Beds Managed' },
  { value: '₹3.8 Cr+', label: 'Monthly Rent Processed' },
  { value: '99.9%', label: 'Platform Uptime' },
];

export default function MarketingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loginUrl, setLoginUrl] = useState('/login');
  const [signupUrl, setSignupUrl] = useState('/signup');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocal =
        window.location.hostname.includes('localhost') ||
        window.location.hostname.includes('127.0.0.1');
      if (isLocal) {
        setLoginUrl('/login');
        setSignupUrl('/signup');
      } else {
        const base = process.env.NEXT_PUBLIC_APP_SUBDOMAIN || 'https://app.kupera.in';
        setLoginUrl(`${base}/login`);
        setSignupUrl(`${base}/signup`);
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#07070B] text-white selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {/* ── Navigation Bar ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#07070B]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/80'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                Kupera
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
              </span>
              <p className="text-[10px] text-white/50 tracking-wider uppercase font-medium -mt-1 hidden sm:block">
                Hostel ERP & Smart Operations
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-white/70 hover:text-white transition-colors hover:translate-y-[-1px]"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={loginUrl}
              className="text-sm font-semibold text-white/80 hover:text-white px-4 py-2.5 rounded-xl hover:bg-white/5 transition-all"
            >
              Sign In
            </a>
            <a
              href={signupUrl}
              className="relative group inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="lg:hidden text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0C0C14] border-b border-white/10 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200 shadow-2xl">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-white/80 hover:text-white py-1.5"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
              <a
                href={loginUrl}
                className="w-full text-center py-2.5 rounded-xl bg-white/5 text-sm font-semibold text-white hover:bg-white/10"
              >
                Hostel Manager Login
              </a>
              <a
                href="/admin/login"
                className="w-full text-center py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-sm font-semibold text-indigo-300 hover:bg-indigo-500/20"
              >
                Super Admin Command Center
              </a>
              <a
                href={signupUrl}
                className="w-full text-center py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/30"
              >
                Start 30-Day Free Trial
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-36 sm:pt-44 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] sm:w-[1000px] h-[550px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-blue-600/20 rounded-full blur-[140px]" />
          <div className="absolute top-1/3 left-1/5 w-[350px] h-[350px] bg-indigo-500/15 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-8">
          {/* Tag badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Introducing Kupera — Next-Gen Hostel & PG Management Cloud</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Transform Your Hostel Business with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Intelligent Automation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed">
            Eliminate late rent payments, manual Excel sheets, and tenant disputes. Kupera streamlines
            room allocations, Aadhaar KYC verification, zero-fee UPI collections, and automated AI
            voice reminders across single and multi-branch hostels.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={signupUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-base sm:text-lg shadow-2xl shadow-indigo-600/40 hover:shadow-indigo-600/60 transition-all duration-200 hover:-translate-y-1 group"
            >
              <span>Get Started Free — 30 Days</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#solutions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white/80 hover:text-white px-7 py-4 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.07] transition-all text-sm font-semibold"
            >
              Explore Solutions <ChevronDown className="w-4 h-4 text-white/60" />
            </a>
          </div>

          {/* Micro trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-white/50 text-xs sm:text-sm pt-4">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              0% Platform Commission
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              No Credit Card Needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Instant Setup in 5 Mins
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Aadhaar & Bank-Grade Security
            </span>
          </div>

          {/* App Dashboard Preview Mockup */}
          <div className="relative pt-10 sm:pt-14 max-w-5xl mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-75" />
            <div className="relative rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0F0F1A] shadow-2xl shadow-black overflow-hidden p-2 sm:p-3">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02] rounded-t-xl mb-2 text-xs text-white/40">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 font-mono text-[11px] text-white/50 hidden sm:inline">
                    https://app.kupera.in/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-bit SSL Secure</span>
                </div>
              </div>

              {/* High-fidelity interactive UI simulation cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 sm:p-5 bg-[#090910] rounded-xl text-left">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Live Occupancy</span>
                    <span className="text-emerald-400 font-bold">94.2%</span>
                  </div>
                  <p className="text-2xl font-black text-white">142 / 150 Beds</p>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94%]" />
                  </div>
                  <p className="text-[11px] text-white/40">8 vacant beds across 4 rooms</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>October Collections</span>
                    <span className="text-indigo-400 font-bold">₹7,82,000</span>
                  </div>
                  <p className="text-2xl font-black text-white">₹7,82,000</p>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[88%]" />
                  </div>
                  <p className="text-[11px] text-white/40">88% paid · 12 pending invoices</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>AI Assistant Action</span>
                    <span className="text-amber-400 font-bold">Active</span>
                  </div>
                  <p className="text-sm font-semibold text-white">
                    42 Reminder Calls Dispatched
                  </p>
                  <p className="text-xs text-emerald-400 font-medium">
                    +34 Completed via Instant UPI
                  </p>
                  <p className="text-[11px] text-white/40">Zero manual phone calls needed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Business Performance Metrics Bar ── */}
      <section className="border-y border-white/10 bg-white/[0.02] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {BUSINESS_STATS.map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-xs sm:text-sm text-white/50 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Solutions / Platform Pillars ── */}
      <section id="solutions" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Complete Operations Suite
            </p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Engineered for Modern Hostel & PG Owners
            </h2>
            <p className="text-white/60 text-base sm:text-lg">
              Kupera bridges the gap between chaotic physical records and enterprise-class financial
              automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PLATFORM_PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className={`relative p-8 rounded-3xl border bg-gradient-to-b from-white/[0.04] to-white/[0.01] hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl group`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} border ${p.border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400/90 block mb-2">
                    {p.tag}
                  </span>
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug">{p.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.015] border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
              Workflow Simplicity
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">How Kupera Powers Your Hostel</h2>
            <p className="text-white/60 text-sm sm:text-base">
              Set up once, let automated systems handle room vacancies, resident bills, and receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h) => (
              <div
                key={h.step}
                className="p-6 rounded-3xl border border-white/10 bg-[#0C0C14] space-y-4 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {h.step}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                    {h.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{h.title}</h3>
                <p className="text-white/50 text-xs sm:text-sm leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Honest & Transparent
            </p>
            <h2 className="text-3xl sm:text-5xl font-black text-white">Simple Predictable Pricing</h2>
            <p className="text-white/60 text-base">
              We never take a percentage cut from your hard-earned rent. Flat subscription, zero hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {PRICING.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 sm:p-10 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted
                    ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-950/30 via-[#0E0E1B] to-[#0A0A12] shadow-2xl shadow-indigo-600/15 ring-1 ring-indigo-500/40'
                    : 'border-white/10 bg-[#0C0C14]'
                }`}
              >
                <span
                  className={`absolute top-6 right-6 text-[11px] font-bold px-3 py-1 rounded-full text-white ${plan.badgeColor} shadow-md`}
                >
                  {plan.badge}
                </span>

                <div>
                  <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-white/50 mb-6">{plan.desc}</p>

                  <div className="flex items-baseline gap-1 mb-2">
                    {plan.price !== '0' && <span className="text-2xl font-bold text-white/60">₹</span>}
                    <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                      {plan.price === '0' ? 'Free' : plan.price}
                    </span>
                    <span className="text-sm text-white/50 ml-1">/{plan.period}</span>
                  </div>

                  <hr className="border-white/10 my-6" />

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/80">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={signupUrl}
                  className={`w-full text-center py-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5'
                      : 'border border-white/20 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.015] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Verified Proprietor Stories
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Loved by 550+ Property Owners</h2>
            <p className="text-white/60 text-sm">Real results from hostels across Hyderabad, Bengaluru, Pune & Kota.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-3xl border border-white/10 bg-[#0C0C14] flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed italic">&quot;{t.text}&quot;</p>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm font-bold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.role}</p>
                  <div className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                    {t.metric}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call To Action Banner ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 via-purple-600/30 to-pink-600/20 rounded-3xl blur-2xl opacity-75" />
          <div className="relative text-center p-10 sm:p-16 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-[#131124] to-[#0A0A12] shadow-2xl space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to Upgrade Your Hostel Operations?
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-2xl mx-auto">
              Join the growing network of Indian hostel and PG owners who save time, reduce delinquency,
              and delight residents with Kupera.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={signupUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-indigo-600/30 hover:-translate-y-0.5 transition-all"
              >
                Start 30-Day Free Trial <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={loginUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/20 text-white/80 hover:text-white px-7 py-4 rounded-xl font-semibold text-sm hover:bg-white/5 transition-all"
              >
                Sign In to Manager Portal
              </a>
            </div>
            <p className="text-xs text-white/40">30 days free · No credit card required · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* ── Comprehensive Website Footer with Complete Business & Social Details ── */}
      <footer id="about" className="border-t border-white/10 bg-[#050508] pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-white/70">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* Col 1 & 2: Company Description & Socials */}
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tight">Kupera</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed max-w-sm">
                Kupera is India’s premier cloud operating system for hostels, paying guest (PG) accommodations,
                and co-living residences. We empower hostel entrepreneurs with automated rent collection, digital
                Aadhaar KYC, room inventory tracking, and AI-driven reminders.
              </p>

              {/* Social Channels */}
              <div className="space-y-2 pt-2">
                <p className="text-xs uppercase font-bold text-white/40 tracking-wider">Follow & Connect</p>
                <div className="flex items-center gap-3">
                  <a
                    href="https://twitter.com/kupera_app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white transition-all"
                    aria-label="Kupera on Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com/company/kupera-hostelhub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white transition-all"
                    aria-label="Kupera on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com/kupera.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white transition-all"
                    aria-label="Kupera on Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://youtube.com/@kuperahostel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white transition-all"
                    aria-label="Kupera on YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                  <a
                    href="https://facebook.com/kupera.hostels"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:border-indigo-500/40 hover:text-white transition-all"
                    aria-label="Kupera on Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Col 3: Product Navigation */}
            <div className="space-y-4">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Product Features</p>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    Room & Bed Allocator
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    Tenant Aadhaar KYC
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    0% Commission UPI Invoicing
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    AI Voice Call Reminder Engine
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-white transition-colors">
                    Expense Ledger & P&L
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition-colors">
                    Subscription Plans
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Platform Portals & Access */}
            <div className="space-y-4">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Platform Portals</p>
              <ul className="space-y-2.5 text-sm text-white/60">
                <li>
                  <a href={loginUrl} className="hover:text-indigo-400 transition-colors font-medium text-white/80">
                    Hostel Manager Login →
                  </a>
                </li>
                <li>
                  <a href="/admin/login" className="hover:text-indigo-400 transition-colors font-medium text-white/80">
                    Super Admin Command Center →
                  </a>
                </li>
                <li>
                  <a href={signupUrl} className="hover:text-white transition-colors">
                    Create New Hostel Account
                  </a>
                </li>
                <li>
                  <a href="/tenant" className="hover:text-white transition-colors">
                    Resident Dues & Invoices
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-white transition-colors">
                    Privacy & Data Protection Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact & Head Office Info */}
            <div className="space-y-4">
              <p className="text-xs uppercase font-bold text-white tracking-wider">Enterprise Support</p>
              <ul className="space-y-3 text-xs sm:text-sm text-white/60">
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <a href="mailto:support@kupera.in" className="hover:text-white transition-colors">
                    support@kupera.in
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>+91 98765 43210 (Mon-Sat, 9am - 8pm IST)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Hitec City, Madhapur, Hyderabad, Telangana 500081, India</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>24/7 Dedicated System Monitoring</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Legal Line */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
            <p>© {new Date().getFullYear()} Kupera Technologies Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-white/60">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400" /> Made for Indian Hostel & PG Entrepreneurs 🇮🇳
              </span>
              <span>ISO 27001 & UPI Compliant Infrastructure</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
