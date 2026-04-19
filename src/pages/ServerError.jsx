import { Link } from "react-router-dom";

/**
 * Generic 500-style error screen. Used by ErrorBoundary as its fallback
 * and can also be rendered by API consumers when the backend is down.
 */
export default function ServerError({ message, onRetry }) {
  return (
    <div className="container-app flex flex-col items-center py-24 text-center">
      <div className="text-7xl font-extrabold text-red-500">500</div>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">
        Er is iets misgegaan
      </h1>
      <p className="mt-2 max-w-md text-gray-600">
        {message ||
          "Door een onverwachte fout konden we deze pagina niet laden. " +
            "Probeer het zo opnieuw — als het probleem aanhoudt, neem dan " +
            "contact op met AAA-Lex."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-primary">
            Opnieuw proberen
          </button>
        )}
        <Link to="/" className="btn-secondary">
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
