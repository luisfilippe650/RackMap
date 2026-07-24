export function LoadingState({ label = 'Carregando' }: { label?: string }) {
  return <div className="loading-state">{label}</div>;
}
