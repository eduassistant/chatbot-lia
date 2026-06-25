# chatbot-lia

Frontend de validación conversacional para **LIA**, el asistente estudiantil del proyecto Eduassistant.

Este repositorio está pensado para que una persona en formación pueda avanzar con autonomía, pero con límites claros, entregas pequeñas y revisión semanal.

---

## 1) Objetivo del proyecto

Construir un **frontend liviano y mantenible** que permita:

- interactuar con el RAG de LIA mediante una interfaz de chat,
- visualizar las fuentes recuperadas por el sistema,
- capturar feedback del usuario sobre la utilidad de las respuestas,
- validar el comportamiento conversacional del RAG sin acceder al código interno de Eduassistant,
- dejar una base limpia para futura integración formal con Laravel.

> Este proyecto **no busca reemplazar Eduassistant**.  
> El objetivo es dejar un entorno de pruebas controlado, entendible y extensible.

---

## 2) Alcance del MVP

### Incluye
- interfaz de chat con historial de mensajes
- integración con el endpoint `POST /chat` del backend RAG
- visualización de fuentes y scores de similitud
- indicador de carga durante el procesamiento
- captura de feedback por respuesta
- manejo básico de errores de red
- despliegue en Vercel

### No incluye en esta etapa
- autenticación de usuarios
- historial persistido entre sesiones
- panel de administración
- múltiples conversaciones simultáneas
- internacionalización
- observabilidad avanzada

---

## 3) Stack base

- **Next.js 14+ (App Router)**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **fetch nativo / axios** para comunicación con el RAG
- **Vercel** para despliegue
- **Jest + React Testing Library** para tests
- **ESLint** para lint
- **GitHub** para versionado, issues y PRs

---

## 4) Estructura sugerida del proyecto

```text
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── sources/
│   │   └── SourcesPanel.tsx
│   └── feedback/
│       └── FeedbackButtons.tsx
├── lib/
│   ├── ragClient.ts
│   └── types.ts
├── hooks/
│   └── useChat.ts
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── workflows/
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── public/
├── .env.local
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 5) Cómo debe trabajar el pasante

### Regla principal
No trabajar "a lo ancho".  
Se trabaja **por bloques pequeños, revisables y con cierre semanal**.

### Flujo obligatorio
1. Revisar el issue asignado.
2. Confirmar qué se espera entregar.
3. Crear rama nueva desde `main`.
4. Implementar solo el alcance del issue.
5. Probar localmente.
6. Abrir Pull Request.
7. Esperar revisión antes de continuar con cambios grandes.

### Convención de ramas
- `feature/nombre-corto`
- `fix/nombre-corto`
- `docs/nombre-corto`
- `chore/nombre-corto`

Ejemplos:
```bash
git checkout -b feature/setup-nextjs
git checkout -b feature/chat-interface
git checkout -b feature/sources-panel
git checkout -b docs/update-readme
```

---

## 6) Cronograma semanal de PRs

> Cada semana debe terminar con **un PR funcional**, aunque sea pequeño.

### Semana 1 — Setup base
**Objetivo**
- crear el proyecto Next.js,
- configurar Tailwind y TypeScript,
- desplegar skeleton en Vercel.

**PR esperado**
`feat: setup inicial Next.js + Vercel`

**Entrega mínima**
- app levantando localmente,
- página raíz visible,
- README con quick start.

---

### Semana 2 — Interfaz de chat
**Objetivo**
- construir el layout central de chat,
- implementar caja de mensaje e historial,
- mostrar mensajes del usuario y del asistente diferenciados.

**PR esperado**
`feat: chat interface`

**Entrega mínima**
- historial visible,
- input funcional,
- diseño mínimo aplicado.

---

### Semana 3 — Integración con el RAG
**Objetivo**
- crear el cliente HTTP hacia el backend RAG,
- conectar el formulario con el endpoint `POST /chat`,
- mostrar la respuesta real del asistente.

**PR esperado**
`feat: rag api client`

**Entrega mínima**
- mensaje enviado y respuesta mostrada,
- variables de entorno configuradas,
- manejo básico de error de red.

---

### Semana 4 — Visualización de fuentes
**Objetivo**
- mostrar las fuentes devueltas por el RAG,
- presentar título, fragmento y score de similitud por fuente.

**PR esperado**
`feat: sources panel`

**Entrega mínima**
- panel de fuentes visible debajo de la respuesta,
- al menos título y score por fuente.

---

### Semana 5 — Estados de carga y errores
**Objetivo**
- agregar indicador de carga mientras el RAG procesa,
- mostrar mensajes de error comprensibles para el usuario,
- deshabilitar el input durante el procesamiento.

**PR esperado**
`feat: loading and error states`

**Entrega mínima**
- spinner o indicador visible,
- mensaje de error cuando falla la llamada,
- input bloqueado durante la espera.

---

### Semana 6 — Feedback del usuario
**Objetivo**
- agregar botones de feedback por respuesta,
- registrar si fue útil, insuficiente o requiere derivación.

**PR esperado**
`feat: feedback component`

**Entrega mínima**
- botones visibles por respuesta,
- estado visual al confirmar feedback,
- registro básico (console o endpoint si aplica).

---

### Semana 7 — Ajustes de UX y responsividad
**Objetivo**
- revisar experiencia en móvil,
- pulir espaciado, tipografía y accesibilidad básica,
- asegurar que el scroll del historial funcione correctamente.

**PR esperado**
`chore: ux polish`

**Entrega mínima**
- interfaz usable en pantallas pequeñas,
- sin elementos cortados ni overflow visible.

---

### Semana 8 — Tests y calidad
**Objetivo**
- agregar tests básicos para componentes críticos,
- verificar lint sin errores,
- revisar build de producción.

**PR esperado**
`test: componentes críticos + lint`

**Entrega mínima**
- tests del componente de chat y del cliente RAG,
- `npm run lint` sin errores,
- `npm run build` exitoso.

---

### Semana 9 — Documentación y cierre
**Objetivo**
- actualizar README con instrucciones finales,
- documentar variables de entorno,
- preparar demo interna.

**PR esperado**
`docs: readme final + guía de despliegue`

**Entrega mínima**
- README completo,
- instrucciones de Vercel actualizadas,
- app desplegada y accesible.

---

### Semanas 10 a 12 — Buffer de consolidación
Estas semanas quedan para:
- correcciones pendientes,
- deuda técnica,
- mejoras de accesibilidad,
- hardening de errores,
- cierre documental.

> Si el avance fue más lento, estas semanas sirven para completar lo esencial.  
> Si el avance fue bueno, se usan para mejorar calidad.

---

## 7) Qué se revisará en cada PR

Todo PR debe ser revisable en máximo 15 a 25 minutos.

### El mentor revisará:
- si cumple el objetivo del issue,
- si el código es entendible,
- si no mezcla demasiadas cosas,
- si tiene forma clara de probarse,
- si deja la base mejor que antes.

### Un PR puede ser rechazado si:
- no se puede probar,
- mezcla demasiados cambios,
- rompe el entorno,
- está incompleto sin explicación,
- no sigue el formato requerido.

---

## 8) Formato obligatorio de Pull Request

Todo PR debe usar este formato:

```markdown
## ✅ Qué hice
- ...

## 🧪 Cómo probarlo
- ...

## ⚠️ Notas
- ...

## 🔗 Issue relacionado
- Closes #ID
```

---

## 9) Definition of Done por issue

Un issue se considera terminado cuando:
- el cambio está implementado,
- fue probado localmente,
- tiene PR abierto,
- el mentor lo revisó,
- fue mergeado a `main`,
- si corresponde, la documentación fue actualizada.

---

## 10) Buenas prácticas de trabajo

### Sí hacer
- subir avances cada semana,
- escribir componentes simples y enfocados,
- comentar lo necesario, no todo,
- separar lógica de presentación,
- documentar decisiones de diseño importantes,
- preguntar cuando algo no esté claro.

### No hacer
- trabajar 2 semanas sin abrir PR,
- meter varios temas distintos en un mismo PR,
- copiar componentes sin entenderlos,
- introducir librerías grandes sin justificar,
- cambiar arquitectura sin discutirlo.

---

## 11) Estándares mínimos de código

- nombres claros en componentes, hooks y funciones,
- componentes con una sola responsabilidad,
- manejo básico de errores en llamadas al RAG,
- configuración por variables de entorno,
- nada sensible hardcodeado,
- tests mínimos en piezas críticas,
- tipado TypeScript donde sea razonable.

---

## 12) Cómo levantar el proyecto localmente

### Requisitos
- Node.js 18+
- npm o pnpm
- Git
- acceso al backend RAG en ejecución (local o Render)

### Pasos generales
```bash
git clone <repo-url>
cd chatbot-lia
cp .env.example .env.local
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 13) Variables de entorno esperadas

Crear `.env.local` en la raíz del proyecto:

```env
RAG_API_URL=https://<url-del-backend-rag>
RAG_API_KEY=<tu_api_key>
```

> **No incluyas credenciales reales en el repositorio.** El archivo `.env.local` está excluido por `.gitignore`.  
> En Vercel, configurar estas variables como privadas, sin prefijo `NEXT_PUBLIC_`. La API key del RAG no debe exponerse en el navegador.

---

## 14) Integración con el backend RAG

El chatbot consume el endpoint interno `POST /api/chat` de Next.js. Esa ruta server-side reenvía la consulta al endpoint `POST /chat` del backend RAG usando la API key privada configurada en variables de entorno.

### Request

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Me siento muy sobrepasado con la universidad"
}
```

### Response esperada en el frontend

```json
{
  "response": "Entiendo que te sientas sobrepasado...",
  "sources": [
    {
      "documentId": 1,
      "chunkId": 10,
      "chunkIndex": 0,
      "title": "Documento #1",
      "fragment": "Fragmento #10",
      "score": 0.12
    }
  ],
  "traceId": "trace-demo-001"
}
```

El campo `sources` se normaliza en la ruta interna de Next.js para renderizar el panel de fuentes junto a la respuesta. Mientras `rag-lia` no devuelva título o fragmento, el front muestra valores fallback como `Documento #ID` y `Fragmento #ID`.

---

## 15) Criterio de éxito al cierre de la práctica

La práctica será exitosa si al terminar existe:
- una interfaz de chat funcional y desplegada en Vercel,
- integración real con el endpoint del RAG,
- visualización de fuentes operativa,
- feedback del usuario implementado,
- documentación suficiente para continuidad.

---

## 16) Mensaje final para quien desarrolla

No se espera perfección.
Se espera orden, criterio, aprendizaje y avance real.

La prioridad no es construir la interfaz más compleja,
sino dejar una base limpia que el equipo pueda mantener y extender.

---

## 17) Quick start

### Requisitos
- Node.js 18+
- npm

### Stack instalado en la primera feature
- Next.js 14+ con App Router
- React
- TypeScript
- Tailwind CSS
- Jest + React Testing Library
- ESLint

### Levantar el proyecto

```bash
cp .env.example .env.local
npm install
npm run dev
```

---

## 18) Cliente HTTP hacia el RAG

El archivo `lib/ragClient.ts` centraliza la comunicación del cliente con la ruta interna `/api/chat`. La API key del RAG nunca se usa desde el navegador.

### Función principal

```ts
sendMessage(message: string): Promise<ChatResponse>
```

### Estructura del tipo de respuesta

```ts
interface ChatResponse {
  response: string;
  sources: Source[];
  traceId?: string;
}

interface Source {
  documentId: number;
  chunkId: number;
  chunkIndex: number;
  title: string;
  fragment: string;
  score: number;
}
```

### Manejo de errores

El cliente debe capturar errores de red y respuestas con status distinto de 2xx, devolviendo un error tipado para que el componente pueda mostrarlo al usuario.

---

## 19) Hook de estado del chat

El archivo `hooks/useChat.ts` gestiona el estado de la conversación y la llamada al cliente RAG.

### Responsabilidades

- mantener el historial de mensajes,
- gestionar el estado de carga (`isLoading`),
- gestionar el estado de error,
- exponer la función `sendMessage`.

### Ejemplo de uso en un componente

```tsx
const { messages, isLoading, error, sendMessage } = useChat();
```

---

## 20) Componente ChatWindow

El componente principal de la interfaz vive en `components/chat/ChatWindow.tsx`.

### Responsabilidades

- renderizar la lista de mensajes,
- incluir el input de mensaje,
- mostrar el indicador de carga,
- mostrar errores cuando corresponda,
- mantener el scroll al final del historial.

---

## 21) Panel de fuentes

El componente `components/sources/SourcesPanel.tsx` muestra las fuentes devueltas por el RAG junto a cada respuesta.

### Datos a mostrar por fuente

- `documentId`
- `chunkId`
- `title`
- `fragment`
- `score`

El panel solo se renderiza cuando la respuesta incluye fuentes. Si el array viene vacío, no se muestra.

---

## 22) Componente de feedback

El componente `components/feedback/FeedbackButtons.tsx` permite al usuario calificar cada respuesta.

### Opciones esperadas

- útil,
- insuficiente,
- requiere derivación.

Al confirmar, el botón seleccionado debe mostrar un estado visual activo. El registro del feedback puede realizarse en consola en la primera versión, con extensión futura a un endpoint dedicado.

---

## 23) Despliegue en Vercel

1. Conectar el repositorio a un proyecto en [Vercel](https://vercel.com).
2. Configurar las variables privadas `RAG_API_URL` y `RAG_API_KEY` en el panel de Vercel.
3. Cada push a `main` dispara un deploy automático.

### Validar el deploy

- la página principal carga correctamente,
- el chat puede enviar un mensaje real al RAG,
- las fuentes se muestran en la respuesta,
- los botones de feedback responden visualmente.

---

## 24) Relación con el repositorio del RAG

Este frontend es independiente del backend. Para el contexto completo del sistema consultar el repositorio del RAG, que incluye:

- pipeline de ingestión de documentos y chunking,
- búsqueda semántica con pgvector,
- endpoint `POST /chat` con autenticación por API key,
- documentación Swagger en `/docs`.



---

## 25) Feature inicial: interfaz base de validación conversacional

Esta primera implementación instala el stack tecnológico del frontend y crea una pantalla single page basada en el diseño aprobado en Figma.

### Incluye
- Next.js 14+ con App Router.
- React + TypeScript.
- Tailwind CSS.
- Header con logo de Eduassistant y estado visual de conexión.
- Card principal de conversación.
- Mensaje inicial de LIA.
- Ejemplos de consulta.
- Input de mensaje.
- Respuesta simulada para validar la experiencia de chat.
- Panel de fuentes recuperadas.
- Botones de feedback visuales por respuesta.
- Test básico del componente `MessageInput`.

### Nota técnica
La llamada real a `POST /chat` queda para la siguiente issue. En esta feature, `lib/ragClient.ts` devuelve una respuesta simulada para validar estructura, diseño y flujo visual.

### Seguridad de variables
Aunque versiones iniciales del documento mencionaban variables `NEXT_PUBLIC_RAG_API_URL` y `NEXT_PUBLIC_RAG_API_KEY`, la integración final debe evitar exponer la API key del RAG en el navegador. La recomendación técnica es usar una ruta server-side en Next.js y variables privadas:

```env
RAG_API_URL=https://<url-del-backend-rag>
RAG_API_KEY=<api-key-privada>
```

---

## 26) Integración inicial con `rag-lia`

Esta feature conecta la UI del chat con el backend RAG usando una ruta interna server-side de Next.js.

### Incluye
- Nueva ruta `POST /api/chat` en `app/api/chat/route.ts`.
- Cliente HTTP real en `lib/ragClient.ts`.
- Envío de mensajes reales desde el hook `useChat`.
- Manejo de errores de red, configuración faltante y respuestas no exitosas.
- Normalización de fuentes desde el formato actual de `rag-lia` (`document_id`, `chunk_id`, `chunk_index`, `distance`) al formato usado por la UI (`documentId`, `chunkId`, `chunkIndex`, `title`, `fragment`, `score`).
- Tests básicos del cliente HTTP y de la ruta interna.

### Seguridad
El navegador no llama directamente al backend RAG ni conoce la API key. El flujo queda así:

```text
Browser
  → POST /api/chat en Next.js
  → POST /chat en rag-lia con x-api-key privada
```

Variables requeridas en `.env.local`:

```env
RAG_API_URL=http://localhost:8000
RAG_API_KEY=changeme
```

### Validación local sugerida

1. Levantar `rag-lia` y su base de datos según el README del backend.
2. Verificar que `POST /chat` funciona con `x-api-key`.
3. En `chatbot-lia`, crear `.env.local` desde `.env.example`.
4. Ejecutar:

```bash
npm run dev
```

5. Enviar un mensaje desde `http://localhost:3000` y verificar que la respuesta se renderiza en el historial.


---

## 27) Integración de feedback con `rag-lia`

Esta feature conecta los botones de feedback del chat con el endpoint `POST /feedback` del backend RAG.

### Incluye
- Nueva ruta interna `POST /api/feedback` en `chatbot-lia`.
- Nuevo cliente HTTP `lib/feedbackClient.ts`.
- Uso del `traceId` devuelto por `/api/chat` para asociar el feedback con la respuesta del RAG.
- Envío seguro del feedback al backend mediante `RAG_API_URL` y `RAG_API_KEY` privadas.
- Mapeo de botones:
  - `Útil` → `useful`
  - `Insuficiente` → `insufficient`
  - `Necesito hablar con alguien` → `needs_human_support`
- Estados visuales por respuesta:
  - enviando,
  - enviado,
  - error.
- Tests del cliente HTTP y de la ruta interna.

### Flujo seguro

```text
Browser
  → POST /api/feedback en Next.js
  → POST /feedback en rag-lia con x-api-key privada
```

La API key del RAG no se expone en el navegador.

### Request interno

```http
POST /api/feedback
Content-Type: application/json

{
  "traceId": "trace-demo-001",
  "feedback": "useful",
  "source": "chatbot-lia"
}
```

### Response esperada

```json
{
  "id": 1,
  "traceId": "trace-demo-001",
  "feedback": "useful",
  "message": "Feedback registrado correctamente."
}
```


---

## 28) UX de case management en feedback

Esta mejora complementa la issue `#37` de `rag-lia` y permite que `chatbot-lia` interprete el `case_id` opcional devuelto por el backend cuando un feedback genera un caso escalado.

Objetivo:

- mantener el flujo seguro mediante `/api/feedback` server-side;
- no exponer `RAG_API_KEY` en el navegador;
- mostrar un mensaje especial cuando el usuario selecciona `Necesito hablar con alguien`;
- conservar el comportamiento normal para `Útil` e `Insuficiente`.

Flujo esperado:

```text
Usuario presiona "Necesito hablar con alguien"
→ chatbot-lia POST /api/feedback
→ rag-lia POST /feedback
→ rag-lia crea caso si corresponde
→ chatbot-lia muestra solicitud registrada para seguimiento humano
```

Archivos principales:

```text
app/api/feedback/route.ts
components/feedback/FeedbackButtons.tsx
components/chat/MessageBubble.tsx
hooks/useChat.ts
lib/feedbackClient.ts
lib/types.ts
```

Validación local:

```bash
npm run lint
npm run build
npm test
```

---

## 50) Historial conversacional anónimo

Esta feature integra `chatbot-lia` con la issue `#50` de `rag-lia`, permitiendo mantener y recuperar una sesión conversacional anónima mediante un `conversationId` persistido en el navegador.

Objetivo:

- generar un UUID anónimo en el primer uso del chat;
- persistirlo en `localStorage`;
- enviarlo al backend RAG como `conversation_id`;
- recuperar historial al volver a abrir el chatbot;
- permitir iniciar una nueva conversación;
- no exponer `RAG_API_KEY` al navegador.

Flujo esperado:

```text
Usuario abre chatbot
→ chatbot-lia obtiene o genera conversationId
→ GET /api/conversations/{conversationId}
→ rag-lia devuelve historial si existe
→ usuario envía mensaje
→ POST /api/chat incluye conversation_id
→ rag-lia guarda user/assistant y devuelve conversation_id
```

Rutas internas nuevas o actualizadas:

```http
POST /api/chat
GET /api/conversations/{conversationId}
```

La ruta `/api/chat` normaliza `conversationId` del front a `conversation_id` para `rag-lia`.

Archivos principales:

```text
app/api/chat/route.ts
app/api/conversations/[conversationId]/route.ts
hooks/useChat.ts
lib/conversationSession.ts
lib/ragClient.ts
lib/types.ts
components/chat/ChatExperience.tsx
components/chat/ChatWindow.tsx
```

Validación local:

```bash
npm run lint
npm run build
npm test
```

## Issue #51 — Carga documental desde interfaz

Se agregó una interfaz de carga documental para alimentar el RAG desde `chatbot-lia`.

Características:

- componente `DocumentUploadPanel` con selector de archivos y drag & drop;
- validación frontend para PDF, TXT, Markdown (`.md`) y Word/DOCX;
- límite inicial de 10 MB por archivo;
- endpoint server-side `POST /api/documents/upload` que reenvía el archivo a `rag-lia` sin exponer `RAG_API_KEY` en el navegador;
- estados visuales de carga, éxito y error;
- resumen del documento indexado con `documentId`, nombre y cantidad de chunks.

Variables privadas requeridas:

```env
RAG_API_URL=http://127.0.0.1:8000
RAG_API_KEY=changeme
```

Prueba manual:

1. Levantar `rag-lia`.
2. Levantar `chatbot-lia`.
3. Usar el panel **Carga documental**.
4. Cargar un archivo `.pdf`, `.txt`, `.md` o `.docx`.
5. Verificar que la UI muestre `Documento indexado correctamente`.
