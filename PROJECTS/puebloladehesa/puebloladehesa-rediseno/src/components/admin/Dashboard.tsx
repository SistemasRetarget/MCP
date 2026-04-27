import React from "react";
import { Gutter } from "@payloadcms/ui";
import type { AdminViewServerProps } from "payload";

const SHORTCUTS = [
  { href: "/admin/collections/houses", title: "Casas", desc: "Fichas de casas, galerías y descripciones", icon: "\u{1F3E1}" },
  { href: "/admin/collections/pages", title: "Páginas", desc: "Home, Nosotros, Experiencias, Contacto", icon: "\u{1F4C4}" },
  { href: "/admin/collections/media", title: "Biblioteca de imágenes", desc: "Sube fotos y vincúlalas a casas o páginas", icon: "\u{1F5BC}" },
  { href: "/admin/collections/users", title: "Usuarios", desc: "Administradores y editores del sitio", icon: "\u{1F464}" },
  { href: "/", title: "Ver sitio público", desc: "Abre el sitio en otra pestaña", icon: "\u{1F310}" },
  { href: "/api/graphql-playground", title: "GraphQL", desc: "Consola para desarrolladores", icon: "\u26A1" }
];

const Dashboard: React.FC<AdminViewServerProps> = ({ initPageResult }) => {
  const user = initPageResult.req.user as { name?: string; email?: string } | null;
  const userName = user?.name || user?.email || "editor";

  return (
    <Gutter>
      <div className="pld-welcome">
        <h2>Hola, {userName}</h2>
        <p>
          Bienvenido al panel de administración de Pueblo La Dehesa. Desde aquí podés editar casas,
          páginas y subir imágenes. Los cambios se reflejan en el sitio automáticamente.
        </p>
      </div>

      <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.3rem", marginBottom: "1rem", color: "#2c2419" }}>
        Accesos rápidos
      </h3>

      <div className="pld-shortcuts">
        {SHORTCUTS.map((s) => (
          <a key={s.href} href={s.href} className="pld-shortcut" target={s.href.startsWith("/admin") ? "_self" : "_blank"} rel="noopener">
            <span className="pld-shortcut__icon" aria-hidden="true">{s.icon}</span>
            <div className="pld-shortcut__title">{s.title}</div>
            <p className="pld-shortcut__desc">{s.desc}</p>
          </a>
        ))}
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8dfd0", borderRadius: 12, padding: "1.5rem 1.75rem", marginTop: "1rem" }}>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.15rem", margin: "0 0 0.75rem", color: "#2c2419" }}>
          Consejos rápidos
        </h3>
        <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.7, color: "#4a3d2c" }}>
          <li>Usá el selector <strong>ES / EN</strong> arriba a la derecha para editar cada idioma por separado.</li>
          <li>Podés guardar como <strong>borrador</strong> y publicar después.</li>
          <li>Las imágenes se redimensionan automáticamente a 3 tamaños (thumbnail, card, hero).</li>
          <li>Cualquier cambio en una Casa/Página queda versionado y revertible.</li>
        </ul>
      </div>
    </Gutter>
  );
};

export default Dashboard;
