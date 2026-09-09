# Deploy no Render

A configuração render.yaml na raiz permite criar um Blueprint no Render conectado a este repositório. Revise o plano e o custo no painel antes de criar o serviço.

Também é possível criar manualmente New → Web Service com:

- Repositório: RafaelRef/armador_brasil; branch: main.
- Root Directory: app; runtime: Node.
- Build Command: npm ci --include=dev && npm run build:render
- Start Command: npm start
- NODE_VERSION: 24.11.0
- NODE_ENV: production
- HOST: 0.0.0.0
- Health Check Path: /

O servidor usa PORT fornecido pelo Render. O build emite dist/standalone/server.js com os arquivos necessários. Nenhum banco ou disco persistente no Render é necessário: os dados permanecem no Supabase.

Após receber o endereço HTTPS, configure esse endereço como Site URL e Redirect URL permitido em Supabase → Authentication → URL Configuration. Preserve localhost nos redirecionamentos se ainda for desenvolver localmente. Valide confirmação de cadastro e recuperação de senha pelo endereço publicado. Não adicione chaves service_role ao cliente.

A publicação real no Render e o recebimento dos e-mails precisam ser verificados após a criação do serviço. O teste local do servidor de produção não substitui essa validação.

O comando npm run build original mantém o destino Sites fora do Render; npm run preview:sites substitui o antigo npm start para prévia Workers. npm run build:render seleciona explicitamente Node, sem alterar a prévia de desenvolvimento.
