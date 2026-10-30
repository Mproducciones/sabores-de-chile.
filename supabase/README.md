# Supabase — Sabores de Chile

## Estado

La migración `migrations/202610300001_initial_multi_tenant_schema.sql` define la primera base multi-restaurante. Está versionada en Git, pero **no está aplicada a ningún proyecto Supabase**. No hay credenciales ni proyecto Supabase conectados desde este repositorio.

## Modelo

- `restaurants`: un espacio de datos por restaurante (slug, publicación, ubicación y moneda).
- `restaurant_members`: usuarios y roles por restaurante (`owner`, `manager`, `staff`, `kitchen`).
- `menu_categories` y `menu_items`: carta independiente por restaurante.
- `ingredients`, `menu_item_ingredients`: inventario base y receta/cantidad consumida por plato.
- `inventory_movements`: libro de movimientos; entradas positivas y consumo/merma/ajustes negativos. El stock se calcula sumando movimientos.
- `promotions`: ofertas manuales o sugeridas por inventario, con fechas y estado.
- `orders` y `order_items`: pedidos con datos y precios históricos para que cambios posteriores en la carta no alteren ventas anteriores.

## Seguridad

RLS está habilitado en todas las tablas. Las consultas de carta pública solo ven restaurantes publicados, platos publicados y disponibles y promociones activas dentro de su vigencia. Las operaciones administrativas requieren pertenecer al restaurante y cumplir el rol indicado por la política.

No se permite insertar pedidos anónimos directamente en tablas. El siguiente paso de backend debe implementar una Edge Function o RPC transaccional que:
1. valide restaurante publicado y modalidad de entrega;
2. vuelva a consultar precios y disponibilidad en la base de datos;
3. calcule descuentos, despacho y total en servidor;
4. cree pedido e ítems en una transacción;
5. aplique límites antiabuso y registre idempotencia;
6. descuente ingredientes desde recetas solo cuando el pedido alcance el estado operativo acordado, con protección contra doble descuento.

## Aplicación

1. Crear o seleccionar un proyecto Supabase para desarrollo.
2. Revisar y ejecutar la migración en SQL Editor (o mediante Supabase CLI).
3. Crear el primer restaurante y su usuario propietario mediante un proceso administrativo seguro; no habilitar autoasignación de roles desde el cliente.
4. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en el entorno Preview de Vercel.
5. Implementar autenticación, repositorios de datos y pruebas RLS antes de conectar el panel administrativo.

La clave `service_role` nunca debe exponerse en variables `VITE_*` ni en el navegador.
