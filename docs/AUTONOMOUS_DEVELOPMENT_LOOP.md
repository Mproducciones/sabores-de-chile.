# Loop de desarrollo autónomo — Sabores de Chile

## Propósito
Ejecutar el desarrollo incremental en el repositorio existente y el proyecto Vercel existente, sin pedir aprobación entre tareas rutinarias. No crear proyectos duplicados. La base de datos real se deja para la fase posterior acordada.

## Límites de autonomía
- Se permite leer, editar, probar y documentar el código del proyecto, y preparar cambios pequeños verificables.
- No ejecutar migraciones ni conectar una base de datos real en esta fase.
- No comprar servicios, contratar planes, incurrir en gastos, publicar mensajes a clientes ni cambiar credenciales/permisos sin autorización.
- No desplegar cambios que fallen en compilación o pruebas.
- Mantener secretos fuera del repositorio y nunca registrar tokens.
- Si una decisión irreversible, un coste, un secreto o un permiso adicional resulta necesario, detener solo esa acción y registrar el bloqueo; continuar tareas independientes seguras.

## Ciclo de trabajo
1. Inspeccionar rama principal, árbol de archivos, package.json, rutas y CI.
2. Registrar el estado inicial y los criterios de aceptación.
3. Identificar el cambio más pequeño con mayor impacto, sin reescribir todo a la vez.
4. Implementar tokens de diseño y componentes compartidos, respetando React/Vite existente.
5. Rediseñar primero la carta pública: fotografía real o recursos autorizados, categorías, ficha del plato y carrito.
6. Rediseñar panel administrativo: navegación por tareas, productos y estados; etiquetar todos los datos demo.
7. Implementar formulario de alta/edición de plato con carga de imagen/video y validación local; mostrar claramente que el procesamiento 3D real requiere proveedor.
8. Implementar visor GLB/GLTF con carga diferida, controles, manejo de error y fallback a fotos. Usar un modelo de prueba claramente marcado como demo si no existe recurso real.
9. Preparar flujo de captura: instrucciones, validación de archivos, metadatos de escala física, estado de procesamiento y revisión. No afirmar que se generó un modelo si no existe integración real.
10. Añadir pruebas de componentes y flujos; comprobar accesibilidad básica y responsive.
11. Ejecutar instalación reproducible, lint si está configurado, pruebas y build.
12. Corregir errores y repetir las pruebas hasta lograr verde o documentar el bloqueo reproducible.
13. Revisar diff, dependencias, secretos, regresiones y cambios ajenos al alcance.
14. Commit de cambios completos y coherentes en la rama principal solo si todas las verificaciones pasan y no hay cambios conflictivos.
15. Comprobar CI y estado del despliegue de Vercel. No afirmar producción lista sin comprobar el estado real.
16. Registrar commit, pruebas ejecutadas, URLs/estado confirmados, limitaciones y siguiente tarea.
17. Repetir desde el paso 1 con la siguiente prioridad.

## Orden de prioridades
P0: aplicación compila, rutas estables y ninguna regresión.
P1: sistema visual coherente, responsive y accesible.
P2: carta, ficha de plato y carrito de demostración coherentes.
P3: administración y flujo de alta de platos.
P4: visor 3D GLB/GLTF y fallback.
P5: captura guiada y contrato de integración con proveedor de reconstrucción.
P6: operaciones reales de pedidos/cocina/caja/inventario y backend, reservadas para la fase posterior.
P7: seguridad multi-restaurante, pruebas end-to-end y preparación de producción.

## Definition of Done por tarea
- Cambio implementado en código, no solo descrito en documentos.
- Pruebas pertinentes añadidas o ejecutadas.
- Build exitoso.
- Sin secretos ni dependencias innecesarias.
- Interfaz verificada en tamaños móviles y escritorio cuando corresponda.
- Estados de carga, vacío, error y éxito considerados.
- Datos de demo etiquetados.
- Commit y resultado documentados.
- Despliegue comprobado si se publica.

## Honestidad de estado
No afirmar que un agente trabaja en segundo plano ni que una tarea está terminada si no existe un proceso persistente o evidencia comprobable. Este documento define el protocolo; para ejecución continua se necesita un runner externo como GitHub Actions/otro agente con permisos configurados. La conversación por sí sola no garantiza ejecución indefinida.
