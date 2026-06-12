# feat: conectar feedback del chatbot con rag-lia

## ✅ Qué hice

- Agregué la ruta interna `POST /api/feedback` en `chatbot-lia`.
- Conecté los botones de feedback de cada respuesta con el endpoint `POST /feedback` de `rag-lia`.
- Mantuve la arquitectura segura: el navegador llama a Next.js y Next.js reenvía al backend RAG con `RAG_API_KEY` privada.
- Incorporé el uso de `traceId` devuelto por `/api/chat` para asociar cada feedback con la traza funcional de la respuesta.
- Actualicé el mapeo de opciones:
  - `Útil` → `useful`
  - `Insuficiente` → `insufficient`
  - `Necesito hablar con alguien` → `needs_human_support`
- Agregué estados visuales: enviando, enviado y error.
- Agregué cliente HTTP `lib/feedbackClient.ts`.
- Actualicé tipos compartidos en `lib/types.ts`.
- Actualicé README con el nuevo flujo de feedback.
- Agregué tests para el cliente y la ruta interna.

## 🧪 Cómo probarlo

### Validaciones técnicas

```bash
npm run lint
npm run build
npm test
```

### Prueba funcional local

1. Levantar `rag-lia` con la issue #36 mergeada y migrada.
2. Configurar `.env.local` en `chatbot-lia`:

```env
RAG_API_URL=http://localhost:8000
RAG_API_KEY=changeme
```

3. Levantar el frontend:

```bash
npm run dev
```

4. Enviar un mensaje desde `http://localhost:3000`.
5. Presionar un botón de feedback en una respuesta de LIA.
6. Verificar que aparece el estado `Feedback enviado.`.
7. Validar en PostgreSQL de `rag-lia`:

```sql
select id, trace_id, feedback_value, source, created_at
from rag_response_feedback
order by created_at desc
limit 10;
```

## ⚠️ Notas

- Esta feature depende de que `rag-lia` tenga disponible `POST /feedback` y que `/chat` devuelva `trace_id`.
- No se expone `RAG_API_KEY` en el navegador.
- No se agregó campo de comentario libre en UI; se deja como posible mejora futura.

## 🔗 Issue relacionado

- Feature extra posterior a `rag-lia #36 — [FEEDBACK] Capturar feedback del usuario sobre la respuesta`
