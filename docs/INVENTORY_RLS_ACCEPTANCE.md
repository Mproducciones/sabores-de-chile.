# Criterios de aceptación: inventario multi-restaurante

Este documento define qué debe verificarse antes de conectar el panel de inventario a datos reales. No sustituye una migración SQL aplicada ni una prueba en un proyecto Supabase.

## Modelo mínimo esperado

- `restaurants`: nombre, propietario y fecha de creación.
- `restaurant_members`: relación usuario-restaurante y rol (`owner`, `manager`, `staff`).
- `inventory_items`: ingrediente, categoría, cantidad, unidad, mínimo, días estimados de frescura y costo unitario.
- `inventory_movements`: historial append-only de ajustes, entradas, salidas y mermas.
- `promotion_drafts`: borradores de promoción asociados a un restaurante.
- Todas las tablas con datos de un restaurante deben tener `restaurant_id`, claves foráneas e índices de consulta por restaurante.

## Reglas de seguridad obligatorias

1. Habilitar Row Level Security (RLS) en todas las tablas que contienen datos de negocio.
2. Un usuario autenticado solo puede leer y modificar datos de restaurantes donde tenga una membresía válida.
3. La creación de un restaurante debe crear una membresía inicial de propietario de forma atómica.
4. No confiar en el `restaurant_id` enviado por el navegador: las políticas deben comprobar la membresía en la base de datos.
5. Un usuario no puede cambiar su propio rol ni agregarse a otro restaurante.
6. El historial de movimientos debe ser de solo inserción para usuarios de la aplicación; no permitir que el cliente modifique o borre movimientos existentes.
7. Las inserciones de movimientos deben comprobar que el ingrediente pertenece al mismo restaurante y que el actor es el usuario autenticado.
8. Validar en la base de datos cantidades, mínimos, costos y descuentos; no depender únicamente de validaciones de React.
9. La clave `service_role` nunca debe llegar al navegador ni guardarse como variable `VITE_*`.
10. No activar modo nube si faltan las variables públicas de Supabase o si la migración no se ha aplicado correctamente.

## Matriz de pruebas antes de producción

Preparar dos usuarios de prueba independientes: Ana, miembro del restaurante A; y Bruno, miembro del restaurante B.

| Prueba | Resultado esperado |
|---|---|
| Ana consulta inventario del restaurante A | Solo recibe ingredientes de A |
| Bruno consulta inventario del restaurante B | Solo recibe ingredientes de B |
| Ana intenta leer un ingrediente de B por su ID | No recibe el registro |
| Ana intenta insertar un ingrediente con el ID del restaurante B | La base de datos lo rechaza |
| Ana intenta insertar un movimiento para un ingrediente de B | La base de datos lo rechaza |
| Ana intenta registrar un movimiento con actor_id de Bruno | La base de datos lo rechaza |
| Ana intenta editar o borrar un movimiento histórico | La base de datos lo rechaza |
| Usuario sin sesión consulta tablas protegidas | No obtiene datos privados |
| Usuario crea un restaurante | Se crea exactamente una membresía owner para ese usuario |
| Usuario intenta asignarse rol owner en otro restaurante | La base de datos lo rechaza |
| Cantidad, mínimo, costo o descuento fuera de rango | La base de datos rechaza la operación |
| Sesión expirada mientras se guarda un cambio | La interfaz muestra error y no anuncia éxito |

## Orden de activación

1. Crear o seleccionar el proyecto Supabase.
2. Revisar y aplicar la migración de esquema y políticas RLS en un entorno de prueba.
3. Ejecutar la matriz de aislamiento con dos usuarios distintos.
4. Configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Preview de Vercel.
5. Conectar la interfaz a `src/lib/inventory.js` solo después de verificar el esquema real y sus políticas.
6. Probar creación de cuenta, confirmación de correo, inicio y cierre de sesión, creación de restaurante, alta/ajuste de ingredientes y borradores.
7. Promover a producción después de una revisión funcional y de seguridad.

## Estado actual

La pantalla de inventario sigue en modo demostración y conserva datos en el almacenamiento local del navegador. La capa `src/lib/inventory.js` es una base de acceso a datos, pero aún no está conectada a la pantalla. No se ha aplicado una migración en Supabase ni se ha validado el aislamiento en vivo. Mantener estas limitaciones visibles hasta que las pruebas anteriores pasen.
