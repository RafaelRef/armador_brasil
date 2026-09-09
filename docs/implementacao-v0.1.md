# Primeira versão funcional — Armador Brasil

## Contas e dados

- Tela inicial de login, cadastro com confirmação de e-mail e recuperação de senha.
- Supabase Auth e PostgreSQL no projeto dedicado Armador Brasil, região São Paulo.
- Equipes e jogos separados por owner_id associado a auth.users; políticas RLS não permitem leitura, escrita ou transferência de propriedade entre contas.
- Uma conta pode cadastrar várias equipes. Adversários também são cadastros privados da conta; não existe diretório público de times nem compartilhamento entre contas nesta versão.
- Salvamento transacional com revisão otimista: uma janela não substitui silenciosamente dados mais recentes de outra. A identidade esperada acompanha cada salvamento para impedir envio de dados de uma sessão anterior após troca de conta.
- Rascunho local por conta durante falhas de conexão; backup/restauração JSON. O banco é a fonte persistente. Não há garantia de abrir/recarregar o aplicativo sem rede; isso ainda exige cache da aplicação e testes offline completos.

## Operação disponível

- Cadastro/edição/exclusão de equipes, cor, temporada, treinador, nomes e números únicos dos atletas.
- Preparação de partida, convocação de titulares, 5×5 e formato 3×3 personalizado com cestas de 1/2 pontos.
- Cronômetro, início/pausa/ajuste; períodos e prorrogação com duração configurável; finalizar e retomar para corrigir.
- Arremessos convertidos/errados, livres, coordenadas, tipo e contra-ataque; associação de assistência à cesta.
- Rebotes, assistências, roubos/perdas vinculados, bloqueios recebidos/cometidos, faltas e tempos técnicos.
- Seleção por clique/toque ou arrasto da ação; registro atribuído à equipe; substituições, minutos e mais/menos.
- Histórico com edição/exclusão de lances e desfazer da última mudança no histórico durante a sessão.
- Dashboard de líderes e resultados; totais por temporada; box score por período; mapas; evolução de pontos e formações por intervalos.
- Métricas de aproveitamento, eFG/TS em 5×5, estimativa de posses, eficiência e PIR. Fórmulas visíveis na interface. Referência consultada: https://www.nba.com/stats/help/glossary .
- Exportações CSV de box score, lances e totais de temporada; relatório de jogo por impressão/salvar PDF do navegador.
- Dados fictícios opcionais marcados como demonstração, adicionados somente por ação do usuário.

## Limites conhecidos e próximos incrementos

Esta entrega não é um certificado de paridade integral. Permanecem pendentes: cobertura de todas as ferramentas do BSA, zonas detalhadas (atualmente três faixas simplificadas), sistemas táticos configuráveis, vídeos associados, refinamento dos relatórios por atleta/temporada, regras oficiais completas de 3×3, bônus/cotas de tempos/exclusões automáticas, reedição de substituições, auditoria completa de todas as operações, filtros avançados, sincronização offline integral e aplicações nativas. Tipos de faltas são registrados, sem um motor completo de sanções automáticas.

A transmissão ao vivo e o acompanhamento por espectadores permanecem adiados por solicitação explícita. Cobrança e hierarquia de clubes não foram implementadas. Recursos analíticos disponíveis não têm bloqueio Premium artificial.

A aplicação é executada localmente. O projeto de hospedagem privada foi reservado no Sites, mas a publicação ainda está pendente.

## Verificação

- Testes do motor: placar fictício 89–88, correção/exclusão e vínculos, livres versus tentativas de campo, estatísticas de equipe, minutos/mais-menos/substituições, validações e amostra zero.
- Verificações SQL de isolamento e conflitos, com contas temporárias em transação revertida.
- Testes de integração do Supabase: credenciais inválidas, acesso anônimo bloqueado; teste adicional de autenticação e persistência com contas temporárias, removidas ao fim.
- Tipagem e compilação de produção verificadas antes da publicação.
- Envio/recebimento real dos e-mails de cadastro e recuperação ainda depende da validação do usuário e das condições do provedor. Nenhum e-mail é enviado pelos testes automáticos.
- Teste de navegador com login real temporário, desktop 1366×768 sem zoom, substituição por arrasto, precisão da marcação de arremesso, persistência após recarga e layout de 390×844. A interação por arrasto em aparelho físico com toque ainda precisa de validação. A revisão integral de todos os fluxos e o contrato WebMCP ainda não foram concluídos. A API opcional WebMCP possui leitura de resumo e abertura do formulário de equipe, com validação de argumentos.

## Desenvolvimento

Na pasta app: npm install, npm run dev, npm test, npm run typecheck e npm run build. As migrações Supabase ficam em app/supabase/migrations. A chave publishable em lib/supabase.ts é pública por definição; nenhuma chave de serviço é incluída no cliente ou no repositório.
