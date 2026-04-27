# Retarget Stack Presentation

## 🌐 URL para compartir

```
http://localhost:8888/index.html
```

## 📱 En tu red local (desde otro dispositivo)

Reemplaza `localhost` con tu IP local:

```bash
# Obtén tu IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Luego usa:
http://[TU_IP]:8888/index.html
```

## 🚀 Para deploy permanente

Opciones:
1. **Vercel** (recomendado): `vercel --prod`
2. **Netlify**: `netlify deploy --prod`
3. **Railway**: Conecta este repo a Railway

## 📄 Exportar como PDF

En el browser:
1. Abre http://localhost:8888/index.html
2. Cmd+P (o Ctrl+P)
3. "Save as PDF"

## 📋 Contenido

- **01. La idea** — Loop autónomo (pedido → IA → código → verificador → OK)
- **02. Las 4 piezas** — Claude Sonnet, MCP Server, Cron Daemons, Knowledge Base
- **03. Caso real** — Pueblo La Dehesa (22→0 issues, 2 iteraciones, 15 min)
- **04. Performance & SEO** — TTFB, HTML size, scripts, JSON-LD
- **05. Valor para Retarget** — 10× rápido, auditable, aprende, sin caja negra
- **06. Cómo funciona** — Sequence diagram del loop

---

**Generado por:** Cascade (IA programadora de Retarget)
