/*
# Hostel Management Application - Core Schema

## Overview
Multi-tenant hostel management system with role-based access control.
Supports 4 user roles: super_admin, hostel_owner, caretaker, tenant.

## New Tables

1. **profiles** - Extends auth.users with role and hostel association
2. **hostels** - Hostel property records
3. **floors** - Floor structure within a hostel
4. **rooms** - Individual rooms with type and status
5. **tenants** - Tenant records (CRM)
6. **beds** - Individual bed slots within rooms (references tenants)
7. **invoices** - Monthly billing invoices
8. **payments** - Payment records
9. **complaints** - Tenant complaint tickets
10. **maintenance_tasks** - Room/bed cleaning and maintenance
11. **ai_call_logs** - AI voice agent call records
12. **staff_members** - Caretaker/warden staff accounts

## Security
- RLS enabled on ALL tables
- Policies scoped to authenticated users with ownership checks
- Helper SECURITY DEFINER functions for role/hostel checks
- Auto-create profile on signup via trigger
- Storage bucket for KYC documents
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============ ENUM TYPES ============
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('super_admin', 'hostel_owner', 'caretaker', 'tenant'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE room_status AS ENUM ('vacant', 'occupied', 'maintenance'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE bed_status AS ENUM ('vacant', 'occupied', 'maintenance'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE room_type AS ENUM ('single', 'double', 'triple'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'on_leave'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE invoice_status AS ENUM ('pending', 'partial', 'paid', 'overdue'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'bank_transfer', 'razorpay', 'stripe'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE complaint_status AS ENUM ('open', 'in_progress', 'resolved', 'closed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maintenance_task_type AS ENUM ('cleaning', 'repair', 'inspection'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE maintenance_status AS ENUM ('pending', 'in_progress', 'completed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE ai_call_status AS ENUM ('scheduled', 'in_progress', 'promised_to_pay', 'call_failed', 'escalated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE staff_role AS ENUM ('caretaker', 'warden'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ TABLES (order matters for FK references) ============

-- Hostels (no FK deps)
CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  city text,
  state text,
  total_floors int DEFAULT 1,
  total_rooms int DEFAULT 0,
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_day int DEFAULT 1,
  currency text DEFAULT 'INR',
  voice_ai_provider text DEFAULT 'none',
  voice_ai_config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles (depends on hostels)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'hostel_owner',
  phone text,
  hostel_id uuid REFERENCES hostels(id) ON DELETE SET NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Floors (depends on hostels)
CREATE TABLE IF NOT EXISTS floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  floor_number int NOT NULL,
  name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hostel_id, floor_number)
);

-- Rooms (depends on hostels, floors)
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES floors(id) ON DELETE SET NULL,
  room_number text NOT NULL,
  room_type room_type DEFAULT 'single',
  capacity int DEFAULT 1,
  monthly_rent numeric(12,2) DEFAULT 0,
  status room_status DEFAULT 'vacant',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(hostel_id, room_number)
);

-- Tenants (depends on hostels, auth.users) -- must exist before beds
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  email text,
  emergency_contact_name text,
  emergency_contact_phone text,
  id_proof_type text DEFAULT 'aadhaar',
  id_proof_url text,
  agreement_start date,
  agreement_end date,
  security_deposit numeric(12,2) DEFAULT 0,
  monthly_rent numeric(12,2) DEFAULT 0,
  rent_due_day int DEFAULT 1,
  status tenant_status DEFAULT 'active',
  assigned_bed_id uuid, -- forward reference, FK added after beds
  pause_ai_calls boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Beds (depends on rooms, tenants)
CREATE TABLE IF NOT EXISTS beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_label text NOT NULL,
  status bed_status DEFAULT 'vacant',
  tenant_id uuid REFERENCES tenants(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(room_id, bed_label)
);

-- Now add the FK from tenants.assigned_bed_id to beds
DO $$ BEGIN
  ALTER TABLE tenants ADD CONSTRAINT tenants_assigned_bed_id_fkey
    FOREIGN KEY (assigned_bed_id) REFERENCES beds(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Invoices (depends on hostels, tenants)
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  billing_month int NOT NULL,
  billing_year int NOT NULL,
  amount numeric(12,2) NOT NULL,
  amount_paid numeric(12,2) DEFAULT 0,
  due_date date NOT NULL,
  status invoice_status DEFAULT 'pending',
  payment_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments (depends on invoices, tenants, hostels, auth.users)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  recorded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  transaction_id text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Complaints (depends on hostels, tenants)
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text DEFAULT 'other',
  status complaint_status DEFAULT 'open',
  priority complaint_priority DEFAULT 'medium',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Maintenance Tasks (depends on hostels, rooms, beds, auth.users)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  bed_id uuid REFERENCES beds(id) ON DELETE SET NULL,
  task_type maintenance_task_type DEFAULT 'cleaning',
  status maintenance_status DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- AI Call Logs (depends on hostels, tenants, invoices)
CREATE TABLE IF NOT EXISTS ai_call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  call_status ai_call_status DEFAULT 'scheduled',
  provider text DEFAULT 'vapi',
  provider_call_id text,
  tenant_name text,
  amount_due numeric(12,2) DEFAULT 0,
  days_overdue int DEFAULT 0,
  payment_link text,
  promised_pay_date date,
  call_duration_sec int,
  call_transcript text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff Members (depends on hostels, auth.users)
CREATE TABLE IF NOT EXISTS staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role staff_role NOT NULL DEFAULT 'caretaker',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(hostel_id, user_id)
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_hostels_owner ON hostels(owner_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hostel ON profiles(hostel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_hostel ON rooms(hostel_id);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor_id);
CREATE INDEX IF NOT EXISTS idx_beds_room ON beds(room_id);
CREATE INDEX IF NOT EXISTS idx_beds_tenant ON beds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_hostel ON tenants(hostel_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_invoices_hostel ON invoices(hostel_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_hostel ON complaints(hostel_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_room ON maintenance_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_ai_calls_hostel ON ai_call_logs(hostel_id);
CREATE INDEX IF NOT EXISTS idx_ai_calls_tenant ON ai_call_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_calls_status ON ai_call_logs(call_status);
CREATE INDEX IF NOT EXISTS idx_staff_hostel ON staff_members(hostel_id);

-- ============ HELPER FUNCTIONS (SECURITY DEFINER) ============

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_user_hostel_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT hostel_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_hostel_staff(check_hostel_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_members WHERE hostel_id = check_hostel_id AND user_id = auth.uid() AND active = true
  ) OR EXISTS (
    SELECT 1 FROM hostels WHERE id = check_hostel_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION owns_hostel(check_hostel_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM hostels WHERE id = check_hostel_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- ============ RLS ============
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE beds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============

-- HOSTELS
DROP POLICY IF EXISTS "hostels_select" ON hostels;
CREATE POLICY "hostels_select" ON hostels FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR get_user_role() = 'super_admin' OR is_hostel_staff(id));
DROP POLICY IF EXISTS "hostels_insert" ON hostels;
CREATE POLICY "hostels_insert" ON hostels FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
DROP POLICY IF EXISTS "hostels_update" ON hostels;
CREATE POLICY "hostels_update" ON hostels FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR get_user_role() = 'super_admin')
  WITH CHECK (owner_id = auth.uid() OR get_user_role() = 'super_admin');
DROP POLICY IF EXISTS "hostels_delete" ON hostels;
CREATE POLICY "hostels_delete" ON hostels FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR get_user_role() = 'super_admin');

-- PROFILES
DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR get_user_role() = 'super_admin' OR is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
DROP POLICY IF EXISTS "profiles_update" ON profiles;
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR get_user_role() = 'super_admin')
  WITH CHECK (id = auth.uid() OR get_user_role() = 'super_admin');

-- FLOORS
DROP POLICY IF EXISTS "floors_select" ON floors;
CREATE POLICY "floors_select" ON floors FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "floors_insert" ON floors;
CREATE POLICY "floors_insert" ON floors FOR INSERT TO authenticated
  WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "floors_update" ON floors;
CREATE POLICY "floors_update" ON floors FOR UPDATE TO authenticated
  USING (owns_hostel(hostel_id)) WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "floors_delete" ON floors;
CREATE POLICY "floors_delete" ON floors FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- ROOMS
DROP POLICY IF EXISTS "rooms_select" ON rooms;
CREATE POLICY "rooms_select" ON rooms FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "rooms_insert" ON rooms;
CREATE POLICY "rooms_insert" ON rooms FOR INSERT TO authenticated
  WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "rooms_update" ON rooms;
CREATE POLICY "rooms_update" ON rooms FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "rooms_delete" ON rooms;
CREATE POLICY "rooms_delete" ON rooms FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- BEDS
DROP POLICY IF EXISTS "beds_select" ON beds;
CREATE POLICY "beds_select" ON beds FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = beds.room_id AND is_hostel_staff(rooms.hostel_id)));
DROP POLICY IF EXISTS "beds_insert" ON beds;
CREATE POLICY "beds_insert" ON beds FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = beds.room_id AND owns_hostel(rooms.hostel_id)));
DROP POLICY IF EXISTS "beds_update" ON beds;
CREATE POLICY "beds_update" ON beds FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = beds.room_id AND is_hostel_staff(rooms.hostel_id)))
  WITH CHECK (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = beds.room_id AND is_hostel_staff(rooms.hostel_id)));
DROP POLICY IF EXISTS "beds_delete" ON beds;
CREATE POLICY "beds_delete" ON beds FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM rooms WHERE rooms.id = beds.room_id AND owns_hostel(rooms.hostel_id)));

-- TENANTS
DROP POLICY IF EXISTS "tenants_select" ON tenants;
CREATE POLICY "tenants_select" ON tenants FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id) OR user_id = auth.uid());
DROP POLICY IF EXISTS "tenants_insert" ON tenants;
CREATE POLICY "tenants_insert" ON tenants FOR INSERT TO authenticated
  WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "tenants_update" ON tenants;
CREATE POLICY "tenants_update" ON tenants FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "tenants_delete" ON tenants;
CREATE POLICY "tenants_delete" ON tenants FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- INVOICES
DROP POLICY IF EXISTS "invoices_select" ON invoices;
CREATE POLICY "invoices_select" ON invoices FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id) OR EXISTS (SELECT 1 FROM tenants WHERE tenants.id = invoices.tenant_id AND tenants.user_id = auth.uid()));
DROP POLICY IF EXISTS "invoices_insert" ON invoices;
CREATE POLICY "invoices_insert" ON invoices FOR INSERT TO authenticated
  WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "invoices_update" ON invoices;
CREATE POLICY "invoices_update" ON invoices FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "invoices_delete" ON invoices;
CREATE POLICY "invoices_delete" ON invoices FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- PAYMENTS
DROP POLICY IF EXISTS "payments_select" ON payments;
CREATE POLICY "payments_select" ON payments FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id) OR EXISTS (SELECT 1 FROM tenants WHERE tenants.id = payments.tenant_id AND tenants.user_id = auth.uid()));
DROP POLICY IF EXISTS "payments_insert" ON payments;
CREATE POLICY "payments_insert" ON payments FOR INSERT TO authenticated
  WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "payments_update" ON payments;
CREATE POLICY "payments_update" ON payments FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "payments_delete" ON payments;
CREATE POLICY "payments_delete" ON payments FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- COMPLAINTS
DROP POLICY IF EXISTS "complaints_select" ON complaints;
CREATE POLICY "complaints_select" ON complaints FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id) OR EXISTS (SELECT 1 FROM tenants WHERE tenants.id = complaints.tenant_id AND tenants.user_id = auth.uid()));
DROP POLICY IF EXISTS "complaints_insert" ON complaints;
CREATE POLICY "complaints_insert" ON complaints FOR INSERT TO authenticated
  WITH CHECK (is_hostel_staff(hostel_id) OR EXISTS (SELECT 1 FROM tenants WHERE tenants.id = complaints.tenant_id AND tenants.user_id = auth.uid()));
DROP POLICY IF EXISTS "complaints_update" ON complaints;
CREATE POLICY "complaints_update" ON complaints FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "complaints_delete" ON complaints;
CREATE POLICY "complaints_delete" ON complaints FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- MAINTENANCE
DROP POLICY IF EXISTS "maintenance_select" ON maintenance_tasks;
CREATE POLICY "maintenance_select" ON maintenance_tasks FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "maintenance_insert" ON maintenance_tasks;
CREATE POLICY "maintenance_insert" ON maintenance_tasks FOR INSERT TO authenticated
  WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "maintenance_update" ON maintenance_tasks;
CREATE POLICY "maintenance_update" ON maintenance_tasks FOR UPDATE TO authenticated
  USING (is_hostel_staff(hostel_id)) WITH CHECK (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "maintenance_delete" ON maintenance_tasks;
CREATE POLICY "maintenance_delete" ON maintenance_tasks FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- AI CALL LOGS
DROP POLICY IF EXISTS "ai_calls_select" ON ai_call_logs;
CREATE POLICY "ai_calls_select" ON ai_call_logs FOR SELECT TO authenticated
  USING (is_hostel_staff(hostel_id));
DROP POLICY IF EXISTS "ai_calls_insert" ON ai_call_logs;
CREATE POLICY "ai_calls_insert" ON ai_call_logs FOR INSERT TO authenticated
  WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "ai_calls_update" ON ai_call_logs;
CREATE POLICY "ai_calls_update" ON ai_call_logs FOR UPDATE TO authenticated
  USING (owns_hostel(hostel_id)) WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "ai_calls_delete" ON ai_call_logs;
CREATE POLICY "ai_calls_delete" ON ai_call_logs FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- STAFF MEMBERS
DROP POLICY IF EXISTS "staff_select" ON staff_members;
CREATE POLICY "staff_select" ON staff_members FOR SELECT TO authenticated
  USING (owns_hostel(hostel_id) OR user_id = auth.uid() OR get_user_role() = 'super_admin');
DROP POLICY IF EXISTS "staff_insert" ON staff_members;
CREATE POLICY "staff_insert" ON staff_members FOR INSERT TO authenticated
  WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "staff_update" ON staff_members;
CREATE POLICY "staff_update" ON staff_members FOR UPDATE TO authenticated
  USING (owns_hostel(hostel_id)) WITH CHECK (owns_hostel(hostel_id));
DROP POLICY IF EXISTS "staff_delete" ON staff_members;
CREATE POLICY "staff_delete" ON staff_members FOR DELETE TO authenticated
  USING (owns_hostel(hostel_id));

-- ============ TRIGGERS ============

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), COALESCE(NEW.raw_user_meta_data->>'role', 'hostel_owner')::user_role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trigger_hostels_updated ON hostels;
CREATE TRIGGER trigger_hostels_updated BEFORE UPDATE ON hostels FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_profiles_updated ON profiles;
CREATE TRIGGER trigger_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_rooms_updated ON rooms;
CREATE TRIGGER trigger_rooms_updated BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_tenants_updated ON tenants;
CREATE TRIGGER trigger_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_invoices_updated ON invoices;
CREATE TRIGGER trigger_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trigger_ai_calls_updated ON ai_call_logs;
CREATE TRIGGER trigger_ai_calls_updated BEFORE UPDATE ON ai_call_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "kyc_upload" ON storage.objects;
CREATE POLICY "kyc_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-documents');
DROP POLICY IF EXISTS "kyc_read_own" ON storage.objects;
CREATE POLICY "kyc_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-documents' AND owner = auth.uid());
DROP POLICY IF EXISTS "kyc_update_own" ON storage.objects;
CREATE POLICY "kyc_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc-documents' AND owner = auth.uid());
DROP POLICY IF EXISTS "kyc_delete_own" ON storage.objects;
CREATE POLICY "kyc_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'kyc-documents' AND owner = auth.uid());
/*
# Harden HostelHub access controls

## Overview
Tightens the existing multi-tenant authorization model without deleting or renaming user data.

## Modified database functions
- Locks the search path for all public helper and trigger functions.
- Removes anonymous execution from authorization helpers.
- Keeps authenticated execution only where policies need it.

## Modified permissions
- Profiles can no longer be edited wholesale by an account owner.
- Authenticated users may update only their own editable name and phone fields.
- Role, hostel assignment, active status, email, and timestamps remain protected.

## Storage security
- KYC uploads must be stored below the authenticated user's folder.
- KYC documents remain private and readable only by their owner.

## Important notes
1. No tables, columns, or existing rows are removed.
2. Existing hostel operations continue to use the same authenticated policies.
3. KYC object paths now follow `user-id/...` ownership boundaries.
*/

ALTER FUNCTION public.get_user_role() SET search_path = public;
ALTER FUNCTION public.get_user_hostel_id() SET search_path = public;
ALTER FUNCTION public.is_hostel_staff(uuid) SET search_path = public;
ALTER FUNCTION public.owns_hostel(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;

REVOKE ALL ON FUNCTION public.get_user_role() FROM anon;
REVOKE ALL ON FUNCTION public.get_user_hostel_id() FROM anon;
REVOKE ALL ON FUNCTION public.is_hostel_staff(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.owns_hostel(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_hostel_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_hostel_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.owns_hostel(uuid) TO authenticated;

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "kyc_upload" ON storage.objects;
CREATE POLICY "kyc_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_read_own" ON storage.objects;
CREATE POLICY "kyc_read_own" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_update_own" ON storage.objects;
CREATE POLICY "kyc_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "kyc_delete_own" ON storage.objects;
CREATE POLICY "kyc_delete_own" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
/*
# Create owner starter workspace

## Overview
Adds a safe first-run setup function so a newly registered hostel owner can immediately inspect the product UI.

## New function
- `create_owner_workspace(p_name text)` creates one hostel for the authenticated owner.
- Creates three floors, twelve rooms, and two beds per room.
- Links the new hostel to the caller's profile.
- Returns the created hostel ID.

## Security
- Function runs with a fixed public search path.
- Caller is always taken from `auth.uid()`; no owner ID is accepted from the browser.
- Only authenticated hostel owners may call it.
- A second hostel cannot be created through this first-run function.

## Important notes
1. No existing tables, columns, or data are removed.
2. This creates starter structure only; it does not create fake tenants or financial records.
3. Owners can later replace the starter name and manage the structure from the app.
*/

CREATE OR REPLACE FUNCTION public.create_owner_workspace(p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_hostel_id uuid;
  v_floor_id uuid;
  v_room_id uuid;
  v_floor int;
  v_room int;
  v_bed int;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_user AND role = 'hostel_owner' AND active = true) THEN
    RAISE EXCEPTION 'Only hostel owners can create a workspace';
  END IF;

  SELECT id INTO v_hostel_id FROM hostels WHERE owner_id = v_user ORDER BY created_at LIMIT 1;
  IF v_hostel_id IS NOT NULL THEN
    RETURN v_hostel_id;
  END IF;

  INSERT INTO hostels (name, owner_id, total_floors, total_rooms)
  VALUES (COALESCE(NULLIF(trim(p_name), ''), 'My Hostel'), v_user, 3, 12)
  RETURNING id INTO v_hostel_id;

  UPDATE profiles SET hostel_id = v_hostel_id WHERE id = v_user;

  FOR v_floor IN 1..3 LOOP
    INSERT INTO floors (hostel_id, floor_number, name)
    VALUES (v_hostel_id, v_floor, 'Floor ' || v_floor)
    RETURNING id INTO v_floor_id;

    FOR v_room IN 1..4 LOOP
      INSERT INTO rooms (hostel_id, floor_id, room_number, room_type, capacity, monthly_rent, status)
      VALUES (
        v_hostel_id,
        v_floor_id,
        v_floor || LPAD(v_room::text, 2, '0'),
        CASE WHEN v_room % 3 = 1 THEN 'single'::room_type WHEN v_room % 3 = 2 THEN 'double'::room_type ELSE 'triple'::room_type END,
        CASE WHEN v_room % 3 = 1 THEN 1 WHEN v_room % 3 = 2 THEN 2 ELSE 3 END,
        CASE WHEN v_room % 3 = 1 THEN 9000 ELSE 7500 END,
        'vacant'
      )
      RETURNING id INTO v_room_id;

      FOR v_bed IN 1..2 LOOP
        INSERT INTO beds (room_id, bed_label, status)
        VALUES (v_room_id, 'Bed ' || v_bed, 'vacant');
      END LOOP;
    END LOOP;
  END LOOP;

  RETURN v_hostel_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_owner_workspace(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_owner_workspace(text) TO authenticated;
ALTER TABLE hostels 
ADD COLUMN IF NOT EXISTS amenities jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS food_details text;
-- ============================================================
-- Razorpay Payment Engine Migration
-- Hostelhood Platform — Zero-Fee Rent Collection + AutoPay
-- ============================================================

-- 1. Owner Razorpay Linked Accounts
CREATE TABLE IF NOT EXISTS owner_payment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
    razorpay_account_id VARCHAR(255) UNIQUE NOT NULL,
    bank_account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(15) NOT NULL,
    beneficiary_name VARCHAR(150) NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Owner SaaS Platform Subscriptions
CREATE TABLE IF NOT EXISTS owner_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    razorpay_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CREATED', -- ACTIVE, HALTED, CANCELLED
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tenant Rent Ledger & Payment Transactions
CREATE TABLE IF NOT EXISTS rent_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    hostel_id UUID REFERENCES hostels(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    rent_month VARCHAR(20) NOT NULL,
    rent_year INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50),
    bank_utr VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    is_autopay BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, rent_month, rent_year)
);

-- 4. Generated Payment Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(100) UNIQUE NOT NULL, -- RCPT-2026-OCT-XXXX
    transaction_id UUID REFERENCES rent_transactions(id) ON DELETE CASCADE,
    hostel_name VARCHAR(255) NOT NULL,
    hostel_address TEXT NOT NULL,
    hostel_phone VARCHAR(20) NOT NULL,
    hostel_gstin VARCHAR(50),
    tenant_name VARCHAR(255) NOT NULL,
    tenant_phone VARCHAR(20) NOT NULL,
    tenant_email VARCHAR(255),
    room_number VARCHAR(50) NOT NULL,
    rent_month VARCHAR(20) NOT NULL,
    rent_year INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    razorpay_payment_id VARCHAR(255) NOT NULL,
    bank_utr VARCHAR(255),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE owner_payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Owners can manage their own payment accounts
CREATE POLICY "owner_payment_accounts_owner_access" ON owner_payment_accounts
    FOR ALL USING (
        hostel_owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Owners can view their own subscriptions
CREATE POLICY "owner_subscriptions_owner_access" ON owner_subscriptions
    FOR ALL USING (
        hostel_owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Tenants can view their own transactions; owners can view all for their hostel
CREATE POLICY "rent_transactions_tenant_access" ON rent_transactions
    FOR SELECT USING (
        tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()) OR
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "rent_transactions_insert" ON rent_transactions
    FOR INSERT WITH CHECK (
        hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid()) OR
        tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Allow server (service role) to update transactions via webhook
CREATE POLICY "rent_transactions_service_update" ON rent_transactions
    FOR UPDATE USING (true);

-- Receipt access
CREATE POLICY "payment_receipts_access" ON payment_receipts
    FOR SELECT USING (
        transaction_id IN (
            SELECT id FROM rent_transactions WHERE
                tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()) OR
                hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

CREATE POLICY "payment_receipts_service_insert" ON payment_receipts
    FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rent_transactions_tenant ON rent_transactions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_hostel ON rent_transactions(hostel_id);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_status ON rent_transactions(status);
CREATE INDEX IF NOT EXISTS idx_rent_transactions_order ON rent_transactions(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_transaction ON payment_receipts(transaction_id);
CREATE INDEX IF NOT EXISTS idx_owner_payment_accounts_hostel ON owner_payment_accounts(hostel_id);
-- -------------------------------------------------------------------------------
-- MIGRATION: Daily Expenses & Operational Ledger Module
-- Created: 2026-10-08
-- Description: Adds the `expenses` table so hostel owners and caretakers can
--              log day-wise operational expenses (electricity, groceries, repairs,
--              salaries, etc.) and maintain a paperless financial ledger.
-- -------------------------------------------------------------------------------

-- 1. Create the expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id                   UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id            UUID          NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  expense_title        VARCHAR(255)  NOT NULL,
  category_type        VARCHAR(50)   NOT NULL DEFAULT 'CUSTOM',
  custom_category_name VARCHAR(100),
  amount               DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_method       VARCHAR(20)   NOT NULL DEFAULT 'CASH',
  expense_date         DATE          NOT NULL DEFAULT CURRENT_DATE,
  logged_by_role       VARCHAR(20)   NOT NULL DEFAULT 'OWNER',
  logged_by_user_id    UUID          REFERENCES auth.users(id),
  receipt_url          TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS expenses_hostel_id_idx    ON expenses (hostel_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx         ON expenses (expense_date DESC);
CREATE INDEX IF NOT EXISTS expenses_category_idx     ON expenses (category_type);
CREATE INDEX IF NOT EXISTS expenses_method_idx       ON expenses (payment_method);

-- 3. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_expenses_updated_at ON expenses;
CREATE TRIGGER trg_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_expenses_updated_at();

-- 4. Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 5. Owner full access
CREATE POLICY "expenses_owner_all" ON expenses
  FOR ALL
  USING (
    hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    hostel_id IN (SELECT id FROM hostels WHERE owner_id = auth.uid())
  );

-- 6. Caretaker: can read
CREATE POLICY "expenses_caretaker_select" ON expenses
  FOR SELECT
  USING (
    hostel_id IN (SELECT hostel_id FROM profiles WHERE id = auth.uid() AND role = 'caretaker')
  );

-- 7. Caretaker: can insert
CREATE POLICY "expenses_caretaker_insert" ON expenses
  FOR INSERT
  WITH CHECK (
    hostel_id IN (SELECT hostel_id FROM profiles WHERE id = auth.uid() AND role = 'caretaker')
  );
