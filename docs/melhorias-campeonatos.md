# Campeonatos por conta

Cadastro rápido em Novo jogo, com nome separado da temporada (2026 ou 2026/27) e tipo Liga/Copa/Torneio/Amistoso. O jogo guarda competitionId. Jogos antigos continuam sem vínculo. Os filtros em Jogos e Estatísticas incluem todos, sem campeonato e cada cadastro.

A tabela armador_competitions tem colunas próprias, RLS por proprietário e unicidade por nome normalizado (maiúsculas/espaços) e temporada. Grafias semanticamente diferentes não são fundidas automaticamente: o formulário orienta não incluir ano no nome e reutiliza uma correspondência já cadastrada. Não há catálogo compartilhado entre contas.

O salvamento existente inclui os campeonatos na mesma transação/revisão. Clientes anteriores que não enviam o campo não apagam o cadastro. Não há exclusão de campeonatos nesta primeira etapa; a restauração de backup adiciona/atualiza campeonatos sem remover os já existentes.

Validação: 13 testes do modelo; integração real com contas temporárias (persistência, duplicatas e RLS); navegador na versão compilada (criação rápida, filtro de jogos e filtro de estatísticas após recarga); compilação de produção. Contas temporárias removidas.

Advisors: nenhuma ocorrência de tabela sem RLS; aviso independente de proteção de senhas vazadas desativada no Supabase Auth. Referência: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
