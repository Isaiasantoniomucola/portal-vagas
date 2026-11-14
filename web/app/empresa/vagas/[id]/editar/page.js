'use client';
import { useParams } from 'next/navigation';
import { useProteger } from '@/components/Auth';
import FormVaga from '@/components/FormVaga';

export default function EditarVaga() {
  const { id } = useParams();
  const { pronto } = useProteger('empresa');
  if (!pronto) return <p className="contentor pagina suave">A carregar…</p>;
  return <div className="contentor pagina"><h1>Editar vaga</h1><FormVaga id={id} /></div>;
}
