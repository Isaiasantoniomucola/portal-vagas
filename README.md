# portal-vagas
O Vagas.ao liga quem procura trabalho a empresas que estão a contratar em todas as províncias de Angola.
# Vagas.ao — Portal de vagas de emprego
 Next.js 14 + React 18, HTML, CSS, JavaScript | `web/` |
| API | Node.js + Express | `backend/` |
| Base de dados | MySQL 8 | `database/schema.sql` |

## Perfis de utilizador
- **Candidato**: procura vagas com filtros, guarda vagas, candidata-se com currículo (PDF/DOC/DOCX), acompanha e retira candidaturas, edita o perfil.
- **Empresa**: publica e edita vagas (ficam *em revisão*), encerra vagas, vê candidaturas, abre os currículos e muda o estado de cada candidatura.
- **Administrador**: aprova/rejeita vagas, gere utilizadores (ativar/desativar), áreas, províncias e mensagens de contacto.

## Como executar

### 2. API
```bash
cd backend
cp .env.example .env     # preencha DB_* e JWT_SECRET
npm install
npm run seed             # cria o administrador e dados de demonstração
npm run dev              # http://localhost:4000
```

### 3. Site
```bash
cd web
cp .env.example .env.local
npm install
npm run dev              # http://localhost:3000
```
