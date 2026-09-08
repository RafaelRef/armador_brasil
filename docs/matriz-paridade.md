# Matriz de paridade

Todos os itens abaixo estão **não implementados / não testados** no Armador Brasil nesta etapa de descoberta. O estado de evidência indica somente o conhecimento da referência.

- **Observado:** tela ou sequência visível; não implica que todos os casos e variantes estejam especificados.
- **Parcial:** entrada, parte da tela ou fluxo incompleto.
- **Bloqueado:** conteúdo protegido por login/Premium.
- **Documentado:** divulgado pelo fornecedor, sem demonstração nesta gravação.

| ID | Funcionalidade | Evidência atual | Próxima verificação |
|---|---|---|---|
| NAV-01 | Navegação principal, abas adicionais e retorno | Observado, 00:04; 03:32 | Todas as abas e retorno com estado preservado |
| DASH-01 | Seleção de equipe, líderes, resultados, MVPs | Observado, 00:04–00:17 | Critério de líderes, empates, filtros e estado vazio |
| TEAM-01 | Equipes por temporada, cores e elenco | Observado, 03:08–03:25 | Criar/salvar, editar camisas/fotos e validações |
| TEAM-02 | Nome do treinador e identidade do time | Parcial, editor | Destino de escudo e segunda cor |
| TEAM-03 | Exclusão e outros comandos das equipes | Parcial, ícones/menus | Confirmações, dependências e recuperação |
| TEAM-04 | Sistemas ofensivos e defensivos editáveis | Parcial, botões do editor | Abrir editores e usar durante o jogo |
| GAME-01 | Lista, metadados, editar, retomar, excluir | Observado/parcial, 01:10–01:36 | Campos completos e confirmação de exclusão |
| GAME-02 | Preparação de jogo e identificação da própria equipe | Observado, 01:15–01:22 | Seleção das equipes, árbitros, mando e validações |
| GAME-03 | Temporada e fase | Parcial, seletores | Criar/editar/selecionar valores |
| GAME-04 | Configuração de períodos, duração e formato | Parcial, resumo visível | Abrir configuração; defaults e limites |
| GAME-05 | Convocação e titulares dos dois times | Parcial, 01:23–01:25 | Equipes preenchidas e início completo |
| LIVE-01 | Quadra, placar, titulares, banco e ferramentas | Observado, 01:36 em diante | Comparação por dimensão/orientação |
| LIVE-02 | Arrastar ação para jogador | Observado na sequência | Soltura inválida, arrasto cancelado e alternativas |
| LIVE-03 | Lance livre certo/errado e contra-ataque | Parcial, 01:39–01:44 | Encadeamento por acerto/erro e expiração do diálogo |
| LIVE-04 | Cesta de dois/três, posição e tipo | Observado/parcial, 01:45–01:53 | Variantes, cancelar e tentativas de três |
| LIVE-05 | Assistência associada à cesta | Observado, 01:51–01:56 | Sem assistência e reversão vinculada |
| LIVE-06 | Erro de arremesso e mapa | Observado/parcial, 01:59–02:04 | Encadeamento de rebote/bloqueio e cancelamento |
| LIVE-07 | Rebotes ofensivos/defensivos | Parcial, ações visíveis | Atribuição, rebote de equipe e efeitos na posse |
| LIVE-08 | Roubos e turnovers relacionados | Parcial, ações visíveis | Tipos e vínculos entre os dois lados |
| LIVE-09 | Bloqueios cometidos e recebidos | Parcial, screenshot 13 | Registro completo e efeito em tentativas |
| LIVE-10 | Tipos de falta e faltas recebidas | Observado, 02:29–02:33 | Técnicas, banco, exclusão e eventos derivados |
| LIVE-11 | Substituições e minutos | Observado, 02:08–02:17; V2 01:10–01:16, troca por seleção no modal | Substituição múltipla, relógio parado e correção |
| LIVE-12 | Cronômetro, início/pausa | Observado, 02:18–02:21 | Ajuste manual, persistência e fim do relógio |
| LIVE-13 | Tempos curtos/completos | Parcial, 02:22–02:24 | Duração, cotas e contabilização |
| LIVE-14 | Períodos e salvamento automático | Observado/parcial, 02:37–02:40 | Fim de jogo e prorrogações |
| LIVE-15 | Posse/direção de ataque | Parcial, indicador TA → TB | Comando e vínculo com estatísticas de posses |
| LIVE-16 | Desfazer e editar eventos | Parcial, V2 00:56: comandos de edição/exclusão visíveis | Executar edição e exclusão; campos, ordem e reversão de eventos ligados |
| LIVE-17 | Preferências e ferramentas laterais | Observado, V2 00:16–00:30 e 01:02–01:06 | Testar efeitos das preferências e editores de equipes |
| LIVE-18 | Registro de ações da equipe sem atleta | Parcial, V2 01:16–01:30, instrução da área de soltura | Registrar ação e verificar totais e posse |
| LIVE-19 | Consultas de minutos e faltas, técnicas de banco/treinador | Observado, V2 01:48–01:52 | Registro das técnicas e efeitos nas regras |
| STAT-01 | Perfil individual, médias e temporada | Observado, 00:18–00:33 e prints | DNP, totais/médias, filtros e temporadas vazias |
| STAT-02 | Box score e filtros por período | Observado, 00:36–00:49 | Todas as colunas, totais, prorrogação e exportação |
| STAT-03 | Pontos e posses por período | Observado, 00:48 | Definição exata de posse |
| STAT-04 | Evolução de pontos | Observado, 00:50 | Eixo de tempo, eventos simultâneos e filtros |
| STAT-05 | Líderes em gráficos por equipe | Observado, 00:51–00:53 | Categorias completas e empates |
| STAT-06 | Comparação das equipes | Observado, 00:54–00:55 | Todas as categorias e fórmulas |
| STAT-07 | Four Factors e métricas avançadas | Bloqueado/parcial, 00:56–00:57 | Tela inteira desbloqueada, ajuda e fórmulas |
| STAT-08 | Sistemas ofensivos/defensivos e eficiência | Parcial/Premium, 00:58–00:59 | Coleta, edição e tabelas com dados |
| STAT-09 | Diferencial do placar | Observado, 01:00 | Eixos, convenção e interação |
| STAT-10 | Histórico lance a lance | Observado, 01:01–01:02 | Edição, filtros e ordenação |
| STAT-11 | Shot chart e seleção múltipla | Observado, 01:03–01:04 e prints | Combinação de filtros e mapas individuais |
| STAT-12 | Zonas de arremesso | Bloqueado/parcial, screenshot 7 | Limites das zonas, escala de cores e valores |
| STAT-13 | Tipos de arremesso, turnovers e faltas | Parcial, botões/seletores | Relatórios completos e classificações |
| STAT-14 | Quintetos, on/off e mais/menos | Documentado/parcial | Telas completas, minutos e fórmulas |
| STAT-15 | Comparação rápida e arremessos por quarto | Observado/parcial, V2 00:54 e 01:54 | Filtros, fórmulas e zonas desbloqueadas |
| STAT-16 | Resultados parciais dos últimos 1/3/5/10 minutos | Observado, V2 01:56 | Limites temporais e interação com períodos |
| OUT-01 | PDF por jogo/temporada/atleta | Parcial, botões visíveis | Gerar e analisar arquivos reais |
| OUT-02 | CSV e exportação de dados | Documentado/parcial | Formato, colunas, delimitador e opções |
| OUT-03 | Notas e vídeo associado à partida | Parcial, 00:48 | Editores e associação com lances |
| OUT-04 | Compartilhar resultado | Parcial, 00:48 | Destino, formato e permissões |
| CLOUD-01 | Conta e tipos de usuário | Parcial/login necessário, 03:00–03:04 | Cadastro/login e papéis |
| CLOUD-02 | Backup, restauração e múltiplos dispositivos | Parcial/Premium, perfil | Envio, recuperação, conflitos e isolamento |
| CLOUD-03 | Registro offline e sincronização | Documentado no site | Teste real sem rede e retomada |
| CLOUD-04 | Seguidores e transmissão ao vivo | Parcial/login necessário | Publicação e visualização em outro dispositivo |
| BILL-01 | Premium, assinatura e restauração de compras | Parcial, perfil e aba Premium | Planos, estados, plataformas e falhas |
| BILL-02 | Código promocional e código desktop | Parcial, perfil | Entradas, validação e vínculo com conta |
| HELP-01 | Tutoriais, ajuda e contato | Parcial, perfil/ícones | Conteúdo e comportamento de cada entrada |
| PLATFORM-01 | 3x3 além de 5x5 | Documentado; 5x5 visto | Regras, quadra e fluxo 3x3 |
| PLATFORM-02 | iOS, Android, Windows, macOS e idiomas | Documentado; macOS visto | Paridade e diferenças por plataforma |
| SUITE-01 | Hierarquia de clube e múltiplos membros | Documentado no site | Acesso e fluxos de administração |
| SUITE-02 | BSA Insights / BSA Compete | Documentado no site | Delimitar produtos abrangidos e observar operação |

Tempos sem indicação de vídeo referem-se à primeira gravação. **V2** refere-se à gravação das 15:18:21, analisada em [documento separado](analise-gravacao-2-2026-09-08.md).

## Fontes públicas já consultadas

- [Site e planos](https://basketballstatsassistant.com/pt/)
- [Tracking](https://basketballstatsassistant.com/pt/tracking/)
- [Suporte](https://basketballstatsassistant.com/pt/support/)
- [Integrate / Insights](https://basketballstatsassistant.com/pt/integrate/)
- [Digitalize / Compete](https://basketballstatsassistant.com/pt/digitalize/)

A documentação pública amplia o inventário, mas não substitui observar os fluxos autenticados. A exigência de todas as funcionalidades permanece: esta matriz é o início rastreável da descoberta, não um certificado de completude.
