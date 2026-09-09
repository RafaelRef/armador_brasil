# Armador Brasil

Implementação independente orientada à paridade funcional e visual com o Basketball Stats Assistant.

## Objetivo

Reproduzir as funcionalidades e os fluxos conhecidos da referência, com liberdade autorizada para definir os detalhes que não puderam ser observados. Transmissão ao vivo e acompanhamento remoto ficam para uma etapa futura; o registro de estatísticas durante a partida permanece no escopo atual. UX e fidelidade visual são critérios de aceite. CourtIQ não faz parte desta base.

## Estado atual

**Primeira versão funcional em validação. A paridade completa com o BSA ainda não foi concluída.**

A aplicação está em `app/`. Login, cadastro e recuperação de senha usam Supabase Auth. Equipes e partidas são vinculadas à conta por `owner_id`, com isolamento no banco. O protótipo D1 foi substituído pelo Supabase, conforme solicitado.

Implementados nesta etapa: equipes/elencos, preparação de jogo, registro e correção de lances, substituições, cronômetro, encerramento/prorrogação configuráveis, estatísticas, CSV e impressão para PDF. Veja [estado da implementação](docs/implementacao-v0.1.md) para as limitações.

- [Decisões de produto e escopo atualizado](docs/decisoes-de-produto.md)
- [Análise da gravação e especificação de UX](docs/analise-gravacao-2026-09-08.md)
- [Segunda gravação: configurações e ferramentas do jogo](docs/analise-gravacao-2-2026-09-08.md)
- [Matriz de paridade e pendências](docs/matriz-paridade.md)

Referência observada: aplicativo para macOS exibindo versão 1.46, duas gravações do usuário de 08/09/2026 (3min39s e 2min14s, ambas sem áudio), 13 screenshots e site público do fornecedor. Isso fixa uma referência observada; não comprova a versão mais recente de todas as plataformas.

Código, imagens originais do usuário e credenciais do CourtIQ não foram incorporados. Gravação e capturas brutas permanecem fora do Git; a documentação usa marcações de tempo para rastreabilidade.

## Critério de conclusão

Uma interface parecida, botões sem comportamento ou métricas simuladas não constituem paridade. Cada item deve ter referência, comportamento especificado, implementação e teste. Itens pagos, integrações e plataformas ainda não verificados mantêm sua rastreabilidade. Lacunas podem receber comportamento próprio conforme as decisões de produto. A transmissão ao vivo foi adiada por solicitação expressa do usuário.
