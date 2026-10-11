'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
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
  Bell,
  Lock,
  Check,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Facebook,
  QrCode,
  Smartphone,
  ChevronRight,
  Zap,
  Globe2,
  MapPin,
  Clock,
  Layers,
  FileCheck,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';

const APP_SUBDOMAIN = process.env.NEXT_PUBLIC_APP_SUBDOMAIN || 'https://app.kupera.in';
const ADMIN_SUBDOMAIN = process.env.NEXT_PUBLIC_ADMIN_SUBDOMAIN || 'https://admin.kupera.in';

const NAV_LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#solutions', label: 'Solutions' },
  { href: '#experience', label: 'Experience' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

const PLATFORM_FEATURES = [
  {
    icon: Building2,
    badge: 'Inventory & Rooms',
    title: 'Visual Bed Allocation & Floor Maps',
    desc: 'Instant visual clarity across all your rooms, sharing types, and floors. Real-time vacant bed alerts prevent double bookings and accelerate occupancy.',
    highlight: 'Instant vacancy detection',
    color: 'text-blue-600 bg-blue-50 border-blue-200/60',
  },
  {
    icon: Users,
    badge: 'Resident CRM',
    title: 'Paperless Aadhaar KYC & Digital Agreements',
    desc: 'Onboard residents in under 60 seconds with mobile ID uploads, verified emergency contacts, and automated digital rent agreements stored securely.',
    highlight: '60s onboarding check-in',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
  },
  {
    icon: QrCode,
    badge: '0% Platform Fee',
    title: 'Zero-Fee Direct UPI & Dynamic QR Collections',
    desc: 'Tenants pay rent via Google Pay, PhonePe, Paytm, or BHIM directly into your master account with zero platform commission. GST-compliant PDF receipts are delivered instantly.',
    highlight: '100% of your rent kept',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
  },
  {
    icon: Bell,
    badge: 'Autonomous AI',
    title: 'Smart Voice Call & WhatsApp Reminders',
    desc: 'Gentle, polite multi-lingual reminder calls dispatched automatically before due dates. Eliminate awkward manual calls and slash late rent by 65%.',
    highlight: '65% fewer late dues',
    color: 'text-amber-600 bg-amber-50 border-amber-200/60',
  },
  {
    icon: BarChart3,
    badge: 'Financial Ledger',
    title: 'Daily Expense Ledger & Net Profit Intelligence',
    desc: 'Log food provisions, maintenance, cleaning supplies, and staff payroll right alongside your rent collections to see real-time net profit margins.',
    highlight: 'Real-time profit margins',
    color: 'text-rose-600 bg-rose-50 border-rose-200/60',
  },
  {
    icon: Shield,
    badge: 'Cloud Security',
    title: 'Role-Based Control for Owners & Caretakers',
    desc: 'Strict multi-tier permissions protect your tenant data and financials. Caretakers log expenses and complaints without seeing your master account earnings.',
    highlight: 'Bank-grade cryptographic privacy',
    color: 'text-violet-600 bg-violet-50 border-violet-200/60',
  },
];

const METRICS = [
  { value: '550+', label: 'Hostels & PGs Live', detail: 'Across Hyderabad, Pune, Bengaluru & Kota' },
  { value: '18,500+', label: 'Active Beds Managed', detail: 'Maintained with 98.4% live occupancy tracking' },
  { value: '0%', label: 'Platform Commission', detail: 'Zero commission deductions on UPI rent collections' },
  { value: '99.9%', label: 'Cloud Uptime SLA', detail: 'Built on high-availability edge infrastructure' },
];

const PRICING_PLANS = [
  {
    name: 'Starter Pilot',
    price: '₹0',
    period: 'Free for 30 Days',
    badge: 'Risk Free',
    isPopular: false,
    desc: 'Everything you need to modernize your hostel or co-living property with digital zero-fee rent collection.',
    features: [
      'Manage up to 1 Hostel Property',
      'Unlimited Room & Bed Allocations',
      'Instant Aadhaar KYC & Document Storage',
      'Zero-Fee UPI QR Code Rent Payments',
      'Automated Branded PDF Receipts via Email',
      'Daily Operational Expense Ledger',
      'Self-Service Resident View Portal',
      'Standard Email & Ticket Support',
    ],
    cta: 'Start 30-Day Free Trial',
  },
  {
    name: 'Kupera Pro',
    price: '₹599',
    period: 'per month',
    badge: 'Most Popular',
    isPopular: true,
    desc: 'The complete enterprise suite for multi-branch hostel chains and high-volume PG operators.',
    features: [
      'Unlimited Hostels & Branch Properties',
      'Autonomous AI Voice Call Reminder Engine',
      'Instant WhatsApp Invoice Dispatch',
      'Multi-User Roles (Owner, Caretaker, Warden)',
      'Bank Account Auto-Settlement Routing',
      'Advanced Net Profit & CA Tax Reports',
      'Dedicated Account Manager & Phone Onboarding',
      'Priority 24/7 Enterprise SLA',
    ],
    cta: 'Activate Kupera Pro',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'Before Kupera, our staff spent the first ten days of every month matching UPI screenshots and reconciling cash. Today, 90% of our tenants pay through the zero-fee UPI links before the 5th.',
    author: 'Rajeshwar Reddy',
    property: 'Proprietor, Sri Sai Comforts PG (340 Beds) — Hyderabad',
    rating: 5,
    tag: 'Saves 4+ hours daily',
  },
  {
    quote:
      'The clean Apple-like design made it so easy for my caretakers to adopt within 15 minutes. Tenant Aadhaar verification and room shifting take seconds right from a smartphone.',
    author: 'Priya Sharma',
    property: 'Founder, Olive Luxury Living — Bengaluru',
    rating: 5,
    tag: '100% paperless check-in',
  },
  {
    quote:
      'Other software companies take 1.5% to 2% of my rent as payment gateway fees. Kupera takes 0% cut from my UPI collections. That alone saves me over ₹50,000 every single year.',
    author: 'Manoj Deshmukh',
    property: 'Director, Pride Co-Living (3 Hostels) — Pune',
    rating: 5,
    tag: 'Zero platform fee savings',
  },
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* ── Top Announcement Banner ── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-400 text-slate-950 uppercase tracking-wide">
            New
          </span>
          <span>Zero-fee UPI intent & dynamic QR payment engine now live for Indian PG owners.</span>
          <a
            href={signupUrl}
            className="hidden sm:inline-flex items-center font-semibold text-indigo-300 hover:text-white ml-1 underline underline-offset-2"
          >
            Claim 30 Days Free →
          </a>
        </div>
      </div>

      {/* ── Precision Navigation Bar (Apple / Google Style) ── */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm'
            : 'bg-white/70 backdrop-blur-md border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
                Kupera
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase -mt-0.5">
                Smart Hostel OS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Header Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={loginUrl}
              className="text-sm font-semibold text-slate-700 hover:text-slate-950 px-4 py-2 rounded-lg hover:bg-slate-100/80 transition-colors"
            >
              Sign In
            </a>
            <a
              href={signupUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4.5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-base font-medium text-slate-700 hover:text-blue-600 py-1"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <a
                href={loginUrl}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Hostel Manager Login
              </a>
              <a
                href={signupUrl}
                className="w-full text-center py-2.5 rounded-xl bg-slate-950 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Start 30-Day Free Trial
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Section (Clean, Apple-inspired whitespace & crisp typography) ── */}
      <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle geometric light backdrops */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-blue-100/70 via-indigo-50/50 to-purple-100/60 rounded-full blur-[110px]" />
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-7">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200/90 bg-white/90 shadow-sm text-xs font-semibold text-slate-700 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-600" />
            <span>Built Exclusively for Indian Hostel & PG Entrepreneurs</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-600 font-medium">Zero-Fee UPI</span>
          </div>

          {/* Primary Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 leading-[1.08]">
            The intelligent operating system for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              modern hostels & PGs.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate late rent payments, Excel spreadsheets, and physical paperwork. Kupera automates room allocations, Aadhaar KYC verification, zero-fee UPI rent collection, and AI-powered fee reminders.
          </p>

          {/* Action Call To Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={signupUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-950 text-white font-semibold text-base shadow-sm hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <span>Start 30-Day Free Trial</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#experience"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-base shadow-sm hover:bg-slate-50 transition-colors"
            >
              <span>See How It Works</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          {/* Trust Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs sm:text-sm text-slate-500 pt-4 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>0% Platform Commission</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant 5-Minute Setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Bank-Grade Privacy</span>
            </div>
          </div>

          {/* ── High-Resolution Product Interface Preview (Clean White Studio Render) ── */}
          <div className="pt-10 sm:pt-14 relative max-w-5xl mx-auto">
            <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-200/80 p-2 sm:p-4 text-left">
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-slate-100 bg-slate-50/70 rounded-xl mb-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="ml-3 font-mono text-[11px] text-slate-500 hidden sm:inline bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                    https://app.kupera.in/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Lock className="w-3 h-3" />
                  <span>256-bit Encrypted Live</span>
                </div>
              </div>

              {/* Live Interactive Simulation Cards */}
              <div className="p-4 sm:p-6 bg-slate-50/60 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Metric 1 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>LIVE OCCUPANCY</span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      94.2% Full
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-950">142 / 150 Beds</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-[94%]" />
                  </div>
                  <p className="text-xs text-slate-500">8 vacant beds across 3 rooms</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>OCTOBER RENT COLLECTIONS</span>
                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                      0% Fee
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-950">₹8,45,000</p>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[88%]" />
                  </div>
                  <p className="text-xs text-slate-500">88% paid directly via UPI Intent</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>AUTONOMOUS REMINDERS</span>
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">42 Voice Calls Dispatched</p>
                  <p className="text-xs text-emerald-700 font-medium">
                    +36 Paid within 24h via Dynamic QR
                  </p>
                  <p className="text-xs text-slate-400">Zero awkward staff phone calls</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Impact Numbers Section ── */}
      <section className="border-y border-slate-200/80 bg-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {METRICS.map((metric) => (
            <div key={metric.label} className="space-y-1">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                {metric.value}
              </p>
              <p className="text-sm font-semibold text-slate-800">{metric.label}</p>
              <p className="text-xs text-slate-500 hidden sm:block">{metric.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Precision Product Architecture (Google/Apple Design) ── */}
      <section id="solutions" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              Operations Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
              Designed for clarity. Built for scale.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg">
              Every detail is engineered to give property owners total control with zero operational friction.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {PLATFORM_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 ${feat.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide block mb-1.5">
                      {feat.badge}
                    </span>
                    <h3 className="text-xl font-bold text-slate-950 mb-3 leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{feat.desc}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{feat.highlight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive Workflow Experience (How It Works) ── */}
      <section id="experience" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              The Resident Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Four steps from arrival to automated checkout.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Say goodbye to messy registers, manual paper receipts, and unverified Aadhaar copies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Build Visual Rooms',
                desc: 'Add your floors, room types (Single/Double/Triple), and pricing in under 4 minutes with our guided wizard.',
                tag: '4 Min Setup',
              },
              {
                step: '02',
                title: 'Onboard Residents',
                desc: 'Upload Aadhaar photos, record advance security deposits, and assign vacant beds with instant confirmation.',
                tag: 'Paperless',
              },
              {
                step: '03',
                title: 'Zero-Fee UPI Collections',
                desc: 'Residents scan a dynamic UPI QR code or click their payment link. 100% of the rent enters your bank account directly.',
                tag: 'Zero Commission',
              },
              {
                step: '04',
                title: 'Profit & Net Margins',
                desc: 'Track operational costs (cook, electricity, Wi-Fi, laundry) to know your actual monthly bottom-line cashflow.',
                tag: 'Real-Time P&L',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 hover:border-blue-400 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-slate-300 font-mono">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-950">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transparent Flat-Fee Pricing (Apple-style minimalism) ── */}
      <section id="pricing" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Honest & Transparent
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
              Flat pricing. No percentage cuts.
            </h2>
            <p className="text-slate-600 text-base">
              We never take a percentage of your rent. Keep 100% of your earnings with simple, predictable subscriptions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'bg-white border-2 border-slate-950 shadow-xl relative'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3.5 right-8 text-xs font-bold px-3 py-1 rounded-full bg-slate-950 text-white shadow-sm uppercase tracking-wide">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-slate-950 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mb-6">{plan.desc}</p>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-5xl font-black text-slate-950 tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-500 font-medium ml-1">/{plan.period}</span>
                  </div>

                  <hr className="border-slate-100 my-6" />

                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={signupUrl}
                  className={`w-full text-center py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.isPopular
                      ? 'bg-slate-950 text-white hover:bg-slate-800 shadow-sm hover:shadow'
                      : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Verified Customer Testimonials ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Customer Stories
            </span>
            <h2 className="text-3xl font-extrabold text-slate-950">
              Trusted by 550+ Property Owners
            </h2>
            <p className="text-slate-600 text-sm">
              Real testimonials from hostel and PG entrepreneurs across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.author}
                className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-bold text-slate-950">{t.author}</p>
                  <p className="text-xs text-slate-500">{t.property}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                    {t.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Crisp Final CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            Ready to streamline your hostel?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Get started in 5 minutes. Try Kupera free for 30 days and discover how simple property operations can be.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={signupUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-950 text-white font-semibold text-base shadow-sm hover:bg-slate-800 transition-colors"
            >
              Start 30-Day Free Trial
            </a>
            <a
              href={loginUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-200 text-slate-800 font-semibold text-base hover:bg-slate-50 transition-colors"
            >
              Sign In to Manager Portal
            </a>
          </div>
          <p className="text-xs text-slate-400">
            No credit card needed · Free 30-day full access · Instant cancellation
          </p>
        </div>
      </section>

      {/* ── Comprehensive Clean Footer ── */}
      <footer id="contact" className="border-t border-slate-200 bg-slate-50 pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-slate-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
            {/* Col 1 & 2: Brand details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-slate-950 tracking-tight">Kupera</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
                India’s premier operating system for hostels, paying guest (PG) accommodations, and student co-living residences. Empowering proprietors with zero-fee UPI rent collections, digital KYC, and automated AI reminders.
              </p>

              {/* Social Channels */}
              <div className="pt-2 flex items-center gap-2 text-slate-500">
                <a
                  href="https://twitter.com/kupera_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-950 hover:border-slate-400 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/kupera-hostelhub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-950 hover:border-slate-400 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/kupera.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-950 hover:border-slate-400 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://youtube.com/@kuperahostel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-950 hover:border-slate-400 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/kupera.hostels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:text-slate-950 hover:border-slate-400 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 3: Navigation */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-slate-950 tracking-wider">Product</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href="#solutions" className="hover:text-slate-950 transition-colors">
                    Visual Bed Allocator
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-slate-950 transition-colors">
                    Aadhaar Tenant KYC
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-slate-950 transition-colors">
                    Zero-Fee UPI Invoices
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-slate-950 transition-colors">
                    AI Voice Call Engine
                  </a>
                </li>
                <li>
                  <a href="#solutions" className="hover:text-slate-950 transition-colors">
                    Expense Ledger & P&L
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-slate-950 transition-colors">
                    Pricing Plans
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 4: Portals */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-slate-950 tracking-wider">Access Portals</p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>
                  <a href={loginUrl} className="hover:text-blue-600 font-medium text-slate-900 transition-colors">
                    Hostel Manager Portal →
                  </a>
                </li>
                <li>
                  <a href="/admin/login" className="hover:text-blue-600 font-medium text-slate-900 transition-colors">
                    Super Admin Console →
                  </a>
                </li>
                <li>
                  <a href={signupUrl} className="hover:text-slate-950 transition-colors">
                    Create New Account
                  </a>
                </li>
                <li>
                  <a href="/tenant" className="hover:text-slate-950 transition-colors">
                    Resident Dues & Invoices
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-slate-950 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-slate-950 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 5: Contact Info */}
            <div className="space-y-3">
              <p className="text-xs uppercase font-bold text-slate-950 tracking-wider">Support & Office</p>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <a href="mailto:support@kupera.in" className="hover:text-slate-950 transition-colors">
                    support@kupera.in
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>+91 98765 43210 (Mon-Sat, 9am - 8pm IST)</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Hitec City, Madhapur, Hyderabad, Telangana 500081</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>24/7 Cloud Monitoring</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Kupera Technologies Private Limited. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                <Globe2 className="w-3.5 h-3.5 text-blue-600" /> Made for Indian Hostel Owners 🇮🇳
              </span>
              <span>ISO 27001 & UPI Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
