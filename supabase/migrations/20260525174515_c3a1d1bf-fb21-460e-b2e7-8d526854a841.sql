-- Drop the permissive public policies
DROP POLICY IF EXISTS "public_all_transacciones" ON public.transacciones;
DROP POLICY IF EXISTS "public_all_ajustes_netting" ON public.ajustes_netting;
DROP POLICY IF EXISTS "public_all_configuracion" ON public.configuracion;

-- Ensure RLS is enabled (it already is, but make it explicit)
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ajustes_netting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

-- No policies means: anon/authenticated cannot access.
-- The server uses the service_role key which bypasses RLS,
-- so the app continues to work through server functions only.