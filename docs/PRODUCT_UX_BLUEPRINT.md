# Sabores de Chile — mapa integral de producto y UI/UX

## Visión

Sabores de Chile es un ecosistema gastronómico con dos puertas de entrada conectadas:
- **Marketplace central:** descubre locales, compara opciones y compra.
- **Experiencia de cada restaurante:** identidad propia, carta, pedidos, promociones y fidelización.

El restaurante usa además un panel de operación para coordinar pedidos, cocina, inventario, caja y equipo. La plataforma central administra locales, permisos, configuración y métricas globales.

Este documento define el alcance UX antes de seguir conectando módulos técnicos. Los flujos marcados como futuros no deben presentarse como funcionalidad real hasta implementarlos y probarlos.

## Principios de diseño

- Mobile-first, navegación familiar y sensación de app nativa.
- Fotografía de comida grande y realista; no reemplazar fotos con emojis como diseño final.
- Interfaz premium, cálida y minimalista; verde profundo como color funcional, tonos cálidos neutros y acentos discretos.
- Una acción principal por pantalla; evitar paneles saturados.
- Estados explícitos: cargando, vacío, error, sin conexión, éxito y confirmación.
- Accesibilidad: contraste, foco visible, objetivos táctiles cómodos, etiquetas accesibles y reducción de movimiento.
- Precio, disponibilidad, tiempos y restricciones visibles antes de confirmar una compra.
- No enviar notificaciones de cercanía sin permiso claro y controles de frecuencia.
- La vista 3D/AR debe mostrarse como disponible solo para platos con un modelo real compatible; si no, usar foto y etiqueta honesta.
- Nunca mostrar datos demo como si fueran datos reales de un negocio.

## Productos y áreas

### A. Marketplace central (cliente)

1. **Inicio**
   - Ubicación opcional, búsqueda, categorías y colecciones.
   - Restaurantes cercanos, destacados y ofertas vigentes.
   - Permitir explorar sin conceder ubicación; solicitarla cuando aporte valor.
2. **Explorar y buscar**
   - Filtros por tipo de cocina, distancia, precio, horario y modalidad.
   - Ordenamiento transparente; estados sin resultados y filtros fáciles de limpiar.
3. **Ficha del restaurante**
   - Identidad visual, dirección, horarios, modalidades, tiempos estimados y carta.
   - Indicadores de abierto/cerrado con fuente de horario fiable.
4. **Carta y plato**
   - Fotos, descripción, ingredientes, alérgenos informados por el local, precio y modificadores.
   - Vista 3D/AR solo cuando exista un recurso válido y el dispositivo lo soporte.
5. **Carrito y confirmación**
   - Cantidades, opciones, subtotal, cargos, descuentos, dirección o retiro, tiempo estimado.
   - Confirmación antes de enviar; errores recuperables y prevención de pedidos duplicados.
6. **Pedido en curso**
   - Estados confirmados por el backend: recibido, aceptado, preparando, listo, en reparto/retira, completado o cancelado.
7. **Cuenta y fidelización**
   - Historial, favoritos, direcciones, preferencias de notificación y soporte.

### B. App/espacio de marca de cada restaurante

- URL o ruta de marca propia, logo, paleta, portada e historia.
- Carta editable, disponibilidad por plato, variantes y extras.
- Horarios, zonas de despacho, retiro, reservas (si el local las habilita).
- Cupones, combos, puntos o beneficios, sin prometer campañas aún no configuradas.
- Enlaces compartibles y QR de carta.
- La marca puede personalizarse sin duplicar el motor de pedidos ni las reglas de seguridad.

### C. Panel del restaurante

Navegación propuesta, en este orden:
1. **Inicio operativo:** pedidos activos, ventas del día, alertas accionables.
2. **Pedidos:** lista por canal, detalle, aceptación/rechazo y estados.
3. **Cocina:** tablero KDS por etapa y prioridad, tiempos y avisos.
4. **Carta:** platos, precios, modificadores, fotos, disponibilidad y alérgenos.
5. **Inventario:** ingredientes, unidades, mínimos, costos, lotes/vencimiento cuando exista dato fiable, movimientos y mermas.
6. **Recetas y costos:** ingredientes por preparación, costo teórico y margen estimado.
7. **Promociones:** borradores, aprobación, vigencia, condiciones y resultados.
8. **Caja y pagos:** apertura/cierre, medios de pago y conciliación.
9. **Equipo:** invitaciones, roles, permisos y actividad.
10. **Clientes y fidelización:** solo datos autorizados y necesarios.
11. **Reportes:** ventas, productos, desperdicio y márgenes con rango de fechas.
12. **Configuración:** perfil del local, sucursales, horarios, despacho, notificaciones e integraciones.

### D. Superadministración de la plataforma

- Alta, revisión y estado de restaurantes.
- Sucursales, usuarios, roles y permisos globales.
- Configuración de planes y facturación de la plataforma cuando se implemente.
- Supervisión de incidencias, métricas agregadas y auditoría.
- Herramientas de soporte con acceso mínimo y trazabilidad; evitar acceso indiscriminado a datos privados.

### E. Logística y notificaciones

- Definir si el pedido es retiro, despacho del propio local o logística externa.
- Mostrar solo opciones disponibles para la zona y horario.
- Notificaciones de pedido transaccionales separadas de marketing.
- Promociones por cercanía solo con permiso de ubicación y consentimiento de marketing apropiado; controles para pausar, limitar frecuencia y desactivar.
- No inventar ETAs ni afirmar que un repartidor está asignado si no hay integración real.

### F. Experiencia 3D/AR

1. Administrar recursos GLB/GLTF y su relación con cada plato.
2. Validar tamaño, carga, fallback y compatibilidad móvil.
3. Mostrar previsualización 3D dentro de la carta.
4. Ofrecer AR solo con permisos del usuario y soporte del dispositivo.
5. Usar foto estándar como alternativa, sin bloquear la compra.
6. No etiquetar una tarjeta como 3D/AR si no existe un modelo probado.

## Flujos críticos a diseñar primero

### Cliente: descubrir y comprar
Inicio → búsqueda/filtro → restaurante → plato/modificadores → carrito → modalidad/dirección → revisión del total → pago o modalidad disponible → confirmación → seguimiento.

### Restaurante: recibir y preparar
Nuevo pedido → aceptar/rechazar con motivo → cola de cocina → en preparación → listo → retiro/despacho → completar → registro de venta.

### Inventario: prevenir merma
Ingrediente/lote → cantidad y unidad → fecha/estimación de frescura con origen visible → alerta → revisar disponibilidad y recetas → crear borrador de promoción → revisión humana → publicar solo mediante canal integrado → medir resultado y merma.

### Administración de restaurante
Crear cuenta → confirmar correo → crear restaurante → completar perfil → configurar sucursal y horarios → cargar carta → inventario inicial → configurar operación → probar pedido de punta a punta.

## Sistema visual a producir

- Tokens: tipografía, colores, espaciado, radios, sombras, estados y breakpoints.
- Componentes: botones, inputs, navegación móvil, tarjetas de restaurante/plato, chips, filtros, modales, tablas, badges de estado, banners, toasts, skeletons y estados vacíos.
- Plantillas responsive para móvil, tablet y escritorio.
- Patrones de formularios con validación y mensajes útiles.
- Fotografía y recursos visuales con guía de proporciones y tratamiento.
- Diseño de errores, permisos, conexión perdida y recuperación de sesión.

## Orden de implementación

### Fase 1 — UX/UI y arquitectura de navegación
- Auditar todas las pantallas actuales.
- Definir mapa del sitio, roles, recorridos y estados.
- Crear sistema visual consistente y diseños responsive.
- Separar claramente marketplace, espacio del restaurante, panel operativo y superadministración.
- No añadir funciones falsas para que una pantalla parezca terminada.

### Fase 2 — Prototipo navegable
- Construir navegación real entre pantallas prioritarias.
- Usar datos demo identificados como tales.
- Probar recorridos en móvil y escritorio, formularios, vacíos, errores y accesibilidad básica.
- Revisar el prototipo antes de activar backend.

### Fase 3 — Backend seguro
- Autenticación, restaurantes, sucursales y membresías.
- RLS multi-tenant, pruebas de aislamiento y auditoría.
- Conectar inventario, carta y pedidos en orden, con migraciones revisadas.
- Configurar secretos/variables por ambiente y pruebas automáticas.

### Fase 4 — Operación completa
- Cocina/KDS, caja, recetas, movimientos de inventario, promociones y reportes.
- Estados transaccionales e idempotencia de pedidos.
- Pruebas de integración y recuperación de errores.

### Fase 5 — Cliente y marketplace
- Catálogo central, páginas de restaurantes, carrito y seguimiento.
- Pagos solo mediante proveedor real configurado, con estados confirmados por servidor.
- Consentimiento y preferencias de notificaciones.

### Fase 6 — 3D/AR y optimización
- Pipeline de modelos, fallback de fotos, pruebas de rendimiento y compatibilidad.
- Analítica de conversión, rendimiento y accesibilidad.
- Piloto con pocos restaurantes antes de ampliar.

## Criterios para considerar una pantalla lista

- Se entiende la acción principal en pocos segundos.
- Funciona en móvil y escritorio.
- Todos los botones tienen una acción real y coherente.
- Carga, vacío, error, éxito y confirmación están resueltos.
- Inputs validados y mensajes de error accionables.
- Accesibilidad básica y navegación por teclado revisadas.
- No expone datos de otros restaurantes.
- Los datos demo están claramente identificados.
- La función está probada de punta a punta antes de anunciarla como operativa.

## Estado real al crear este documento

El repositorio ya tiene una primera página de carta y un panel administrativo con varias secciones visuales. Muchas acciones todavía usan estado local/demo. La persistencia del inventario se limita al navegador. La capa Supabase inicial no está conectada a la interfaz; no hay credenciales Supabase configuradas ni migración aplicada. Los modelos 3D/AR, pagos, pedidos compartidos y notificaciones geolocalizadas no deben considerarse funcionales todavía.
