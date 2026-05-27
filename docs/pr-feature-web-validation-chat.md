## ✅ Qué hice
- Instalé el stack inicial del frontend con Next.js 14+, React, TypeScript y Tailwind CSS.
- Configuré scripts base para desarrollo, build, lint y tests.
- Implementé la pantalla single page de validación conversacional basada en el diseño de Figma.
- Agregué header con logo de Eduassistant y estado visual de conexión.
- Construí la card principal de conversación, ejemplos de consulta, input de mensaje, panel de fuentes y botones de feedback.
- Separé la UI en componentes reutilizables.
- Agregué tipos base en TypeScript y una respuesta simulada en `lib/ragClient.ts`.
- Agregué un test básico para `MessageInput`.
- Actualicé README con la feature inicial y la recomendación de no exponer la API key como `NEXT_PUBLIC_`.

## 🧪 Cómo probarlo
```bash
npm install
npm run dev
```

Abrir:

```bash
http://localhost:3000
```

Validaciones sugeridas:

```bash
npm run lint
npm run build
npm test
```

Flujo manual:
- Verificar que la pantalla principal carga correctamente.
- Enviar un mensaje desde el input.
- Verificar que aparece una respuesta simulada de LIA.
- Verificar que el panel de fuentes muestra fuentes recuperadas.
- Seleccionar un botón de feedback y confirmar que queda activo visualmente.
- Probar la pantalla en ancho desktop y mobile.

## ⚠️ Notas
- Esta primera versión usa datos simulados para validar la UI.
- La integración real con `POST /chat` queda para la siguiente issue.
- El estado “Backend conectado” todavía es visual/estático.
- La API key del RAG no debe exponerse como variable `NEXT_PUBLIC_`.

## 🔗 Issue relacionado
- Closes #1
