# Rediseño UI/UX — Sabores de Chile

## Objetivo
Transformar el frontend existente en un producto gastronómico premium, mobile-first y comercializable. Mantener este repositorio y proyecto Vercel. No conectar ni ejecutar la base de datos en esta fase.

## Dirección visual
- Identidad editorial gastronómica; fotografía real como protagonista, evitar emojis como sustituto de imágenes.
- Paleta base: marfil cálido, tinta oscura y verde profundo como acento; color semántico solo para estados.
- Tipografía con jerarquía marcada, espaciado generoso, superficies limpias y estados interactivos visibles.
- Componentes consistentes para móvil, tablet y escritorio; accesibilidad de contraste, foco y áreas táctiles.
- No usar métricas ficticias como si fueran datos reales. Los datos demo deben estar rotulados.

## Experiencia cliente
1. Inicio del restaurante con identidad, horarios y categorías.
2. Carta con fotografía, descripción, precio, disponibilidad y etiquetas dietarias cuando estén verificadas.
3. Ficha de plato con galería, variantes/extras, alérgenos declarados y CTA claro.
4. Carrito editable, resumen transparente y confirmación demo explícita hasta conectar backend.
5. Visor 3D como mejora progresiva, con alternativa fotográfica si no está disponible.

## Flujo de creación de plato
1. Datos básicos: nombre, descripción, precio, categoría e ingredientes.
2. Captura guiada: video alrededor del plato o varias fotos desde distintos ángulos.
3. Referencia de escala: diámetro/ancho y altura reales, recipiente y unidad.
4. Estado de procesamiento visible: pendiente, procesando, necesita nueva captura, listo, error.
5. Visor de revisión: rotar, zoom, comprobar textura y escala; volver a capturar si hace falta.
6. Publicación solo tras aprobación del administrador.

## Realidad técnica del 3D
- Guardar metadatos del recurso y ruta del archivo; no almacenar archivos pesados en el bundle frontend.
- Objetivo de entrega web: GLB optimizado; visor con carga diferida y fallback a fotos.
- La escala requiere una medida física conocida; no prometer tamaño real solo a partir de una foto.
- La reconstrucción/generación requiere integrar y evaluar un servicio real. Esta especificación no implica que ya exista esa integración.
- AR se habilita solo en dispositivos/navegadores compatibles, con instrucciones y alternativa 3D normal.

## Experiencia administrativa
- Inicio centrado en tareas: pedidos activos, cocina, productos y alertas; mostrar solo datos reales o claramente demo.
- Navegación por tareas y roles, no una cuadrícula genérica de módulos.
- Productos con estado de publicación, disponibilidad, stock/alertas cuando exista backend, y acción principal evidente.
- Captura 3D dentro del flujo de crear/editar producto.

## Secuencia de implementación
1. Auditoría de componentes y rutas actuales.
2. Tokens de diseño y componentes reutilizables.
3. Rediseño de carta, ficha de plato y carrito.
4. Rediseño del panel y formulario de producto.
5. Visor 3D con modelo de prueba claramente identificado como demo.
6. Captura móvil, almacenamiento de archivos e integración con proveedor 3D.
7. Pruebas responsive, accesibilidad, rendimiento y build.
8. Backend y base de datos en fase posterior acordada.

## Criterios de aceptación
- La carta funciona en móvil desde 320 px de ancho sin desbordamientos.
- No se usan emojis como imágenes de platos.
- Todos los botones principales tienen una acción funcional o se identifican claramente como no disponibles.
- Los datos de demostración están identificados.
- El flujo de plato no afirma que existe un modelo real hasta que un recurso 3D válido esté procesado y aprobado.
- Build y pruebas automatizadas pasan antes de desplegar.
