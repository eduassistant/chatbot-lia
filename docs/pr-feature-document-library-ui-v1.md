## ✅ Qué hice
- Agregué el panel `DocumentLibraryPanel` para consultar la biblioteca documental desde `chatbot-lia`.
- Integré el panel en la experiencia principal junto a la carga documental y las fuentes del chat.
- Implementé clientes frontend para listar documentos, consultar detalle y solicitar reindexado.
- Agregué endpoints server-side seguros en Next.js para consumir `rag-lia` sin exponer `RAG_API_KEY` en el navegador:
  - `GET /api/documents`
  - `GET /api/documents/[documentId]`
  - `POST /api/documents/[documentId]/reindex`
- Normalicé respuestas del backend desde `snake_case` a `camelCase`.
- Agregué filtros por búsqueda, estado y extensión, paginación simple, detalle con preview/chunks y estado visual de reindexado.
- Agregué tests de cliente, rutas API y componente UI.
- Actualicé README con la sección de la issue #52.

## 🧪 Cómo probarlo
1. Configurar variables privadas en `.env.local`:
   ```env
   RAG_API_URL=http://127.0.0.1:8000
   RAG_API_KEY=changeme
   ```
2. Levantar `rag-lia` con la feature backend #52.
3. Instalar dependencias si corresponde:
   ```bash
   npm install
   ```
4. Validar calidad, build y tests:
   ```bash
   npm run lint
   npm run build
   npm test
   ```
5. Levantar el frontend:
   ```bash
   npm run dev
   ```
6. Probar manualmente en la UI:
   - abrir el panel **Biblioteca documental**;
   - listar documentos;
   - filtrar por búsqueda, estado y extensión;
   - abrir detalle de un documento;
   - revisar preview y chunks;
   - ejecutar **Reindexar** y confirmar mensaje de éxito.

## ⚠️ Notas
- La API key del RAG se mantiene solo del lado servidor mediante rutas internas de Next.js.
- Esta feature consume los endpoints backend implementados en `rag-lia` para la issue #52.
- El frontend no procesa embeddings ni documentos directamente; solo consulta y administra el estado expuesto por el backend.
- La pantalla queda integrada como panel lateral para mantener la experiencia actual sin crear navegación adicional.

## 📌 Issue relacionado
Closes #52

## ✅ Checklist
- [x] Probé el cambio localmente
- [x] No agregué secretos ni credenciales
- [x] Actualicé documentación si aplica
- [x] El cambio está acotado al issue
