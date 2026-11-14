export const metadata = { title: 'Política de privacidade' };

export default function Privacidade() {
  return (
    <div className="contentor pagina media texto-vaga">
      <h1>Política de privacidade</h1>
      <p>Esta política explica que dados recolhemos e como os usamos. Atualize este texto com os dados legais da sua entidade antes de publicar o portal.</p>
      <h2>Dados que recolhemos</h2>
      <ul>
        <li>Dados de conta: nome, e-mail, telefone e palavra-passe (guardada de forma cifrada).</li>
        <li>Dados de candidatura: currículo, mensagem e estado da candidatura.</li>
        <li>Dados da empresa: nome, NIF, setor, endereço e vagas publicadas.</li>
      </ul>
      <h2>Como usamos os dados</h2>
      <p>Usamos os dados para gerir a sua conta, enviar a sua candidatura à empresa escolhida e manter o portal seguro. O currículo só é visível para a empresa a que se candidatou.</p>
      <h2>Cookies e anúncios</h2>
      <p>Usamos armazenamento local do navegador para manter a sessão iniciada. Se ativar publicidade de terceiros (por exemplo, Google AdSense), descreva aqui os cookies que esses serviços utilizam.</p>
      <h2>Os seus direitos</h2>
      <p>Pode corrigir os seus dados no perfil e pedir a eliminação da conta através da página de contacto.</p>
    </div>
  );
}
