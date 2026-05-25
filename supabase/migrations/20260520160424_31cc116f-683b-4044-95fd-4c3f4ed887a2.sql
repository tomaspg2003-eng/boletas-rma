
-- Transacciones
CREATE TABLE public.transacciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "año" integer,
  temporada text,
  partido text,
  cliente text,
  categoria text,
  num_boletas integer DEFAULT 0,
  precio_compra_unit numeric DEFAULT 0,
  precio_compra_tot numeric DEFAULT 0,
  precio_venta_unit numeric DEFAULT 0,
  precio_venta_tot numeric DEFAULT 0,
  ganancia numeric DEFAULT 0,
  comision_pct numeric DEFAULT 0,
  quien_recibe text,
  comision_pp numeric DEFAULT 0,
  tipo_boleta text,
  notas text,
  fecha_pago date,
  pagado boolean DEFAULT false,
  liquidada boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users full access transacciones"
  ON public.transacciones FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX idx_transacciones_created_at ON public.transacciones(created_at DESC);
CREATE INDEX idx_transacciones_año ON public.transacciones("año");

-- Ajustes netting
CREATE TABLE public.ajustes_netting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descripcion text,
  monto numeric DEFAULT 0,
  quien_paga text,
  fecha date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ajustes_netting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users full access ajustes"
  ON public.ajustes_netting FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);

-- Configuración (key/value)
CREATE TABLE public.configuracion (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users full access config"
  ON public.configuracion FOR ALL
  TO authenticated
  USING (true) WITH CHECK (true);
