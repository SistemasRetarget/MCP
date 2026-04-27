# MCP: Deployment Validator para Pueblo La Dehesa

## Propósito
Automatizar la validación de que los cambios de código estén REALMENTE desplegados en QA antes de declarar "exitoso".

## Flujo Automático

```
1. Commit → GitHub
   ↓
2. Webhook → Railway (auto-detect)
   ↓
3. Build iniciado (monitorear)
   ↓
4. Build completado
   ↓
5. VALIDAR: ¿Cambios visibles en QA?
   ├─ SÍ → ✅ "Deployment exitoso"
   └─ NO → ❌ ALERTA + sugerencias
```

## Validaciones a Ejecutar

### Nivel 1: Código
- ✅ Cambios están en `main` de GitHub
- ✅ Commit contiene los archivos modificados

### Nivel 2: Build
- ✅ Railway detectó el push
- ✅ Build completó sin errores
- ✅ Build logs muestran "Compiled successfully"

### Nivel 3: Deployment
- ✅ URL de QA responde 200 OK
- ✅ HTML contiene nuevas clases CSS (`bg-black/40`)
- ✅ HTML contiene variables CSS (`--shopify-orange`)

### Nivel 4: Visual
- ✅ Screenshot muestra header oscuro
- ✅ Screenshot muestra botones naranja/verde
- ✅ Visual-diff < 15% con Shopify production

## Comandos MCP

### Validar Deployment
```bash
./scripts/validate-deployment.sh
# Resultado: PASS o FAIL con razón
```

### Monitorear Build
```bash
./scripts/monitor-railway-build.sh
# Espera hasta que build termina y valida
```

### Forzar Redeploy Limpio
```bash
git commit --allow-empty -m "build: Force clean Railway rebuild"
git push origin main
./scripts/monitor-railway-build.sh  # Validar después
```

## Alertas

Si validación falla:
- 🔴 **ROJO**: Los cambios NO están en QA
- Sugerir:
  1. Verificar rama en Railway (debe ser `main`)
  2. Limpiar build cache
  3. Hacer redeploy manual

## Implementación

Crear script: `scripts/monitor-railway-build.sh`
- Poolear Railway API cada 10 segundos
- Esperar hasta `status === "success"`
- Ejecutar `validate-deployment.sh`
- Reportar resultado final

