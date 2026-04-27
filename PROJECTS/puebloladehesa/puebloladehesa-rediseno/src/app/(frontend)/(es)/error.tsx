"use client";

import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-block p-4 bg-red-50 rounded-lg mb-6">
          <svg className="w-12 h-12 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4v2m0 4v2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6a2 2 0 012 2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V5a2 2 0 012-2z" />
          </svg>
        </div>

        <h1 className="font-serif text-4xl md:text-5xl font-light mb-4 text-brand-ink">
          Algo salió mal
        </h1>

        <p className="text-brand-muted text-lg mb-8 leading-relaxed">
          Disculpa, encontramos un error al cargar esta página. Nuestro equipo ha sido notificado del problema.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={reset}
            className="px-8 py-3 bg-brand-ink text-white hover:bg-brand-accent transition duration-300 font-medium"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-8 py-3 border-2 border-brand-ink text-brand-ink hover:bg-brand-soft transition duration-300 font-medium"
          >
            Volver al inicio
          </Link>
        </div>

        {error.digest && (
          <div className="mt-8 pt-8 border-t border-brand-line">
            <p className="text-xs text-brand-muted mb-2">
              ID de error: <code className="bg-brand-soft px-2 py-1 rounded">{error.digest}</code>
            </p>
            <p className="text-sm text-brand-muted">
              Si el problema persiste,{" "}
              <a href="/contacto" className="text-brand-accent hover:underline font-medium">
                contáctanos
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
