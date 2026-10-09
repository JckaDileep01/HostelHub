'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Building2, Users, BedDouble, CreditCard, Zap, Shield, BarChart3,
  ArrowRight, CheckCircle2, Star, Phone, Mail, Menu, X, Sparkles,
  TrendingUp, Bell, FileText, Wifi, ChevronDown, Globe2,
} from 'lucide-react';

const APP_SUBDOMAIN = process.env.NEXT_PUBLIC_APP_SUBDOMAIN || 'https://app.hostelhub.app';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
];

const FEATURES = [
  { icon: BedDouble, color: 'text-indigo-500', bg: 'bg-indigo-500/10', title: 'Smart Room & Bed Management', desc: 'Visual floor maps, per-bed allocation, real-time occupancy stats.' },
  { icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10', title: 'Tenant Onboarding & KYC', desc: 'Digital onboarding with Aadhaar/ID upload, e-agreements, and automated background checks.' },
  { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: '0% Fee Rent Collection', desc: 'Accept UPI, cards, and bank transfers with zero platform fees. Every rupee goes directly to you.' },
  { icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10', title: 'AI Voice Payment Reminders', desc: 'Automated AI voice calls to tenants before rent due date. Cut late payments by up to 60%.' },
  { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Instant PDF Receipts', desc: 'Auto-generated branded receipts sent to tenants via WhatsApp or email after every payment.' },
  { icon: BarChart3, color: 'text-pink-500', bg: 'bg-pink-500/10', title: 'Revenue Analytics', desc: 'Month-over-month revenue trends, occupancy rates, pending dues, and cash-flow forecasts.' },
  { icon: Building2, color: 'text-cyan-500', bg: 'bg-cyan-500/10', title: 'Multi-Hostel Management', desc: 'Manage all your properties from one account. Switch between hostels in one click.' },
  { icon: Shield, color: 'text-violet-500', bg: 'bg-violet-500/10', title: 'Bank-Grade Security', desc: 'End-to-end encryption, row-level data isolation, and role-based access for staff.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Your Hostel', desc: 'Set up your hostel profile, configure floors, rooms, beds, and pricing in under 5 minutes.' },
  { step: '02', title: 'Onboard Tenants', desc: 'Add tenants digitally with ID verification. They get a personal portal to track dues and payments.' },
  { step: '03', title: 'Collect Rent Effortlessly', desc: 'Send digital payment links via WhatsApp. Accept UPI, cards, and net banking — all tracked automatically.' },
  { step: '04', title: 'Grow with Insights', desc: 'Track revenue, occupancy, maintenance tickets, and renewals from your central dashboard.' },
];

const TESTIMONIALS = [
  { name: 'Rajesh Kumar', role: 'Owner, Sri Sai Boys PG — Hyderabad', avatar: 'RK', rating: 5, text: 'Before Hostelhood, I was maintaining rent records in an Excel sheet. Now everything is automated. I save 2–3 hours every month.' },
  { name: 'Priya Nair', role: 'Manager, Green Valley Girls Hostel — Bengaluru', avatar: 'PN', rating: 5, text: 'The AI voice call reminders are a game-changer. My tenants actually pay on time now because they get a polite reminder call automatically.' },
  { name: 'Mohammed Farhan', role: 'Owner, 3 Hostels in Pune', avatar: 'MF', rating: 5, text: 'Managing 3 properties from a single dashboard with zero platform fee is unbelievable. Other apps charged 2–5% on every rent collection. Hostelhood is the real deal.' },
];

const PRICING = [
  {
    name: 'Starter', price: '0', period: 'First 30 days', badge: 'Free Trial', badgeColor: 'bg-emerald-500',
    features: ['Up to 1 hostel', 'Unlimited tenants & beds', 'Rent collection (UPI / Cash)', 'PDF receipts', 'Tenant portal', 'Email support'],
    cta: 'Start Free Trial', highlighted: false,
  },
  {
    name: 'Pro', price: '599', period: 'per month', badge: 'Most Popular', badgeColor: 'bg-indigo-600',
    features: ['Unlimited hostels', 'AI voice payment reminders', 'WhatsApp notifications', 'Advanced analytics', 'Staff role management', 'Priority phone support', '0% platform fee on all payments'],
    cta: 'Get Started', highlighted: true,
  },
];

export default function MarketingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Hostelhood</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(l => (<a key={l.href} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href={APP_SUBDOMAIN + '/login'} className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">Sign In</a>
            <a href={APP_SUBDOMAIN + '/signup'} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/30 hover:-translate-y-0.5">Get Started Free</a>
          </div>
          <button className="md:hidden text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0D0D14] border-t border-white/5 px-4 py-4 space-y-3">
            {NAV_LINKS.map(l => (<a key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-white/70 hover:text-white py-2">{l.label}</a>))}
            <a href={APP_SUBDOMAIN + '/signup'} className="block text-center text-sm bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold mt-2">Get Started Free</a>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.015)_1px,transparent_1px)] bg-[size:60px_60px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            India&apos;s #1 Hostel Management Platform
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            Run Your Hostel{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">Smarter</span>
            {' '}Not Harder
          </h1>
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate rent collection, manage rooms & beds, onboard tenants digitally, and get AI-powered payment reminders.{' '}
            <strong className="text-white/80">Zero platform fees. Forever.</strong>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a href={APP_SUBDOMAIN + '/signup'} className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-600/40 transition-all hover:-translate-y-1">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#how-it-works" className="flex items-center gap-2 text-white/60 hover:text-white px-6 py-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all text-sm font-medium">
              See how it works <ChevronDown className="w-4 h-4" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/40 text-xs mb-12">
            {['No credit card required', '30-day free trial', '0% rent collection fee', 'Cancel anytime'].map(t => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{t}</span>
            ))}
          </div>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <Image src="/dashboard-preview.jpg" alt="Hostelhood Dashboard Preview" width={1280} height={720} className="w-full h-auto" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/5 bg-white/[0.02] py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[{ label: 'Hostels Managed', value: '500+' }, { label: 'Tenants Tracked', value: '12,000+' }, { label: 'Rent Collected', value: '₹2.4Cr+' }, { label: 'Avg. Rating', value: '4.9 ⭐' }].map(s => (
            <div key={s.label} className="space-y-1">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-sm text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Features</p>
            <h2 className="text-4xl font-black mb-4">Everything You Need to Run a Hostel</h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">Built specifically for Indian hostel owners.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}><f.icon className={`w-5 h-5 ${f.color}`} /></div>
                <h3 className="font-bold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 px-4 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Process</p>
            <h2 className="text-4xl font-black mb-4">Get Started in Minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="p-6 rounded-2xl border border-white/5 bg-[#0D0D14] space-y-3">
                <span className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{step.step}</span>
                <h3 className="font-bold text-white">{step.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3">Pricing</p>
            <h2 className="text-4xl font-black mb-4">Simple, Transparent Pricing</h2>
            <p className="text-white/50 max-w-xl mx-auto">No hidden fees. No per-transaction cuts. Just a flat monthly subscription.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING.map(plan => (
              <div key={plan.name} className={`relative p-8 rounded-2xl border transition-all ${plan.highlighted ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-600/10 to-purple-600/5 shadow-2xl shadow-indigo-500/10' : 'border-white/10 bg-white/[0.03]'}`}>
                <span className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full text-white ${plan.badgeColor}`}>{plan.badge}</span>
                <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-1">
                  {plan.price !== '0' && <span className="text-2xl text-white/50">₹</span>}
                  <span className="text-5xl font-black text-white">{plan.price === '0' ? 'Free' : plan.price}</span>
                </div>
                <p className="text-white/40 text-sm mb-6">{plan.period}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <a href={APP_SUBDOMAIN + '/signup'} className={`block text-center py-3.5 rounded-xl font-bold transition-all text-sm ${plan.highlighted ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg' : 'border border-white/20 text-white hover:bg-white/5'}`}>{plan.cta}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 bg-white/[0.015]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">Testimonials</p>
            <h2 className="text-4xl font-black mb-4">Trusted by Hostel Owners Across India</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.03] space-y-4">
                <div className="flex gap-0.5">{Array.from({ length: t.rating }).map((_, i) => (<Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />))}</div>
                <p className="text-white/60 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl" />
          <div className="relative text-center p-16 rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-indigo-600/10 to-purple-600/5">
            <h2 className="text-4xl font-black mb-4">Ready to Modernize Your Hostel?</h2>
            <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">Join 500+ hostel owners who save hours every week with Hostelhood. Start free — no credit card required.</p>
            <a href={APP_SUBDOMAIN + '/signup'} className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-600/40 transition-all hover:-translate-y-1 group">
              Start Your Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <p className="text-white/30 text-xs mt-4">30 days free · No credit card · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"><Building2 className="w-3.5 h-3.5 text-white" /></div>
              <span className="font-bold text-white">Hostelhood</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/40">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="mailto:support@hostelhub.app" className="hover:text-white transition-colors flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />support@hostelhub.app</a>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/20">
            <p>© 2026 Hostelhood. All rights reserved. Made in India 🇮🇳</p>
            <p className="flex items-center gap-1.5"><Globe2 className="w-3 h-3" />Serving hostel owners across India</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
