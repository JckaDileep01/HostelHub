'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OwnerBankSetupProps {
  hostelId: string;
  onSuccess?: () => void;
}

export function OwnerBankSetup({ hostelId, onSuccess }: OwnerBankSetupProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    bank_account_number: '',
    confirm_account_number: '',
    ifsc_code: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.bank_account_number !== formData.confirm_account_number) {
      toast({
        title: "Account Mismatch",
        description: "Bank account numbers do not match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/owners/bank-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostel_id: hostelId,
          beneficiary_name: formData.beneficiary_name,
          bank_account_number: formData.bank_account_number,
          ifsc_code: formData.ifsc_code,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup bank account');
      }

      setIsSuccess(true);
      toast({
        title: "Setup Complete",
        description: "Your bank account has been successfully linked for zero-fee rent collection.",
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-emerald-400">Account Linked Successfully</h3>
            <p className="text-sm text-slate-400">
              100% of tenant rent payments will now be transferred directly to your bank account automatically.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Building className="h-5 w-5 text-indigo-400" />
          Zero-Fee Rent Collection Setup
        </CardTitle>
        <CardDescription className="text-slate-400">
          Link your bank account to receive 100% of tenant rent directly. No platform fees are charged on rent.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="beneficiary_name" className="text-slate-300">Beneficiary Name (As per Bank)</Label>
            <Input 
              id="beneficiary_name" 
              name="beneficiary_name"
              required 
              value={formData.beneficiary_name}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_account_number" className="text-slate-300">Account Number</Label>
              <Input 
                id="bank_account_number" 
                name="bank_account_number"
                type="password"
                required 
                value={formData.bank_account_number}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_account_number" className="text-slate-300">Confirm Account Number</Label>
              <Input 
                id="confirm_account_number" 
                name="confirm_account_number"
                type="text"
                required 
                value={formData.confirm_account_number}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ifsc_code" className="text-slate-300">IFSC Code</Label>
            <Input 
              id="ifsc_code" 
              name="ifsc_code"
              required 
              value={formData.ifsc_code}
              onChange={handleChange}
              className="bg-slate-800 border-slate-700 text-white uppercase"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Contact Email</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                required 
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">Contact Phone</Label>
              <Input 
                id="phone" 
                name="phone"
                required 
                value={formData.phone}
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 flex items-start gap-2 mt-4">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              Please double-check your bank details. Incorrect details may lead to failed or delayed rent transfers.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up Account...
              </>
            ) : (
              'Complete Bank Setup'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
