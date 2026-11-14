export default function Progresso({ valor, minimo }) {
  return (
    <div>
      <div className="progresso" role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100} aria-label="Perfil completo">
        <span style={{ width: `${valor}%`, background: valor >= (minimo ?? 50) ? 'var(--ok)' : 'var(--ouro)' }} />
        {minimo ? <i style={{ left: `${minimo}%` }} title={`Mínimo para candidatar: ${minimo}%`} /> : null}
      </div>
    </div>
  );
}
