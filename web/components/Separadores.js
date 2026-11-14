'use client';
export default function Separadores({ itens, ativo, aoMudar }) {
  return (
    <div className="separadores" role="tablist">
      {itens.map(([id, nome]) => (
        <button key={id} role="tab" aria-selected={ativo === id} onClick={() => aoMudar(id)}>{nome}</button>
      ))}
    </div>
  );
}
