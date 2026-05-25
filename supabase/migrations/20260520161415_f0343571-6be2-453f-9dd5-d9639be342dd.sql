
-- Drop authenticated-only policies and create permissive ones for anon access
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
           WHERE schemaname='public' AND tablename IN ('transacciones','ajustes_netting','configuracion')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "public_all_transacciones" ON public.transacciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_ajustes_netting" ON public.ajustes_netting FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all_configuracion" ON public.configuracion FOR ALL USING (true) WITH CHECK (true);
