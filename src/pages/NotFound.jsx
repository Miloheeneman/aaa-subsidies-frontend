import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-app flex flex-col items-center py-24 text-center">
      <div className="text-7xl font-extrabold text-brand-green">404</div>
      <h1 className="mt-3 text-2xl font-bold text-gray-900">
        Pagina niet gevonden
      </h1>
      <p className="mt-2 max-w-md text-gray-600">
        Deze pagina bestaat niet of is verplaatst. Controleer de link of
        ga terug naar de homepagina.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link to="/" className="btn-primary">
          Terug naar home
        </Link>
        <Link to="/subsidiecheck" className="btn-secondary">
          Start subsidiecheck
        </Link>
      </div>
    </div>
  );
}
