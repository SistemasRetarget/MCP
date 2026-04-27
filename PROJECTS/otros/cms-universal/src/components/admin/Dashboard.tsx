"use client";

import React, { useState, useEffect } from "react";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";
import FetchNewsButton from "./FetchNewsButton";

interface DashboardClientProps {
  userName: string;
}

const STEPS = [
  {
    number: 1,
    title: "Configurar AI",
    desc: "Agrega tu API key de Anthropic, Gemini o OpenAI",
    href: "/admin/globals/ai-settings",
    icon: "⚙️",
    tip: "Sin API key, el sistema no puede generar artículos automáticamente"
  },
  {
    number: 2,
    title: "Crear Categorías",
    desc: "Organiza el contenido temáticamente",
    href: "/admin/collections/categories",
    icon: "🏷️",
    tip: "Las categorías ayudan a organizar y filtrar el contenido"
  },
  {
    number: 3,
    title: "Agregar Fuentes",
    desc: "Conecta feeds RSS y sitemaps",
    href: "/admin/collections/sources",
    icon: "🔗",
    tip: "Puedes agregar múltiples fuentes y asignarles categorías diferentes"
  },
  {
    number: 4,
    title: "Recolectar",
    desc: "Ejecuta el fetch para obtener noticias",
    href: "#fetch",
    icon: "📡",
    tip: "El botón 'Recolectar ahora' procesa todas las fuentes activas"
  },
  {
    number: 5,
    title: "Revisar & Publicar",
    desc: "Edita y publica los artículos generados",
    href: "/admin/collections/articles",
    icon: "✅",
    tip: "Los artículos quedan como 'borrador' hasta que los revises y publiques"
  }
];

const SHORTCUTS = [
  { href: "/admin/collections/articles", title: "Artículos", desc: "Noticias publicadas, borradores y en revisión", icon: "📰", help: "Gestiona todo el contenido generado por IA" },
  { href: "/admin/collections/posts", title: "Posts", desc: "Entradas de blog manuales", icon: "📝", help: "Crea contenido editorial manualmente" },
  { href: "/admin/collections/sources", title: "Fuentes", desc: "RSS, sitios y sitemaps para recolectar", icon: "🔗", help: "Configura las fuentes de datos que alimentan el sistema" },
  { href: "/admin/collections/categories", title: "Categorías", desc: "Organización temática del contenido", icon: "🏷️", help: "Taxonomía para clasificar artículos y posts" },
  { href: "/admin/collections/landings", title: "Landings", desc: "Páginas de captación con bloques", icon: "🎯", help: "Constructor visual de páginas de aterrizaje" },
  { href: "/admin/globals/site-settings", title: "Site Settings", desc: "Identidad, logo, colores, redes", icon: "⚙️", help: "Configura la identidad visual del sitio" },
  { href: "/admin/globals/ai-settings", title: "AI Settings", desc: "Credenciales Anthropic / Gemini / OpenAI", icon: "🤖", help: "Configura las credenciales de IA" },
  { href: "/admin/collections/media", title: "Medios", desc: "Imágenes y archivos", icon: "🖼️", help: "Biblioteca de medios con versiones desktop/mobile" },
  { href: "/", title: "Ver sitio público", desc: "Blog de noticias", icon: "🌐", help: "Visualiza el sitio como lo ven los visitantes" }
];

const FAQS = [
  { q: "¿Cómo funciona la recolección automática?", a: "El sistema revisa periódicamente tus fuentes RSS, descarga nuevos items, los procesa con IA y genera artículos listos para revisar." },
  { q: "¿Puedo usar múltiples proveedores de IA?", a: "Sí. Configura credenciales para Anthropic, Gemini y/o OpenAI. El sistema probará en ese orden hasta encontrar una disponible." },
  { q: "¿Los artículos se publican automáticamente?", a: "No. Por defecto quedan como borrador para que los revises. Puedes activar 'Auto-publish' en AI Settings." },
  { q: "¿Cómo creo landings/páginas?", a: "Usa la colección 'Landings' que tiene un constructor visual con bloques: Hero, Texto, Galería, CTA, etc." },
  { q: "¿Soporta múltiples idiomas?", a: "Sí. El CMS tiene ES/EN/PT configurados. El contenido se puede traducir automáticamente con IA." }
];

const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span 
      className="pld-tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="pld-tooltip">
          {content}
          <span className="pld-tooltip-arrow" />
        </span>
      )}
    </span>
  );
};

const StepCard: React.FC<typeof STEPS[0] & { completed: boolean }> = ({ number, title, desc, href, icon, tip, completed }) => (
  <Tooltip content={tip}>
    <a href={href} className={`pld-step ${completed ? 'pld-step--completed' : ''}`}>
      <div className="pld-step__number">{completed ? '✓' : number}</div>
      <div className="pld-step__icon">{icon}</div>
      <div className="pld-step__title">{title}</div>
      <div className="pld-step__desc">{desc}</div>
    </a>
  </Tooltip>
);

const DashboardClient: React.FC<DashboardClientProps> = ({ userName }) => {
  const [showHelp, setShowHelp] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cms-universal-completed-steps');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const markStepComplete = (step: number) => {
    const updated = [...completedSteps, step];
    setCompletedSteps(updated);
    localStorage.setItem('cms-universal-completed-steps', JSON.stringify(updated));
  };

  const progress = Math.round((completedSteps.length / STEPS.length) * 100);

  return (
    <Gutter>
      {/* Welcome Banner */}
      <div className="pld-welcome">
        <div className="pld-welcome__content">
          <h2>👋 Hola, {userName}</h2>
          <p>
            Bienvenido a <strong>CMS Universal</strong>. Sigue la guía paso a paso para configurar tu blog 
            con recolección automática de noticias via IA.
          </p>
        </div>
        <div className="pld-welcome__progress">
          <div className="pld-progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                className="pld-progress-ring__bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="pld-progress-ring__fill"
                strokeDasharray={`${progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="pld-progress-ring__text">{progress}%</div>
          </div>
          <span className="pld-progress-label">Configuración</span>
        </div>
      </div>

      {/* Help Banner Toggle */}
      {showHelp && (
        <div className="pld-help-banner">
          <div className="pld-help-banner__icon">💡</div>
          <div className="pld-help-banner__content">
            <strong>¿Primera vez aquí?</strong> Sigue los 5 pasos de abajo para configurar tu CMS. 
            Puedes ocultar esta guía cuando quieras.
          </div>
          <button 
            className="pld-help-banner__close"
            onClick={() => setShowHelp(false)}
            aria-label="Cerrar ayuda"
          >
            ×
          </button>
        </div>
      )}

      {/* Step by Step Wizard */}
      <div className="pld-section">
        <div className="pld-section__header">
          <h3 className="pld-section__title">📋 Guía de Inicio Rápido</h3>
          <span className="pld-section__subtitle">Haz click en cada paso para completarlo</span>
        </div>
        <div className="pld-steps">
          {STEPS.map((step) => (
            <StepCard 
              key={step.number} 
              {...step} 
              completed={completedSteps.includes(step.number)}
            />
          ))}
        </div>
        <div className="pld-steps__actions">
          <button 
            className="pld-btn--text"
            onClick={() => setCompletedSteps([])}
          >
            🔄 Reiniciar guía
          </button>
          <button 
            className="pld-btn--text"
            onClick={() => setShowHelp(!showHelp)}
          >
            {showHelp ? '🙈 Ocultar ayuda' : '👀 Mostrar ayuda'}
          </button>
        </div>
      </div>

      {/* Quick Fetch Section */}
      <div id="fetch" className="pld-fetch-box">
        <div className="pld-fetch-box__content">
          <div className="pld-fetch-box__icon">📡</div>
          <div className="pld-fetch-box__text">
            <h3>Recolectar noticias ahora</h3>
            <p>
              Procesa todas las fuentes activas: descarga los items más recientes, 
              los pasa por IA y crea artículos listos para revisar.
            </p>
          </div>
        </div>
        <FetchNewsButton />
      </div>

      {/* Shortcuts Grid */}
      <div className="pld-section">
        <div className="pld-section__header">
          <h3 className="pld-section__title">⚡ Accesos Rápidos</h3>
          <span className="pld-section__subtitle">Pasa el mouse sobre cada tarjeta para ver más info</span>
        </div>
        <div className="pld-shortcuts">
          {SHORTCUTS.map((s) => (
            <Tooltip key={s.href} content={s.help}>
              <a 
                href={s.href} 
                className="pld-shortcut" 
                target={s.href.startsWith("/admin") ? "_self" : "_blank"} 
                rel="noopener"
              >
                <span className="pld-shortcut__icon" aria-hidden="true">{s.icon}</span>
                <div className="pld-shortcut__title">{s.title}</div>
                <p className="pld-shortcut__desc">{s.desc}</p>
              </a>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="pld-section">
        <div className="pld-section__header">
          <h3 className="pld-section__title">❓ Preguntas Frecuentes</h3>
          <span className="pld-section__subtitle">Todo lo que necesitas saber</span>
        </div>
        <div className="pld-faq">
          {FAQS.map((faq, idx) => (
            <div 
              key={idx} 
              className={`pld-faq__item ${activeFaq === idx ? 'pld-faq__item--active' : ''}`}
            >
              <button 
                className="pld-faq__question"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <span className="pld-faq__icon">{activeFaq === idx ? '−' : '+'}</span>
              </button>
              {activeFaq === idx && (
                <div className="pld-faq__answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pro Tips Box */}
      <div className="pld-protips">
        <h4>🎯 Pro Tips</h4>
        <ul>
          <li><strong>Atajo de teclado:</strong> Presiona <kbd>G</kbd> luego <kbd>A</kbd> para ir a Artículos</li>
          <li><strong>Duplicar:</strong> En cualquier colección, usa el menú de acciones para duplicar items</li>
          <li><strong>Previsualizar:</strong> Los artículos en borrador tienen URL de previsualización antes de publicar</li>
          <li><strong>Bulk actions:</strong> Selecciona múltiples items para publicar/eliminar en lote</li>
        </ul>
      </div>
    </Gutter>
  );
};

const Dashboard: React.FC<AdminViewServerProps> = ({ initPageResult }) => {
  const user = initPageResult.req.user as { name?: string; email?: string } | null;
  const userName = user?.name || user?.email || "editor";

  return <DashboardClient userName={userName} />;
};

export default Dashboard;
