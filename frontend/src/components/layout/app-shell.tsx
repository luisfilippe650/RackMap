import { Check, LayoutGrid, Link2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { API_PATH_PREFIX, DEFAULT_API_ORIGIN, getApiBaseUrl, getApiOrigin, normalizeApiBaseUrl, normalizeApiOrigin, setApiBaseUrl } from '../../services/api';

function apiHealthUrls(apiBaseUrl: string) {
  const normalizedUrl = normalizeApiBaseUrl(apiBaseUrl);
  const baseUrl = normalizedUrl.replace(/\/$/, '');

  return [`${baseUrl}/maps?take=1`];
}

export function AppShell() {
  const [apiUrl, setApiUrl] = useState(() => getApiOrigin());
  const [apiUrlDraft, setApiUrlDraft] = useState(() => getApiOrigin());
  const [isApiUrlDialogOpen, setIsApiUrlDialogOpen] = useState(false);
  const [apiUrlStatus, setApiUrlStatus] = useState<string | null>(null);
  const [isTestingApiUrl, setIsTestingApiUrl] = useState(false);

  function openApiUrlDialog() {
    setApiUrlDraft(apiUrl);
    setApiUrlStatus(null);
    setIsApiUrlDialogOpen(true);
  }

  function saveApiUrl() {
    const nextUrl = normalizeApiOrigin(apiUrlDraft);

    setApiUrl(nextUrl);
    setApiBaseUrl(nextUrl);
    setIsApiUrlDialogOpen(false);
    window.location.reload();
  }

  async function testApiUrl() {
    setIsTestingApiUrl(true);
    setApiUrlStatus(null);

    for (const url of apiHealthUrls(apiUrlDraft)) {
      try {
        const response = await fetch(url);

        if (response.ok) {
          setApiUrlStatus('Conexão realizada com sucesso.');
          setIsTestingApiUrl(false);
          return;
        }
      } catch {
        // Try the next candidate URL before showing the final error.
      }
    }

    setApiUrlStatus('Não foi possível conectar à API. Verifique o endereço informado.');
    setIsTestingApiUrl(false);
  }

  return (
    <div className="app-shell">
      {isApiUrlDialogOpen ? (
        <div className="confirm-overlay" role="presentation">
          <div className="confirm-dialog api-url-dialog" role="dialog" aria-modal="true" aria-labelledby="api-url-title">
            <div className="dialog-title-row">
              <h2 id="api-url-title">API URL</h2>
              <button className="icon-button" type="button" aria-label="Fechar" onClick={() => setIsApiUrlDialogOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <label className="api-url-form-field">
              <span>Endereço da API</span>
              <input
                autoFocus
                placeholder="Ex: http://127.0.0.1:3333"
                value={apiUrlDraft}
                onChange={(event) => {
                  setApiUrlDraft(event.target.value);
                  setApiUrlStatus(null);
                }}
              />
            </label>
            <p className="muted-text">
              Informe somente o protocolo e endereço. O caminho {API_PATH_PREFIX} e adicionado automaticamente. Se deixar vazio, volta para {DEFAULT_API_ORIGIN}.
            </p>
            {apiUrlStatus ? <p className={apiUrlStatus.startsWith('Não') ? 'error-text' : 'success-text'}>{apiUrlStatus}</p> : null}
            <div className="confirm-actions">
              <button className="button button-secondary" type="button" onClick={() => setIsApiUrlDialogOpen(false)}>
                Cancelar
              </button>
              <button className="button button-secondary" type="button" onClick={testApiUrl} disabled={isTestingApiUrl}>
                <Link2 size={16} />
                {isTestingApiUrl ? 'Testando...' : 'Testar conexão'}
              </button>
              <button className="button button-primary" type="button" onClick={saveApiUrl}>
                <Check size={16} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <header className="topbar">
        <NavLink className="brand" to="/maps">
          <LayoutGrid size={22} />
          <span>RackMap</span>
        </NavLink>
        <nav className="topnav">
          <NavLink to="/maps">Mapas</NavLink>
          <NavLink to="/maps/new">
            <Plus size={16} />
            Novo mapa
          </NavLink>
        </nav>
        <button className="button button-secondary api-url-button" type="button" onClick={openApiUrlDialog} title={getApiBaseUrl()}>
          <Link2 size={16} />
          API URL
        </button>
      </header>
      <main className="page-wrap">
        <Outlet />
      </main>
    </div>
  );
}
