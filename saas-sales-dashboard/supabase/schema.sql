-- Create extension for UUIDs if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COMPANIES TABLE
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free',
    settings JSONB NOT NULL DEFAULT '{
        "currency": "USD",
        "theme_color": "#6366f1",
        "logo_url": null,
        "fiscal_year_start": 1
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. USERS PROFILE TABLE (Linked to auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SALES UPLOADS
CREATE TABLE public.sales_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    filename TEXT NOT NULL,
    row_count INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. SALES RECORDS
CREATE TABLE public.sales_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    upload_id UUID NOT NULL REFERENCES public.sales_uploads(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    revenue NUMERIC(15, 2) NOT NULL,
    cost NUMERIC(15, 2) NOT NULL,
    customer TEXT NOT NULL,
    region TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AUDIT LOGS
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'CSV_UPLOAD', 'USER_INVITE', 'SETTINGS_UPDATE'
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER HELPER FUNCTION TO GET CURRENT USER'S COMPANY ID
-- Using security definer allows bypassing RLS for this specific query to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID SECURITY DEFINER AS $$
BEGIN
    RETURN (SELECT company_id FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- SECURITY DEFINER HELPER TO GET CURRENT USER'S ROLE
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT SECURITY DEFINER AS $$
BEGIN
    RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql;

-- =========================================================================
-- RLS POLICIES
-- =========================================================================

-- COMPANIES POLICIES
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (id = public.get_user_company_id());

CREATE POLICY "Admins can update their own company settings" ON public.companies
    FOR UPDATE USING (
        id = public.get_user_company_id() 
        AND public.get_user_role() = 'admin'
    );

-- USERS POLICIES
CREATE POLICY "Users can view teammates" ON public.users
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can manage user profiles" ON public.users
    FOR ALL USING (
        company_id = public.get_user_company_id() 
        AND public.get_user_role() = 'admin'
    );

-- SALES UPLOADS POLICIES
CREATE POLICY "Users can view sales uploads" ON public.sales_uploads
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Analysts and Admins can insert sales uploads" ON public.sales_uploads
    FOR INSERT WITH CHECK (
        company_id = public.get_user_company_id()
        AND public.get_user_role() IN ('admin', 'analyst')
    );

CREATE POLICY "Admins can delete uploads" ON public.sales_uploads
    FOR DELETE USING (
        company_id = public.get_user_company_id()
        AND public.get_user_role() = 'admin'
    );

-- SALES RECORDS POLICIES
CREATE POLICY "Users can view sales records" ON public.sales_records
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Analysts and Admins can insert sales records" ON public.sales_records
    FOR INSERT WITH CHECK (
        company_id = public.get_user_company_id()
        AND public.get_user_role() IN ('admin', 'analyst')
    );

CREATE POLICY "Admins can delete sales records" ON public.sales_records
    FOR DELETE USING (
        company_id = public.get_user_company_id()
        AND public.get_user_role() = 'admin'
    );

-- AUDIT LOGS POLICIES
CREATE POLICY "Users can view audit logs" ON public.audit_logs
    FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "System/Users can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (company_id = public.get_user_company_id());
