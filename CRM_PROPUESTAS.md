# CRM DE PROPUESTAS — RETARGET

Tracking de todo lead/propuesta enviada. Se actualiza en el momento, no retroactivo.

---

## Estados posibles

- `LEAD` — llegó requerimiento, aún no se respondió
- `ENVIADA` — propuesta/pitch enviado, esperando respuesta
- `CONVERSACION` — cliente respondió, hay ida y vuelta
- `GANADA` — firmado / anticipo recibido / proyecto activo
- `PERDIDA` — rechazada o sin respuesta > 14 días
- `PAUSADA` — cliente pidió esperar

---

## Tabla maestra

| Fecha       | Cliente           | Canal     | Tipo              | Monto CLP  | Estado        | Última acción                    | Próximo paso                |
|-------------|-------------------|-----------|-------------------|------------|---------------|----------------------------------|------------------------------|
| 2026-04-06  | Hotel Terrantai   | Directo   | Sitio web         | —          | ENVIADA       | PDF enviado 2026-04-06           | Seguimiento 2026-04-20       |
| 2026-04-06  | puebloladehesa.cl | Directo   | Rediseño + GA4    | —          | CONVERSACION  | Reporte técnico entregado 04-21  | Revisión propuesta rediseño  |
| 2026-04-07  | Pueblo La Dehesa  | Directo   | Marcajes GA4      | —          | ENVIADA       | Propuesta GA4 2026-04-07         | —                            |
| 2026-04-14  | Cliente Lanix     | Workana   | Integración ERP   | —          | ENVIADA       | Análisis técnico 2026-04-14      | Seguimiento                  |
| 2026-04-22  | Entreviñas        | Directo   | Hosting           | —          | CONVERSACION  | PDF de hosting 2026-04-22        | Esperar respuesta            |
| 2026-04-22  | Magnolia          | Directo   | Hosting mensual   | —          | ENVIADA       | PDF abril enviado 2026-04-22     | Cobro fin de mes             |

> **Cómo usar:** agregá fila al entrar un lead. Movelo entre estados al avanzar. Si pasa a `GANADA`, creá carpeta en `PROJECTS/<cliente>/`. Si pasa a `PERDIDA`, anotá el motivo en la columna "Última acción".

---

## Notas por cliente (detalle)

### puebloladehesa.cl
- Reporte Lighthouse entregado (LCP 16.2s, TBT 770ms).
- Propuesta de rediseño Next.js + Payload CMS en revisión.
- Repositorio inicializado en `PROJECTS/puebloladehesa/puebloladehesa-rediseno`.

### Hotel Terrantai
- Propuesta sitio web enviada 2026-04-06.
- Sin respuesta aún. Hacer seguimiento antes de 2026-04-25.

### Entreviñas / Magnolia
- Clientes de hosting recurrente. Facturar fin de mes.
- Mover estos casos a un listado aparte si crecen: `CLIENTES_HOSTING.md`.

---

## Métricas mensuales (auto-calculadas manualmente cada fin de mes)

| Mes        | Enviadas | Ganadas | Perdidas | Tasa conversión |
|------------|----------|---------|----------|-----------------|
| 2026-03    | —        | —       | —        | —               |
| 2026-04    | 5+       | —       | —        | —               |

---

## Cómo registrar una propuesta nueva (paso a paso)

1. Abrir este archivo.
2. Agregar fila en la tabla maestra con fecha de hoy.
3. Poner estado `LEAD` o `ENVIADA` según corresponda.
4. Guardar el PDF de la propuesta en `DOCUMENTOS/propuestas/` con naming correcto.
5. Si cliente acepta, mover todo a `PROJECTS/<cliente>/docs/`.
