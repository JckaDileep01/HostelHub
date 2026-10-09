'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, Calendar, Repeat, ShieldCheck } from 'lucide-react';
import Script from 'next/script';

interface TenantRentCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenantId: string;
  hostelId: string;
  roomNumber: string;
  amount: number;
  month: string;
  year: number;
  onSuccess?: () => void;
}

export function TenantRentCheckout({
  open,
  onOpenChange,
  tenantId,
  hostelId,
  roomNumber,
  amount,
  month,
  year,
  onSuccess
}: TenantRentCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAutoPay, setIsAutoPay] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const response = await fetch('/api/rent/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          hostelId,
          roomNumber,
          month,
          year,
          amount,
          isAutoPay
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        amount: data.amount * 100,
        currency: data.currency,
        name: 'Hostelhood Rent',
        description: `Rent for ${month} ${year} - Room ${roomNumber}`,
        order_id: data.orderId,
        handler: function (response: any) {
          // Payment successful (webhook will handle DB updates and PDF)
          toast({
            title: "Payment Successful",
            description: "Your rent receipt is being generated.",
          });
          onOpenChange(false);
          if (onSuccess) onSuccess();
        },
        prefill: {
          name: "Tenant Name", // Ideally fetched from context
          email: "tenant@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#4F46E5" // Indigo 600
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        toast({
          title: "Payment Failed",
          description: response.error.description,
          variant: "destructive",
        });
      });
      rzp.open();

    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="h-5 w-5 text-indigo-400" />
              Pay Rent
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Secure payment via Razorpay. 100% of your payment goes directly to the hostel owner.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Rent Period</span>
                  <span className="font-medium text-white flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    {month} {year}
                  </span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Room</span>
                  <span className="font-medium text-white">#{roomNumber}</span>
               </div>
               <div className="border-t border-slate-700/50 pt-3 flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Total Amount</span>
                  <span className="text-xl font-bold text-emerald-400">₹{amount.toLocaleString('en-IN')}</span>
               </div>
            </div>

            <div className="flex items-center justify-between space-x-2 bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
              <div className="flex flex-col space-y-1">
                <Label htmlFor="autopay" className="text-indigo-300 font-medium flex items-center gap-1.5">
                  <Repeat className="h-3.5 w-3.5" />
                  Enable Monthly AutoPay
                </Label>
                <span className="text-xs text-slate-400 leading-tight">
                  Automatically deduct rent on the due date every month via UPI eMandate.
                </span>
              </div>
              <Switch
                id="autopay"
                checked={isAutoPay}
                onCheckedChange={setIsAutoPay}
                className="data-[state=checked]:bg-indigo-500"
              />
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Secured by Razorpay • Zero Extra Fees
            </div>
          </div>

          <DialogFooter className="sm:justify-stretch">
            <Button 
              onClick={handlePayment} 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-6 text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Initializing Secure Checkout...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')} Now`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
