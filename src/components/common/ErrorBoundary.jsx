import { Component } from 'react';

/**
 * Capture les erreurs de rendu React pour éviter la page blanche.
 * En développement, affiche le détail de l'erreur pour faciliter le débogage.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Trace complète en console pour le diagnostic
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary a intercepté une erreur :', error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isDev = import.meta.env.DEV;
    return (
      <div className="grid min-h-screen place-items-center bg-surface p-6 dark:bg-primary-950">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-line dark:bg-primary-900 dark:ring-white/10">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-danger/10 text-2xl text-danger">
            !
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary dark:text-white">
            Une erreur est survenue
          </h1>
          <p className="mt-2 text-sm text-muted">
            Un problème inattendu s'est produit. Vous pouvez réessayer ou recharger la page.
          </p>

          {isDev && (
            <pre className="mt-5 max-h-60 overflow-auto whitespace-pre-wrap rounded-xl bg-primary/95 p-4 text-left text-xs leading-relaxed text-red-300">
              {error.message}
              {error.stack ? `\n\n${error.stack}` : ''}
            </pre>
          )}

          <div className="mt-6 flex justify-center gap-3">
            <button onClick={this.handleReset} className="btn-outline">
              Réessayer
            </button>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
