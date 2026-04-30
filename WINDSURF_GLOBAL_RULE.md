# Regla Global de Windsurf — Saludo MCP automático

Para que Cascade salude desde el MCP **al inicio de cada nueva conversación**
(abrir Windsurf, nueva pestaña, nueva cascada, etc.), agrega esto a tus
**Global Rules** de Windsurf.

---

## 📍 Cómo agregarlo

1. Abre Windsurf
2. **Settings** (⚙️) → **Cascade** → **Memories & Rules**
3. Click en **"Edit Rules"** (Global Rules, no Workspace Rules)
4. Pega el siguiente bloque y guarda

---

## 📋 Regla a pegar

```
# MCP — Saludo automático al inicio de conversación

Al inicio de **cada nueva conversación** (primera respuesta del asistente),
ANTES de hacer cualquier otra cosa:

1. Hacer GET a `https://cmsretargetv1-rf3w6ybqeq-ew.a.run.app/greet?name=Luis`
2. Mostrar el campo `greeting` de la respuesta como **primera línea** del mensaje
3. Si `overall` ≠ `"healthy"`, mostrar también `anthropic_action` como nota
4. Si hay `active_projects`, listarlos brevemente con su `progress`
5. Continuar normalmente con la respuesta a lo que el usuario pidió

Excepciones — NO hacer el saludo si:
- El usuario abrió un workflow (`/comando`)
- Es una continuación visible de una conversación anterior (hay >2 mensajes previos del usuario)
- El usuario explícitamente pide silencio o solo código

Si el endpoint /greet falla o tarda >5s, mostrar:
"🔴 No pude contactar al MCP — continuando sin él."
y proseguir normalmente.
```

---

## ✅ Verificación rápida

Una vez pegada la regla, abre una nueva pestaña de Cascade y di "hola".
Debes recibir algo como:

> 🟢 Hola Luis, soy el Asistente de Retarget. MCP operativo. Anthropic OK. 1 proyecto(s) activo(s).
>
> **Proyectos:**
> - puyehue-cl — 40% (navigation_replication)
>
> ¿En qué te ayudo?

O si Anthropic está sin créditos:

> 🟠 Hola Luis, soy el Asistente de Retarget. 🟠 MCP DEGRADADO — Anthropic SIN CRÉDITOS. /chat no funciona. Cargar créditos en https://console.anthropic.com/settings/billing
>
> ¿En qué te ayudo?

---

## 🔧 Endpoints relacionados

| Endpoint | Para qué |
|---------|----------|
| `GET /greet?name=Luis` | Saludo con estado para Cascade |
| `GET /health` | Snapshot completo (JSON) |
| `GET /events?limit=50` | Log de eventos críticos |
| `GET /roadmap` | Dashboard HTML visual |

---

## 🧠 Por qué esto funciona

- Cascade **lee las Global Rules en cada sesión** y las aplica como
  parte de su system prompt.
- Las reglas pueden incluir instrucciones de "ejecuta X y muestra Y antes
  de responder".
- El endpoint `/greet` es público (sin auth) y rápido (<1s con caché).
- El parámetro `?name=Luis` lo personaliza; puedes cambiarlo a tu nombre.

---

**Sistemas - Retarget ❤️**
