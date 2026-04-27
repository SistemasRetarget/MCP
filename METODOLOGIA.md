# METODOLOGÍA DE TRABAJO — RETARGET

Documento maestro. Describe cómo se organizan archivos, cómo se nombran, y el ciclo de vida de cada entregable.
Última actualización: 2026-04-22

---

## 1. Filosofía

Tres reglas que manda todo lo demás:

1. **Un archivo, una fuente de verdad.** Si hay dos versiones del mismo reporte, la más reciente gana y la anterior se archiva con fecha.
2. **Todo entregable al cliente empieza como plantilla.** Nunca se escribe una propuesta desde cero; se parte de `DOCUMENTOS/plantillas/`.
3. **Fecha al nombre, carpeta al contexto.** El nombre dice "qué y cuándo"; la carpeta dice "de qué cliente/proyecto".

---

## 2. Estructura de carpetas (raíz: `Desktop/RETARGET-WORKSPACE/`)

```
RETARGET-WORKSPACE/
├── METODOLOGIA.md               ← este archivo
├── CRM_PROPUESTAS.md            ← tracking de propuestas enviadas
│
├── DOCUMENTOS/
│   ├── analisis/                ← briefs técnicos, auditorías
│   ├── plantillas/              ← esqueletos reutilizables (no tocar sin versionar)
│   ├── propuestas/              ← pitches, servicios, propuestas comerciales
│   └── reportes/                ← entregables de auditoría/estado a cliente
│
├── PROJECTS/
│   ├── retarget-cl/             ← sitio/infra propia de Retarget
│   ├── news-cms/                ← iniciativa interna (producto empaquetable)
│   ├── <cliente>/               ← una carpeta por cliente (ej: puebloladehesa)
│   └── otros/                   ← experimentos/sandbox
│
├── DEMOSTRACIONES/
│   ├── html-demos/              ← demos navegables para mostrar a cliente
│   └── screenshots/             ← capturas para propuestas/documentación
│
├── ARCHIVES/
│   └── zips/                    ← entregables empaquetados y versiones congeladas
│
├── REFERENCIAS/
│   └── workana/                 ← plantillas y speech para captación
│
├── Phone/                       ← sincronización futura celular
└── WhatsApp/                    ← exportaciones/chats de clientes
```

**Regla de oro:** si un archivo nuevo no sabés dónde va, pertenece a `DOCUMENTOS/` (si es texto/informe) o a `PROJECTS/<cliente>/` (si es código/assets del proyecto).

---

## 3. Convención de nombres

### 3.1 Documentos de cliente (propuestas, reportes, análisis)

Formato:
```
<TIPO>_<CLIENTE>_<YYYY-MM-DD>[_v<N>].<ext>
```

Ejemplos correctos:
- `PROPUESTA_puebloladehesa_2026-04-06.pdf`
- `REPORTE_puebloladehesa_2026-04-21_v2.pdf`
- `ANALISIS_entrevinas_2026-04-22.md`

**Prohibido:** espacios, acentos, mayúsculas mezcladas. Todo en minúsculas excepto el prefijo de tipo.

### 3.2 Plantillas (en `DOCUMENTOS/plantillas/`)

Siempre en MAYÚSCULAS, sin fecha:
- `PLANTILLA_PROPUESTA.md`
- `PLANTILLA_REPORTE.md`
- `PLANTILLA_ANALISIS.md`
- `PLANTILLA_BRIEF_CLIENTE.md`

### 3.3 Código y proyectos

- Carpeta por cliente en minúsculas y sin espacios: `puebloladehesa`, `entrevinas`, `tanica`.
- Ramas git: `main` (producción), `dev` (integración), `feature/<ticket>`.

### 3.4 ZIPs archivados

```
<PROYECTO>_<YYYY-MM-DD>.zip
```
Ej: `retarget-news-theme_2026-04-14.zip`, `portal-editorial-v3_2026-04-20.zip`.

---

## 4. Ciclo de vida por entregable

### 4.1 Propuesta comercial

```
[Lead entra] → analisis/BRIEF_<cliente>.md
            → propuestas/PROPUESTA_<cliente>_<fecha>.md  (copia de plantilla)
            → exportar a PDF → enviar
            → registrar en CRM_PROPUESTAS.md
            → si gana: mover a PROJECTS/<cliente>/docs/
            → si pierde: mover a ARCHIVES/zips/ perdidas_<YYYY>.zip
```

### 4.2 Reporte técnico (auditoría, estado, cierre)

```
[Solicitud/hito] → reportes/REPORTE_<cliente>_<fecha>.html
                 → revisar → exportar a PDF adjunto
                 → enviar por correo
                 → registrar en CRM con número de reporte
```

### 4.3 Proyecto de desarrollo

```
PROJECTS/<cliente>/
├── docs/          ← análisis, propuesta ganada, contrato, actas
├── src/           ← código (o repo git)
├── assets/        ← imágenes, videos del cliente
└── entregables/   ← lo que se le pasa al cliente (PDFs, ZIPs finales)
```

---

## 5. Flujo de captación (Workana / leads directos)

1. **Llega requerimiento** → se guarda crudo en `REFERENCIAS/workana/leads_<YYYY-MM>.md` (apéndice con fecha + link).
2. **Análisis del requerimiento** usando `REFERENCIAS/workana/workana_formato_analisis.md` → salida en `DOCUMENTOS/analisis/BRIEF_<cliente>_<fecha>.md`.
3. **Escritura de propuesta** con plantilla → `DOCUMENTOS/propuestas/`.
4. **Registro en CRM** → `CRM_PROPUESTAS.md` con estado (enviada / en conversación / ganada / perdida).
5. **Seguimiento a 3 / 7 / 14 días** si no hay respuesta.

---

## 6. Reglas de versionado

- Si hay que **modificar un entregable ya enviado** → se crea `_v2`, nunca se sobreescribe el original.
- Si es una **edición interna antes de enviar** → se puede sobreescribir (solo está en tu disco).
- **Plantillas**: cualquier cambio estructural crea `PLANTILLA_PROPUESTA_v2.md`; la anterior se mueve a `ARCHIVES/zips/plantillas_<YYYY>.zip`.

---

## 7. Qué NO hacer

- No mezclar archivos personales (boarding passes, etc) con el workspace. Esos van a `~/Downloads` o `~/Documents`.
- No crear carpetas "temp", "nuevo", "pruebas" en la raíz. Usá `PROJECTS/otros/` para experimentos.
- No dejar archivos con espacios ni acentos en el nombre (rompen en servidores Linux).
- No enviar nunca el `.md` directo al cliente: siempre PDF/HTML exportado.
- No borrar ZIPs de `ARCHIVES/` hasta que pasen 12 meses.

---

## 8. Herramientas asumidas

- **Editor:** VS Code / Windsurf (la config de `.windsurf/` vive en la raíz del workspace).
- **Exportación MD → PDF:** usar el renderer HTML con CSS de marca, no pandoc directo.
- **Control de versiones:** git para proyectos de código; nombre-con-fecha para documentos.
- **Hosting temporal de demos:** `DEMOSTRACIONES/html-demos/` abierto directo en navegador o subido a SiteGround staging.

---

## 9. Checklist antes de enviar cualquier cosa al cliente

- [ ] El archivo se llama `<TIPO>_<CLIENTE>_<FECHA>.<ext>`
- [ ] No contiene rutas locales (`/Users/spam11/...`), credenciales ni notas internas
- [ ] Está exportado a PDF o HTML (no .md crudo)
- [ ] Registrado en `CRM_PROPUESTAS.md` o en el log del proyecto
- [ ] Copia en `ARCHIVES/zips/` si es versión final firmada

---

## 10. Ciclo de vida de proyectos de código

Todas las aplicaciones (Next.js, Node.js, etc.) en `PROJECTS/<cliente>/` o `PROJECTS/news-cms/` deben cumplir con este ciclo antes del despliegue a producción.

### 10.1 Pre-deploy security audit (obligatorio)

Antes de cualquier push a `main` o antes de deployar:

```bash
cd PROJECTS/<proyecto>/
# 1. Auditar dependencias
npm audit

# 2. Revisar funciones deprecadas en código
npx tsc --noEmit  # TypeScript detecta deprecaciones
npm run lint       # ESLint con reglas `no-deprecated`

# 3. Actualizar dependencias (si hay fixes disponibles)
npm audit fix
npm audit fix --force  # solo si se valida el cambio

# 4. Ejecutar tests
npm test
npm run test:e2e  # si existen

# 5. Build local
npm run build

# 6. Validar no hay secretos en el commit
git diff --cached | grep -iE "(secret|password|api.?key|token)" && echo "⚠️  SECRETOS DETECTADOS" || echo "✅ Sin secretos"

# 7. Verificar .env no se sube
git ls-files | grep "\.env$" && echo "❌ .env tracked!" || echo "✅ .env ignorado"
```

### 10.2 Checklist pre-despliegue

Antes de hacer `git push` a `main`:

- [ ] `npm audit` está en verde (o vulnerabilidades documentadas en `SECURITY.md`)
- [ ] No hay funciones deprecated en TypeScript (`tsc --noEmit` sin errores)
- [ ] ESLint pasa (`npm run lint`)
- [ ] Tests pasan (`npm test`)
- [ ] Build local exitoso (`npm run build`)
- [ ] `.env` y `data/*.db` están en `.gitignore`
- [ ] Sin credenciales en commits (chequear historio reciente con `git log -p`)
- [ ] Cambios de Node.js documentados en `Dockerfile` y `package.json` (engines)
- [ ] CHANGELOG.md actualizado (si el proyecto lo tiene)

### 10.3 Documentación de dependencias vulnerables

Si una vulnerabilidad no se puede fixear inmediatamente, se anota en `PROJECTS/<proyecto>/SECURITY.md`:

```markdown
# Security status

## Vulnerabilidades conocidas

| Paquete | CVE | Severidad | Mitigation | Fecha |
|---------|-----|-----------|-----------|-------|
| uuid | GHSA-w5hq-g745-h8pq | moderate | No contacta usuario input directo | 2026-04-23 |
```

### 10.4 Actualización de dependencias (semanal)

```bash
npm outdated           # muestra qué está desactualizado
npm update             # minor/patch updates
npm install <pkg>@latest  # major update si es prioritario
```

---

## 11. Evolución de este documento

Este archivo se revisa cada **3 meses** o cuando aparece una fricción repetida. Cambios estructurales al workspace se anotan en el changelog al final.

### Changelog

- **2026-04-23** — Sección 10: Ciclo de vida de código, pre-deploy security audit, vulnerabilidades documentadas.
- **2026-04-22** — Versión inicial. Formaliza estructura ya existente y agrega: `CRM_PROPUESTAS.md`, plantillas `PLANTILLA_*.md`, convención de naming con fecha.
