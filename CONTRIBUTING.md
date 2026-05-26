# 🤝 CONTRIBUTING

Este documento define cómo se contribuye al repositorio de **chatbot-lia**, el frontend de validación conversacional de LIA.

La meta es trabajar con foco, entregas pequeñas y revisiones claras.

---

## 1) Principios de trabajo

- Un issue define el alcance.
- Un branch contiene una sola línea de trabajo.
- Un PR entrega un avance revisable.
- El código debe ser simple antes que “ingenioso”.
- Si una decisión afecta arquitectura, debe discutirse.

---

## 2) Flujo de contribución

### Paso 1 — Revisar el issue
Antes de programar:
- leer el título,
- leer la descripción,
- confirmar criterios de aceptación,
- despejar dudas.

### Paso 2 — Crear rama
```bash
git checkout main
git pull
git checkout -b feature/nombre-corto
```

### Paso 3 — Implementar
- mantener el cambio acotado,
- evitar mezclar refactor y feature en el mismo PR,
- probar localmente.

### Paso 4 — Ejecutar validaciones
Idealmente correr:
```bash
npm run lint
npm run build
npm test
```

### Paso 5 — Commit
Formato sugerido:
```bash
git commit -m "feat: agregar servicio de embeddings"
git commit -m "fix: corregir consulta vectorial"
git commit -m "docs: actualizar guía de instalación"
```

### Paso 6 — Push y PR
```bash
git push origin feature/nombre-corto
```

Abrir PR usando la plantilla oficial.

---

## 3) Convenciones de ramas

- `feature/...`
- `fix/...`
- `docs/...`
- `chore/...`
- `test/...`

Ejemplos:
- `feature/chat-interface`
- `feature/sources-panel`
- `fix/feedback-button`
- `docs/setup-guide`

---

## 4) Convenciones de commits

Formato recomendado:
- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

Ejemplos:
- `feat: crear componente de chat`
- `fix: manejar error de conexión con el RAG`
- `docs: agregar quick start`

---

## 5) Pull Requests

### Regla principal
Un PR debe responder claramente:
- qué cambia,
- cómo se prueba,
- qué riesgo tiene.

### Tamaño esperado
Idealmente:
- pequeño o mediano,
- enfocado,
- revisable sin contexto excesivo.

### No mezclar en un solo PR
- feature + refactor grande,
- feature + cambios cosméticos masivos,
- varios issues distintos.

---

## 6) Checklist obligatorio antes de abrir un PR

- [ ] El código corre localmente
- [ ] El cambio cumple el issue
- [ ] Probé el flujo principal
- [ ] No dejé secretos en el código
- [ ] Actualicé documentación si aplica
- [ ] El PR usa la plantilla oficial

---

## 7) Estándares de revisión

El mentor revisará:

### Correctitud
- ¿Hace lo que promete?

### Claridad
- ¿Se entiende rápido?

### Alcance
- ¿Está bien acotado?

### Riesgo
- ¿Puede romper otra parte?

### Continuidad
- ¿Alguien más podrá mantenerlo?

---

## 8) Definition of Done

Una contribución se considera lista cuando:
- cumple el objetivo,
- pasa validaciones razonables,
- tiene PR abierto,
- fue revisada,
- se incorporó a `main`.

---

## 9) Código y estilo

### Reglas generales
- preferir legibilidad,
- no sobreingenierizar,
- escribir funciones con una sola responsabilidad,
- centralizar configuración,
- manejar errores básicos.

### Configuración
- usar `.env.local` para variables de entorno,
- no hardcodear la URL del RAG ni la API key,
- no subir `.env.local` al repositorio (está en `.gitignore`).

### Logs
- dejar logs útiles para depurar,
- evitar imprimir datos sensibles.

---

## 10) Tests mínimos esperados

No todo necesita test exhaustivo en esta etapa, pero sí al menos:
- componentes críticos de UI,
- lógica de llamada al RAG,
- casos felices básicos,
- manejo de errores de red o respuesta vacía.

---

## 11) Comunicación

Cuando algo no esté claro:
- preguntar temprano,
- no asumir decisiones grandes,
- dejar notas en el PR si algo quedó pendiente.

---

## 12) Qué valoramos más en este proyecto

- progreso sostenido,
- orden,
- criterio,
- documentación mínima,
- capacidad de dejar una base mantenible.
