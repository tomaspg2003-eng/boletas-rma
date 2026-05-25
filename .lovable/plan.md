## Objetivo

Replicar en Lovable las vistas del RMA Tickets que ya tienes en Vercel (screenshots adjuntos), conectadas a la base de datos que ya importamos (82 transacciones, ajustes_netting, configuracion).

## Cambios de layout (sidebar)

Reordenar `AppSidebar.tsx` para igualar el de Vercel:
- **Top**: logo crest + "RMA Tickets" / "Dashboard" (ya está).
- **Nav**: Overview, Transacciones, Clientes, Partidos, Mensajes, Agenda, **Liquidación** (renombrar "Netting" → "Liquidación").
- **Bottom**: Configuración + botón amarillo "＋ Nueva Entrada" (CTA principal). Quitar el bloque de usuario actual.
- Header global: "Ventas de Boletas / 82 transacciones visibles" + chip ámbar "⚠ N sin cobrar" + selector de año (Todo / 2024 / 2025 / 2026) arriba a la derecha. Esto va en `Topbar.tsx` y filtra todas las vistas.

## Vistas a construir

1. **Overview** (`/`) — 8 KPIs en grid 4×2: Mi Ganancia, Total Ventas, Boletas, Ganancia Bruta, Mi Margen, Por Cobrar, Balance Iker, # Partidos. Debajo: tabla "Comparativa por temporada" (23/24, 24/25, 25/26 con Ventas, Ganancia bruta, Mi parte, Transacciones, Margen). Dos charts: "Mi Ganancia por Partido" (barras horizontales, top 10) e "Ingresos vs Costos" (barras agrupadas, top 8). Recharts.

2. **Transacciones** (`/transacciones`) — Tabla completa: Partido, Cliente, Categoría (badge), Boletas, Venta Total, Ganancia, Mi parte, Recibió (Iker/Tomas badge), Tipo, Fecha, Pagado (toggle ✓/○), acciones. Buscador + botones "Exportar Excel" y "Filtros".

3. **Clientes** (`/clientes`) — Grid de cards (4 columnas): avatar con inicial + color, nombre, # transacciones, Total gastado, Boletas, Última compra, badge estado (Pendiente / Al día). Buscador + toggle grid/lista. Agregado desde `transacciones.cliente`.

4. **Partidos** (`/partidos`) — Dos cards top: "Más rentables" (top 3) y "Menor margen" (top 3). Debajo "Ranking completo": tabla con #, Partido (+ clientes/boletas), Ganancia, Ventas, Boletas, Margen %, # Transacciones, Categorías (badges). Agregado desde `transacciones.partido`.

5. **Mensajes** (`/mensajes`) — Lista vertical de plantillas (cada una en card con icono):
   - Disponibilidad de precios (form: partido, competición, fecha, hora, precios por categoría → textarea generado + copiar).
   - Confirmación de compra · Tomas (select transacción → texto con datos bancarios BBVA → copiar).
   - Confirmación de compra · Iker (select transacción → texto entrega Madrid → copiar).
   - + las otras plantillas que existan (Cobro, Entrega, Agradecimiento).
   Textos exactos los tomo del prototipo de Vercel si me pasas el copy; mientras tanto uso versiones cercanas.

6. **Agenda** (`/agenda`) — Calendario simple con próximos partidos derivados de `transacciones` (placeholder ligero por ahora, lo iteramos después).

7. **Liquidación** (`/liquidacion`, antes `/netting`) — Saldo neto Iker↔Tomás (transacciones + ajustes), tabla de ajustes manuales (form crear/borrar), botón "Liquidar pendientes" que marca `liquidada=true` en lote.

8. **Configuración** (`/config`) — Datos bancarios (Tomas BBVA, Iker), comisiones default, textos de plantillas. Lee/escribe en tabla `configuracion`.

## Paleta (mantener la actual Real Madrid)

Ya definida en `styles.css`: fondo casi negro, acento dorado/ámbar para KPIs y CTAs, badges de color por categoría (Cat 1 ámbar, Cat 1 Premium naranja, Cat 2 Lateral violeta, Cat 2 Fondo azul, Cat 3 violeta-suave). Cards con border sutil `border-white/5` y fondo `bg-card`. Verde para "Iker", violeta para "Tomas".

## Datos

Ya importadas 82 transacciones desde el Excel + balances Iker/Tomas en `ajustes_netting`. Todas las vistas leen de Supabase vía `createServerFn` o cliente directo (RLS público está abierto). Sin trabajo de import adicional.

## Detalles técnicos

- Charts: `recharts` (ya instalado).
- Filtro de año global: estado en context (`YearFilterProvider` en `__root.tsx`), consumido por cada vista.
- Cliente Supabase del browser en cada page con `useQuery` (TanStack Query ya configurado).
- Badges de categoría: helper `getCategoryStyles(cat)` en `lib/categories.ts`.
- "Mi parte" = `ganancia * (1 - comision_pct)`, "Iker debe / Tomas debe" derivado de `quien_recibe` + `pagado` + ajustes.

## Orden de ejecución (1 turno)

1. Sidebar + Topbar (header global con filtro año + chip "sin cobrar").
2. Overview con los 8 KPIs + tabla temporadas + 2 charts.
3. Transacciones (tabla completa con toggle pagado).
4. Clientes (grid de cards agregadas).
5. Partidos (top 3 + ranking).
6. Mensajes (4-6 plantillas).
7. Liquidación + Configuración.
8. Agenda como placeholder (siguiente turno).

## Preguntas antes de implementar

1. **Textos de Mensajes**: ¿me pasas el copy exacto de cada plantilla (Tomas/Iker, Cobro, Entrega, Agradecimiento) o uso versiones genéricas y luego las ajustas en `/config`?
2. **Agenda**: ¿la dejo como placeholder ahora y la hacemos bien en otro turno, o la quieres ya con calendario funcional?
3. **Categorías**: las 6 que veo son Cat 1, Cat 1 Premium, Cat 2 Lateral, Cat 2 Fondo, Cat 3, VIP. ¿Confirmas o hay más?
