'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase/client';
import {
  Loader2, Building, ShieldCheck, CheckCircle2, ChevronRight, ChevronLeft,
  Wifi, Droplets, Utensils, Snowflake, CreditCard, Zap,
  Camera, IndianRupee, BedDouble, Layers, AlertCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface RoomConfig {
  roomNumber: string;
  sharing: string;
  customSharing: string;
  rent: string;
}

interface FloorConfig {
  floorNumber: number;
  label: string;
  roomCount: number;
  rooms: RoomConfig[];
}

interface AmenitiesForm {
  wifi: boolean;
  hot_water: boolean;
  washing_machine: boolean;
  fridge: boolean;
  ac: boolean;
  cctv: boolean;
  power_backup: boolean;
  housekeeping: boolean;
}

interface FoodForm {
  mess_available: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  veg_only: boolean;
  non_veg: boolean;
  food_notes: string;
}

interface BasicForm {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  amenities: AmenitiesForm;
  food: FoodForm;
}

interface OnboardHostelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess?: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const SHARING_OPTIONS = [
  { value: '1', label: '1 Sharing (Private)' },
  { value: '2', label: '2 Sharing' },
  { value: '3', label: '3 Sharing' },
  { value: '4', label: '4 Sharing' },
  { value: '5', label: '5 Sharing' },
  { value: 'custom', label: 'Custom' },
];

function generateRoomNumber(floorNum: number, roomIndex: number): string {
  const padded = String(roomIndex + 1).padStart(2, '0');
  return `${floorNum}${padded}`;
}

function buildDefaultRooms(
  floorNum: number, count: number,
  defaultSharing: string, defaultRent: string,
  existingRooms: RoomConfig[] = []
): RoomConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    roomNumber: existingRooms[i]?.roomNumber ?? generateRoomNumber(floorNum, i),
    sharing: existingRooms[i]?.sharing ?? defaultSharing,
    customSharing: existingRooms[i]?.customSharing ?? '',
    rent: existingRooms[i]?.rent ?? defaultRent,
  }));
}

function totalBeds(floors: FloorConfig[]): number {
  return floors.reduce((sum, f) =>
    sum + f.rooms.reduce((rs, r) => {
      const s = r.sharing === 'custom' ? parseInt(r.customSharing) || 0 : parseInt(r.sharing) || 0;
      return rs + s;
    }, 0), 0);
}

// ── Main Component ────────────────────────────────────────────────────────────
export function OnboardHostelWizard({ open, onOpenChange, userId, onSuccess }: OnboardHostelWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [basic, setBasic] = useState<BasicForm>({
    name: '', address: '', city: '', state: '', phone: '', email: '',
    amenities: { wifi: false, hot_water: false, washing_machine: false, fridge: false, ac: false, cctv: false, power_backup: false, housekeeping: false },
    food: { mess_available: false, breakfast: false, lunch: false, dinner: false, veg_only: false, non_veg: false, food_notes: '' },
  });

  const [totalFloors, setTotalFloors] = useState(2);
  const [defaultSharing, setDefaultSharing] = useState('2');
  const [defaultRent, setDefaultRent] = useState('5000');
  const [floors, setFloors] = useState<FloorConfig[]>([
    { floorNumber: 1, label: 'Floor 1', roomCount: 5, rooms: buildDefaultRooms(1, 5, '2', '5000') },
    { floorNumber: 2, label: 'Floor 2', roomCount: 5, rooms: buildDefaultRooms(2, 5, '2', '5000') },
  ]);
  const [expandedFloor, setExpandedFloor] = useState<number | null>(null);

  const syncFloors = useCallback((count: number, curFloors: FloorConfig[]) => {
    setFloors(Array.from({ length: count }, (_, i) => {
      const existing = curFloors.find(f => f.floorNumber === i + 1);
      if (existing) return existing;
      return { floorNumber: i + 1, label: `Floor ${i + 1}`, roomCount: 5, rooms: buildDefaultRooms(i + 1, 5, defaultSharing, defaultRent) };
    }));
  }, [defaultSharing, defaultRent]);

  const handleTotalFloorsChange = (val: number) => {
    const n = Math.max(1, Math.min(20, val));
    setTotalFloors(n); syncFloors(n, floors);
  };

  const handleFloorRoomCount = (fi: number, count: number) => {
    const n = Math.max(1, Math.min(50, count));
    setFloors(prev => prev.map((f, i) =>
      i !== fi ? f : { ...f, roomCount: n, rooms: buildDefaultRooms(f.floorNumber, n, defaultSharing, defaultRent, f.rooms) }
    ));
  };

  const handleRoomField = (fi: number, ri: number, field: keyof RoomConfig, value: string) => {
    setFloors(prev => prev.map((f, ffi) =>
      ffi !== fi ? f : { ...f, rooms: f.rooms.map((r, rri) => rri !== ri ? r : { ...r, [field]: value }) }
    ));
  };

  const applyDefaultsToAll = () => {
    setFloors(prev => prev.map(f => ({ ...f, rooms: f.rooms.map(r => ({ ...r, sharing: defaultSharing, rent: defaultRent })) })));
    toast({ title: 'Applied defaults to all rooms ✅' });
  };

  const validateStep1 = () => {
    if (!basic.name.trim()) { toast({ title: 'Hostel name is required', variant: 'destructive' }); return false; }
    if (!basic.city.trim()) { toast({ title: 'City is required', variant: 'destructive' }); return false; }
    return true;
  };

  const validateStep2 = () => {
    for (const floor of floors) {
      for (const room of floor.rooms) {
        if (room.sharing === 'custom' && (!room.customSharing || parseInt(room.customSharing) < 1)) {
          toast({ title: `Room ${room.roomNumber}: Enter valid custom sharing number`, variant: 'destructive' }); return false;
        }
        if (!room.rent || parseFloat(room.rent) <= 0) {
          toast({ title: `Room ${room.roomNumber}: Enter a valid rent amount`, variant: 'destructive' }); return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleCompleteSetup = async () => {
    setLoading(true);
    try {
      const roomsPayload = floors.flatMap(floor =>
        floor.rooms.map(room => ({
          floorNumber: floor.floorNumber,
          roomNumber: room.roomNumber,
          sharing: room.sharing === 'custom' ? parseInt(room.customSharing) || 1 : parseInt(room.sharing) || 1,
          rent: parseFloat(room.rent) || 0,
        }))
      );

      const foodDetails = basic.food.mess_available
        ? `Mess: Yes | ${[basic.food.breakfast && 'Breakfast', basic.food.lunch && 'Lunch', basic.food.dinner && 'Dinner'].filter(Boolean).join(', ')} | ${basic.food.veg_only ? 'Veg Only' : basic.food.non_veg ? 'Veg & Non-Veg' : ''} | ${basic.food.food_notes}`
        : basic.food.food_notes || 'No mess';

      // Get the current user's session token to authenticate the API call
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) throw new Error('Not authenticated. Please sign in again.');

      const response = await fetch('/api/hostels/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ownerId: userId,
          hostel: { name: basic.name, address: basic.address, city: basic.city, state: basic.state, phone: basic.phone, email: basic.email, amenities: basic.amenities, food_details: foodDetails },
          rooms: roomsPayload,
          totalFloors: floors.length,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Setup failed');

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (razorpayKey) {
        const options = {
          key: razorpayKey,
          amount: 200, // ₹2 test payment in paise
          currency: 'INR',
          name: 'Hostelhood Platform',
          description: '1 Month Free Trial Validation (₹2 Test Payment)',
          handler: () => {
            toast({ title: '🎉 Hostel Setup Complete!', description: 'Your hostel is now live.' });
            onOpenChange(false); onSuccess?.();
          },
          prefill: { contact: basic.phone, email: basic.email },
          theme: { color: '#4F46E5' },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', () => { 
           toast({ title: 'Payment failed', description: 'Please try again.', variant: 'destructive' });
        });
        rzp.open();
      } else {
        toast({ title: '🎉 Hostel Created!', description: `${basic.name} is ready with ${roomsPayload.length} rooms.` });
        onOpenChange(false); onSuccess?.();
      }
    } catch (err: any) {
      toast({ title: 'Setup failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const totalRooms = floors.reduce((s, f) => s + f.rooms.length, 0);
  const totalBedsCount = totalBeds(floors);

  const toggleAmenity = (key: keyof AmenitiesForm) =>
    setBasic(b => ({ ...b, amenities: { ...b.amenities, [key]: !b.amenities[key] } }));

  const toggleFood = (key: keyof Omit<FoodForm, 'food_notes'>) =>
    setBasic(b => ({ ...b, food: { ...b.food, [key]: !b.food[key] } }));

  const AMENITIES: { id: keyof AmenitiesForm; icon: React.ElementType; label: string }[] = [
    { id: 'wifi', icon: Wifi, label: 'WiFi' },
    { id: 'hot_water', icon: Droplets, label: 'Hot Water' },
    { id: 'washing_machine', icon: BedDouble, label: 'Washing Machine' },
    { id: 'fridge', icon: Snowflake, label: 'Refrigerator' },
    { id: 'ac', icon: Snowflake, label: 'Air Conditioning' },
    { id: 'cctv', icon: Camera, label: 'CCTV Security' },
    { id: 'power_backup', icon: Zap, label: 'Power Backup' },
    { id: 'housekeeping', icon: ShieldCheck, label: 'Housekeeping' },
  ];

  return (
    <Dialog open={open} onOpenChange={v => { if (!loading) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl bg-card border-border text-foreground p-0 overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header + Progress */}
        <div className="bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent p-5 pb-4 border-b border-border shrink-0">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-400" /> Add Your Hostel
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Complete all steps to launch your hostel on Hostelhood.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 mt-4">
            {['Basic Info & Amenities', 'Room Builder', 'Subscription'].map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${
                    step > i + 1 ? 'bg-emerald-500 border-emerald-500 text-white' :
                    step === i + 1 ? 'bg-indigo-600 border-indigo-500 text-white' :
                    'bg-secondary border-border text-muted-foreground'
                  }`}>
                    {step > i + 1 ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap ${step === i + 1 ? 'text-indigo-600 dark:text-indigo-300' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 rounded mb-4 ${step > i + 1 ? 'bg-emerald-500' : 'bg-border'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Hostel Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs text-foreground/80">Hostel Name *</Label>
                    <Input value={basic.name} onChange={e => setBasic(b => ({ ...b, name: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10"
                      placeholder="e.g. Sunrise Men's Hostel" />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs text-foreground/80">Full Address</Label>
                    <Input value={basic.address} onChange={e => setBasic(b => ({ ...b, address: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10"
                      placeholder="Street, Area, Landmark" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/80">City *</Label>
                    <Input value={basic.city} onChange={e => setBasic(b => ({ ...b, city: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10" placeholder="Bangalore" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/80">State</Label>
                    <Input value={basic.state} onChange={e => setBasic(b => ({ ...b, state: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10" placeholder="Karnataka" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/80">Contact Phone</Label>
                    <Input value={basic.phone} onChange={e => setBasic(b => ({ ...b, phone: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10" placeholder="+91 98000 00000" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-foreground/80">Contact Email</Label>
                    <Input type="email" value={basic.email} onChange={e => setBasic(b => ({ ...b, email: e.target.value }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground h-10" placeholder="owner@example.com" />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Features & Amenities</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AMENITIES.map(am => (
                    <button key={am.id} type="button" onClick={() => toggleAmenity(am.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all text-xs font-medium ${
                        basic.amenities[am.id]
                          ? 'bg-indigo-600/20 border-indigo-500/60 text-indigo-600 dark:text-indigo-300'
                          : 'bg-secondary/50 border-border text-muted-foreground hover:border-muted-foreground'
                      }`}>
                      <am.icon className={`w-5 h-5 ${basic.amenities[am.id] ? 'text-indigo-500' : 'text-muted-foreground'}`} />
                      {am.label}
                      {basic.amenities[am.id] && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Food & Meals</p>
                <div className="bg-secondary/50 border border-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-medium text-foreground">Mess / Kitchen Available</span>
                    </div>
                    <Switch checked={basic.food.mess_available} onCheckedChange={() => toggleFood('mess_available')} />
                  </div>
                  {basic.food.mess_available && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex gap-2 flex-wrap">
                        {(['breakfast', 'lunch', 'dinner'] as const).map(k => (
                          <button key={k} type="button" onClick={() => toggleFood(k)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
                              basic.food[k] ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' : 'bg-secondary border-border text-muted-foreground'
                            }`}>{k}</button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        {([['veg_only', '🥦 Veg Only'], ['non_veg', '🍗 Non-Veg']] as const).map(([k, l]) => (
                          <button key={k} type="button" onClick={() => toggleFood(k)}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              basic.food[k] ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-secondary border-border text-muted-foreground'
                            }`}>{l}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Additional Notes</Label>
                    <Textarea value={basic.food.food_notes}
                      onChange={e => setBasic(b => ({ ...b, food: { ...b.food, food_notes: e.target.value } }))}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs min-h-[50px] resize-none"
                      placeholder="Home-cooked food, special diet on request..." />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Global Controls */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-300">Building Configuration</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Total Floors</Label>
                    <Input type="number" min={1} max={20} value={totalFloors}
                      onChange={e => handleTotalFloorsChange(parseInt(e.target.value) || 1)}
                      className="bg-background border-border text-foreground h-10 text-base font-bold" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Default Sharing</Label>
                    <Select value={defaultSharing} onValueChange={setDefaultSharing}>
                      <SelectTrigger className="bg-background border-border text-foreground h-10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {SHARING_OPTIONS.filter(o => o.value !== 'custom').map(o => (
                          <SelectItem key={o.value} value={o.value} className="text-foreground">{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Default Rent (₹/month)</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input type="number" min={0} step={500} value={defaultRent} onChange={e => setDefaultRent(e.target.value)}
                        className="bg-background border-border text-emerald-500 h-10 text-base font-bold pl-7" />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button type="button" size="sm" onClick={applyDefaultsToAll}
                      className="w-full h-10 bg-secondary hover:bg-secondary/80 text-foreground text-xs">
                      Apply to All Rooms
                    </Button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-2">
                {[['Floors', floors.length, 'text-indigo-400'], ['Rooms', totalRooms, 'text-blue-400'], ['Beds', totalBedsCount, 'text-emerald-400']].map(([l, v, c]) => (
                  <div key={l as string} className="bg-secondary/60 border border-border rounded-xl p-3 text-center">
                    <p className={`text-2xl font-black ${c}`}>{v}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              {/* Per-Floor Room Builder */}
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-300">Per-Floor Room Configuration</p>
                {floors.map((floor, fi) => (
                  <div key={fi} className="border border-border rounded-xl overflow-hidden">
                    <button type="button" onClick={() => setExpandedFloor(expandedFloor === fi ? null : fi)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary/80 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
                          <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-foreground">Floor {floor.floorNumber}</p>
                          <p className="text-[10px] text-muted-foreground">{floor.rooms.length} rooms · {
                            floor.rooms.reduce((s, r) => s + (r.sharing === 'custom' ? parseInt(r.customSharing) || 0 : parseInt(r.sharing) || 0), 0)
                          } beds</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <Label className="text-[10px] text-muted-foreground whitespace-nowrap">Rooms:</Label>
                          <Input type="number" min={1} max={50} value={floor.roomCount}
                            onChange={e => handleFloorRoomCount(fi, parseInt(e.target.value) || 1)}
                            className="w-16 h-7 bg-background border-border text-foreground text-xs text-center p-1" />
                        </div>
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedFloor === fi ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {expandedFloor === fi && (
                      <div className="p-3 space-y-2 bg-background/50">
                        <div className="grid grid-cols-12 gap-1 px-1 mb-1">
                          {['Room No.', 'Sharing Type', 'Rent (₹/mo)', 'Beds'].map(h => (
                            <p key={h} className={`text-[9px] text-muted-foreground uppercase tracking-wider ${h === 'Room No.' ? 'col-span-3' : h === 'Beds' ? 'col-span-1' : 'col-span-4'}`}>{h}</p>
                          ))}
                        </div>
                        {floor.rooms.map((room, ri) => (
                          <div key={ri} className="grid grid-cols-12 gap-1 items-center">
                            <Input value={room.roomNumber} onChange={e => handleRoomField(fi, ri, 'roomNumber', e.target.value)}
                              className="col-span-3 h-8 bg-secondary border-border text-foreground text-xs px-2 font-mono" />
                            <div className="col-span-4">
                              <Select value={room.sharing} onValueChange={v => handleRoomField(fi, ri, 'sharing', v)}>
                                <SelectTrigger className="h-8 bg-background border-border text-foreground text-xs px-2"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                  {SHARING_OPTIONS.map(o => (
                                    <SelectItem key={o.value} value={o.value} className="text-foreground text-xs">{o.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="col-span-4 relative">
                              {room.sharing === 'custom' ? (
                                <Input type="number" min={1} value={room.customSharing}
                                  onChange={e => handleRoomField(fi, ri, 'customSharing', e.target.value)}
                                  placeholder="# beds"
                                  className="h-8 bg-background border-border text-foreground text-xs px-2" />
                              ) : (
                                <>
                                  <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                  <Input type="number" min={0} value={room.rent}
                                    onChange={e => handleRoomField(fi, ri, 'rent', e.target.value)}
                                    className="h-8 bg-secondary border-border text-emerald-600 dark:text-emerald-400 text-xs pl-5 font-semibold" />
                                </>
                              )}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <Badge variant="outline" className="text-[9px] border-border text-muted-foreground px-1">
                                {room.sharing === 'custom' ? (room.customSharing || '?') : room.sharing}B
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {/* Rent row for custom sharing rooms */}
                        {floor.rooms.some(r => r.sharing === 'custom') && (
                          <div className="space-y-1 pt-1 border-t border-border/50">
                            {floor.rooms.filter(r => r.sharing === 'custom').map((room, customIdx) => {
                              const ri = floor.rooms.findIndex(r => r === room);
                              return (
                                <div key={customIdx} className="grid grid-cols-12 gap-1 items-center">
                                  <p className="col-span-3 text-[10px] text-muted-foreground font-mono px-2">{room.roomNumber}</p>
                                  <p className="col-span-4 text-[10px] text-muted-foreground">Rent:</p>
                                  <div className="col-span-4 relative">
                                    <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                    <Input type="number" min={0} value={room.rent}
                                      onChange={e => handleRoomField(fi, ri, 'rent', e.target.value)}
                                      className="h-8 bg-secondary border-border text-emerald-600 dark:text-emerald-400 text-xs pl-5 font-semibold" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-700 dark:text-amber-200 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Click on any floor to expand and customize each room's number, sharing type, and rent individually.</span>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center py-4 space-y-2">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Platform Subscription</h3>
                <p className="text-muted-foreground text-sm">Setting up <span className="text-foreground font-semibold">{basic.name}</span> with {totalRooms} rooms and {totalBedsCount} beds.</p>
              </div>

              <div className="bg-secondary/50 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                  Launch Offer
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-indigo-600 dark:text-indigo-300">Hostelhood Pro</h4>
                    <p className="text-xs text-muted-foreground">Complete Management Suite</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-foreground">₹599</p>
                    <p className="text-xs text-muted-foreground">/month after trial</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {['1 Month FREE Trial — No charges for 30 days', '0% platform fee on all rent collections', 'Automated AI voice payment reminders', 'PDF receipts auto-generated on each payment', 'Unlimited tenants, rooms & beds', 'Multi-hostel management from one account'].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />{item}
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-700 dark:text-amber-200 flex gap-2">
                  <CreditCard className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>A <b>₹2 refundable</b> mandate authorization is required to activate AutoPay. Your ₹599/month billing starts after 30 days.</p>
                </div>
              </div>

              <div className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2 text-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Setup Summary</p>
                {[
                  ['Hostel', basic.name || '—'],
                  ['Location', [basic.city, basic.state].filter(Boolean).join(', ') || '—'],
                  ['Floors', String(floors.length)],
                  ['Total Rooms', String(totalRooms)],
                  ['Total Beds', String(totalBedsCount)],
                  ['Amenities', Object.entries(basic.amenities).filter(([, v]) => v).length + ' selected'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className={`font-semibold ${k === 'Total Beds' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-5 py-4 border-t border-border bg-card/80 flex flex-row justify-between items-center gap-2 shrink-0">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(s => s - 1) : onOpenChange(false)}
            disabled={loading} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4 mr-1" />{step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6">
              Next Step <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleCompleteSetup} disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 shadow-lg shadow-emerald-600/20">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting up...</> : <><ShieldCheck className="w-4 h-4 mr-2" />Start Free Trial & Activate</>}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


