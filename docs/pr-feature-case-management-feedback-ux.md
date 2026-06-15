# PR — UX de case management en feedback

## Resumen

Este PR agrega una mejora complementaria en `chatbot-lia` para interpretar el `case_id` opcional devuelto por `rag-lia` cuando un feedback genera un caso de seguimiento humano.

## Contexto

En `rag-lia` se agregó la issue `#37 — [CASE MANAGEMENT] Escalar casos sensibles a actores humanos`. Esa mejora permite que el backend cree casos escalados cuando un usuario solicita apoyo humano o cuando safety detecta una situación sensible.

Como `chatbot-lia` ya enviaba feedback mediante `POST /api/feedback`, esta rama ajusta la interfaz para mostrar un mensaje más claro cuando el feedback elegido es `needs_human_support`.

## Cambios principales

- Se agrega soporte para `case_id`/`caseId` opcional en tipos y normalización.
- `/api/feedback` ahora preserva el `case_id` devuelto por `rag-lia`.
- `FeedbackButtons` muestra un mensaje especial para `needs_human_support`.
- `MessageBubble` puede mostrar un aviso si la respuesta ya vino asociada a un caso escalado desde `/chat`.
- Se actualizan tests de `/api/chat`, `/api/feedback` y `feedbackClient`.
- Se actualiza el README con el inciso correspondiente.

## Validaciones sugeridas

```bash
npm run lint
npm run build
npm test
```

## Notas

- No se expone la API key en el navegador.
- La integración sigue pasando por rutas internas server-side de Next.js.
- Esta mejora es UX/complementaria: el case management real queda implementado en `rag-lia`.
