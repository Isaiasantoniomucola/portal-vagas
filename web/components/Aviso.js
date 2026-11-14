export default function Aviso({ tipo = 'erro', children }) {
  if (!children) return null;
  return <p role={tipo === 'erro' ? 'alert' : 'status'} className={`aviso aviso-${tipo}`}>{children}</p>;
}
