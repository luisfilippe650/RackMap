import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="page-panel">
      <h1>Página não encontrada</h1>
      <Link className="button button-primary" to="/maps">
        Voltar para mapas
      </Link>
    </section>
  );
}
