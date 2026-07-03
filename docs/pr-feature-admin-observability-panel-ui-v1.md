# PR — Admin observability panel UI v1

## Qué incluye

- Panel visual de observabilidad administrativa en `chatbot-lia`.
- Proxy server-side hacia endpoints `/admin` de `rag-lia` sin exponer `RAG_API_KEY` en navegador.
- Pestañas para Feedback, Trazas RAG y Casos sensibles/escalados.
- Filtros por búsqueda, fechas, estado/feedback, nivel de riesgo y tipo/origen.
- Paginación por vista.
- Cards operacionales con información resumida y detalles relevantes.

## Endpoints internos

- `GET /api/admin/feedback`
- `GET /api/admin/rag-traces`
- `GET /api/admin/cases`

Cada ruta agrega server-side:

- `x-api-key: RAG_API_KEY`
- `x-admin-role: admin`

## Validación sugerida

```bash
npm run lint
npm run build
npm test
```

Con `rag-lia` levantado:

```bash
npm run dev
```

Validar visualmente que el panel muestra feedback, trazas y casos, que los filtros aplican y que la paginación funciona.
