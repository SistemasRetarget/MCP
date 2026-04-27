import type { PromptTemplate, GeminiModel } from '@/types';

export const promptTemplates: PromptTemplate[] = [
  // Architecture Templates
  {
    id: 'system-architecture-review',
    name: 'Revisión de Arquitectura de Sistema',
    description: 'Análisis completo de arquitectura existente con recomendaciones de mejora',
    category: 'architecture',
    defaultModel: 'gemini-1.5-pro',
    content: `Actúa como un Arquitecto de Sistemas Senior con 15+ años de experiencia en sistemas distribuidos a escala.

Realiza una revisión exhaustiva de la siguiente arquitectura de sistema:

## Contexto del Sistema
{{system_context}}

## Requisitos Actuales
{{requirements}}

## Arquitectura Actual
{{current_architecture}}

Por favor, proporciona:

1. **Análisis de Fortalezas**: ¿Qué está bien diseñado?
2. **Puntos de Mejora**: Identifica 3-5 áreas críticas para optimizar
3. **Riesgos Identificados**: Problemas potenciales de escalabilidad, seguridad o mantenibilidad
4. **Recomendaciones Priorizadas**: Lista ordenada por impacto/costo
5. **Patrones Sugeridos**: Patrones de diseño aplicables al contexto
6. **Diagrama de Arquitectura Objetivo**: Descripción textual de la arquitectura ideal

Formato de respuesta:
- Usa markdown con secciones claras
- Incluye diagramas Mermaid donde aplique
- Prioriza soluciones pragmáticas sobre teoría pura`,
    variables: ['system_context', 'requirements', 'current_architecture'],
  },
  {
    id: 'microservices-design',
    name: 'Diseño de Microservicios',
    description: 'Diseño de arquitectura de microservicios desde cero',
    category: 'architecture',
    defaultModel: 'gemini-1.5-pro',
    content: `Como Arquitecto de Sistemas especializado en microservicios, diseña una arquitectura para:

## Dominio del Negocio
{{business_domain}}

## Casos de Uso Principales
{{use_cases}}

## Restricciones
{{constraints}}

## Volumen Esperado
{{traffic_volume}}

Proporciona:

1. **Bounded Contexts**: Identificación de contextos delimitados (DDD)
2. **Servicios Propuestos**: Lista con responsabilidades claras
3. **Comunicación entre Servicios**: Sync vs Async, patrones de mensajería
4. **Estrategia de Datos**: Uno por servicio vs compartido
5. **API Gateway**: Diseño y responsabilidades
6. **Observabilidad**: Logging, tracing, métricas
7. **Estrategia de Despliegue**: Contenedores, orquestación
8. **Diagrama de Componentes**: Descripción textual detallada

Consideraciones:
- Balance entre granularidad y complejidad
- Resiliencia y circuit breakers
- Versionado de APIs
- Event sourcing donde aplique`,
    variables: ['business_domain', 'use_cases', 'constraints', 'traffic_volume'],
  },
  {
    id: 'database-design',
    name: 'Diseño de Base de Datos',
    description: 'Modelado de datos relacional y NoSQL',
    category: 'architecture',
    defaultModel: 'gemini-1.5-flash',
    content: `Diseña un esquema de base de datos óptimo para:

## Entidades Principales
{{entities}}

## Relaciones
{{relationships}}

## Patrones de Acceso
{{access_patterns}}

## Escalabilidad Requerida
{{scalability_requirements}}

Entrega:

1. **Modelo Conceptual**: Diagrama ER descriptivo
2. **Modelo Lógico**: Tablas/colecciones con tipos
3. **Índices Propuestos**: Justificación para cada índice
4. **Normalización**: Nivel y justificación
5. **Sharding/Particionamiento**: Estrategia si aplica
6. **Replicación**: Configuración propuesta
7. **Migraciones**: Estrategia para cambios futuros
8. **Queries de Ejemplo**: SQL/CQL/MongoQL representativos

Considera:
- ACID vs BASE según caso de uso
- Hot spots y distribución de datos
- Estrategia de soft deletes
- Auditoría y timestamps`,
    variables: ['entities', 'relationships', 'access_patterns', 'scalability_requirements'],
  },
  
  // Code Templates
  {
    id: 'code-generation',
    name: 'Generación de Código',
    description: 'Generar código limpio y bien estructurado',
    category: 'code',
    defaultModel: 'gemini-1.5-flash',
    content: `Genera código limpio, tipado y bien documentado para:

## Requerimiento
{{requirement}}

## Lenguaje/Framework
{{language}}

## Estilo y Convenciones
{{style_guide}}

## Componentes Existentes
{{existing_components}}

El código debe incluir:
1. Implementación completa y funcional
2. Manejo de errores robusto
3. Logging apropiado
4. Tests unitarios (si aplica)
5. Documentación inline (JSDoc/docstrings)
6. Ejemplo de uso

Principios:
- SOLID
- DRY
- KISS
- Código autoexplicativo con nombres descriptivos`,
    variables: ['requirement', 'language', 'style_guide', 'existing_components'],
  },
  {
    id: 'refactoring',
    name: 'Refactoring de Código',
    description: 'Mejorar código existente manteniendo comportamiento',
    category: 'code',
    defaultModel: 'gemini-1.5-flash-8b',
    content: `Refactoriza el siguiente código manteniendo su comportamiento exacto:

## Código Original
{{original_code}}

## Lenguaje
{{language}}

## Problemas Identificados (opcional)
{{known_issues}}

Proporciona:
1. **Código Refactorizado**: Versión mejorada
2. **Cambios Realizados**: Lista de modificaciones
3. **Beneficios**: Por qué es mejor ahora
4. **Riesgos**: Qué podría romperse

Enfoque:
- Eliminar duplicación
- Mejorar nombres
- Reducir complejidad ciclomática
- Aplicar patrones de diseño donde apropiado
- Mantener compatibilidad de API pública`,
    variables: ['original_code', 'language', 'known_issues'],
  },

  // Review Templates
  {
    id: 'pr-review',
    name: 'Revisión de Pull Request',
    description: 'Review detallado de cambios de código',
    category: 'review',
    defaultModel: 'gemini-1.5-flash',
    content: `Realiza una revisión de código profesional para:

## Cambios Propuestos
{{diff}}

## Contexto
{{context}}

## Estándares del Equipo
{{standards}}

Estructura tu review:

1. **Resumen**: Visión general de los cambios
2. **Aspectos Positivos**: Qué se hizo bien
3. **Issues Críticos**: Bugs, seguridad, performance
4. **Sugerencias de Mejora**: Opcional pero recomendado
5. **Preguntas**: Puntos que necesitan clarificación
6. **Veredicto**: 
   - ✅ Aprobado
   - ⚠️ Aprobado con comentarios menores
   - ❌ Requiere cambios

Sé constructivo y específico. Cita líneas de código cuando relevante.`,
    variables: ['diff', 'context', 'standards'],
  },

  // Documentation Templates
  {
    id: 'api-documentation',
    name: 'Documentación de API',
    description: 'Generar documentación técnica completa',
    category: 'documentation',
    defaultModel: 'gemini-1.5-flash',
    content: `Genera documentación técnica completa para:

## API/Componente
{{api_description}}

## Endpoints/Métodos
{{endpoints}}

## Autenticación
{{auth_method}}

## Consideraciones Especiales
{{special_notes}}

Documentación requerida:

1. **Overview**: Propósito y alcance
2. **Quick Start**: Primeros pasos en <5 min
3. **Referencia Completa**:
   - Endpoints/métodos con parámetros
   - Request/response examples
   - Códigos de error
4. **Guías de Uso**: Casos comunes
5. **SDKs/Clientes**: Si aplica
6. **Changelog**: Versión actual y cambios recientes

Formato: Markdown con sintaxis clara para ejemplos de código.`,
    variables: ['api_description', 'endpoints', 'auth_method', 'special_notes'],
  },

  // Debugging Templates
  {
    id: 'debug-analysis',
    name: 'Análisis de Bug',
    description: 'Diagnóstico sistemático de problemas',
    category: 'debugging',
    defaultModel: 'gemini-1.5-flash',
    content: `Ayuda a diagnosticar el siguiente problema:

## Síntoma
{{symptom}}

## Logs/Error Messages
{{logs}}

## Código Relevante
{{code}}

## Entorno
{{environment}}

## Pasos para Reproducir
{{reproduction_steps}}

Análisis requerido:

1. **Hipótesis Principales**: Top 3 posibles causas ordenadas por probabilidad
2. **Árbol de Decisión**: Cómo validar cada hipótesis
3. **Root Cause más Probable**: Explicación detallada
4. **Fix Propuesto**: Código o configuración
5. **Prevención**: Cómo evitar que vuelva a ocurrir
6. **Monitoreo**: Logs/métricas para detectar temprano`,
    variables: ['symptom', 'logs', 'code', 'environment', 'reproduction_steps'],
  },
  {
    id: 'performance-optimization',
    name: 'Optimización de Performance',
    description: 'Análisis y mejora de rendimiento',
    category: 'debugging',
    defaultModel: 'gemini-1.5-flash',
    content: `Optimiza el performance de:

## Componente/Sistema
{{component}}

## Métricas Actuales
{{current_metrics}}

## Código/Query Problema
{{problematic_code}}

## Objetivos
{{targets}}

Entrega:

1. **Análisis de Cuellos de Botella**: Identificación de hotspots
2. **Optimizaciones Propuestas**: 
   - Prioridad: Alta/Media/Baja
   - Impacto esperado
   - Esfuerzo requerido
3. **Código Optimizado**: Versiones mejoradas
4. **Benchmark Comparativo**: Antes vs Después estimado
5. **Estrategia de Caching**: Si aplica
6. **Monitoreo**: Métricas clave a trackear`,
    variables: ['component', 'current_metrics', 'problematic_code', 'targets'],
  },
];

export const getTemplatesByCategory = (category: string) => {
  return promptTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string) => {
  return promptTemplates.find(t => t.id === id);
};

export const fillTemplate = (template: PromptTemplate, variables: Record<string, string>) => {
  let filled = template.content;
  for (const [key, value] of Object.entries(variables)) {
    filled = filled.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return filled;
};
