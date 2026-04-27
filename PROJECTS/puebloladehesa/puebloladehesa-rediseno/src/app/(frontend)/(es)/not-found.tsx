import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="font-serif text-7xl md:text-8xl font-light mb-6 text-brand-ink">404</h1>
        <h2 className="font-serif text-3xl md:text-4xl mb-4">Página no encontrada</h2>
        <p className="text-brand-muted text-lg mb-12 leading-relaxed">
          Lo sentimos, la página que buscas no existe o ha sido movida. Es posible que el enlace sea incorrecto o que la página haya sido removida.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-brand-ink text-white hover:bg-brand-accent transition duration-300 font-medium"
          >
            Volver al inicio
          </Link>
          <Link
            href="/casas"
            className="inline-block px-8 py-3 border-2 border-brand-ink text-brand-ink hover:bg-brand-soft transition duration-300 font-medium"
          >
            Ver casas
          </Link>
        </div>

        <div className="mt-16 pt-12 border-t border-brand-line">
          <p className="text-sm text-brand-muted mb-4">¿Necesitas ayuda?</p>
          <Link
            href="/contacto"
            className="text-brand-accent hover:underline font-medium"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </div>
  );
}
