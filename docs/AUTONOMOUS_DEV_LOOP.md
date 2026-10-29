# Loop autónomo de desarrollo — Sabores de Chile

## Objetivo

Permitir que Claude Code implemente tareas pequeñas y verificables por iteraciones, sin exigir un mensaje manual entre tareas. El loop debe priorizar código funcional sobre documentos, respetar la arquitectura existente y detenerse ante riesgos o decisiones de negocio.

## Uso

1. Requisitos locales: Node.js/npm, Git y Claude Code autenticado (`claude --version` y `claude auth status`).
2. Integra esta carpeta en tu checkout local y cambia a una rama de trabajo que no sea `main`.
3. Revisa que no haya cambios sin guardar en Git.
4. Ejecuta `bash scripts/dev-loop.sh`.
5. Por defecto corre cinco iteraciones. Puedes configurar `MAX_ITERATIONS=8 bash scripts/dev-loop.sh`.

El loop utiliza el modo de permisos `acceptEdits`, no `--dangerously-skip-permissions`. Claude puede editar archivos permitidos, pero las operaciones de alto riesgo siguen sujetas a permisos/configuración local.

## Cada iteración

1. Lee el estado, documentación y tareas pendientes.
2. Elige una sola mejora de alto valor y alcance pequeño.
3. Implementa código y pruebas cuando sea posible.
4. Ejecuta las comprobaciones disponibles y `npm run build`.
5. Si falla, registra el error para la siguiente iteración y corrígelo.
6. Deja los cambios sin commit para revisión humana.

## Límites de seguridad

- No publicar, desplegar a producción, hacer push, fusionar PR ni ejecutar migraciones remotas.
- No leer, imprimir, copiar ni cambiar secretos; no incluir claves en logs.
- No desactivar RLS, autenticación, validaciones ni comprobaciones de seguridad.
- No instalar dependencias nuevas ni modificar lockfiles salvo que sea estrictamente necesario y se explique.
- No inventar datos de restaurantes, pagos o inventario real; mantener los datos demo claramente identificados.
- No simular que un pago, pedido o notificación fue enviado realmente.
- No borrar datos, usar comandos destructivos ni cambiar configuración de infraestructura.
- Si falta una decisión comercial, credencial o autorización, documenta el bloqueo y termina esa iteración.
- Nunca marcar una prueba como aprobada si no se ejecutó.
- Al finalizar, muestra resumen, archivos cambiados, pruebas ejecutadas y riesgos pendientes.

## Qué no hace

Este script no es un servicio en segundo plano ni un despliegue autónomo. Se ejecuta en el terminal del usuario mientras la sesión esté activa. No hace commits ni despliegues automáticamente; la revisión y publicación siguen siendo pasos separados.
