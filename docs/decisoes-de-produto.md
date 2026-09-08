# Decisões de produto — Armador Brasil

Atualizado em 08/09/2026 após orientação do usuário: liberdade para definir os detalhes não encontrados na referência; funcionalidade de live fica para depois.

## Direção vigente

O Basketball Stats Assistant permanece a referência funcional, visual e de navegação. CourtIQ permanece fora do projeto. Não é necessário solicitar mais gravações para resolver as lacunas conhecidas: elas passam a ser decisões próprias do Armador Brasil, identificadas como tal, sem alegar que reproduzem comportamentos não observados do BSA.

Transmissão de estatísticas para espectadores e acompanhamento remoto de partidas são uma etapa futura. O registro durante a partida permanece no escopo atual: cronômetro, placar, ações por jogador/equipe, substituições e estatísticas são o núcleo do produto. O prefixo LIVE da matriz histórica se refere a essa operação em quadra; não significa que todos esses itens foram adiados.

## Comportamentos definidos para as lacunas

### Preparação da partida

Um fluxo reúne identificação e data do jogo, temporada/fase, equipes, regulamento configurável, convocação e titulares. O usuário pode revisar tudo antes de iniciar. Cada formato tem sua configuração explícita de quantidade de jogadores, períodos, duração, pontuação e prorrogação; não se presume que 3x3 seja apenas 5x5 com menos atletas. Impedir início com equipes iguais, jogadores duplicados ou escalação incompatível e explicar como corrigir.

### Correções de lances

O histórico permite corrigir atleta, período/tempo, tipo, resultado e posição de arremesso quando aplicável. Ao salvar, recalcular os totais relacionados. Uma cesta e sua assistência, ou uma perda e o roubo correspondente, devem compartilhar um vínculo. Antes de uma alteração que invalide a ação associada, mostrar quais registros serão afetados. Exclusão requer confirmação e oferece desfazer; preservar o histórico das revisões para auditoria. Não permitir placar visual e box score divergentes por manter acumuladores independentes.

### Cronômetro, encerramento e prorrogação

Separar pausar, salvar e encerrar. Salvar não encerra o jogo. Ao esgotar o período, pausar e apresentar a transição; ao final do tempo regulamentar, oferecer encerramento ou prorrogação conforme a configuração. Em empate, apresentar a opção de prorrogação e a duração antes de iniciá-la. Encerramento mostra o resultado e leva ao relatório. Retomar uma partida encerrada deve ser uma ação explícita; edição posterior recalcula estatísticas e resultado. Tempos de quadra derivam dos intervalos de participação e do relógio do jogo.

### Análises não acessíveis na referência

Criar telas funcionais de métricas avançadas, zonas, tipos de ação e quintetos seguindo a linguagem visual observada. Documentar as fórmulas, denominadores e limites antes de implementar os respectivos cálculos. Distinguir posse registrada de estimativa de posses. Exibir ausência de amostra de forma explícita, sem valores fabricados nem divisão por zero. A autorização para criar comportamentos não transforma conteúdo Premium não visto em evidência observada.

### Relatórios e exportação

PDF de partida: identificação, resultado, parciais, box score das equipes e atletas, aproveitamentos e mapas disponíveis. Relatório de temporada agrega partidas e explicita filtros, jogos e médias/totais. CSV usa cabeçalhos estáveis, UTF-8 e regras documentadas para números e campos textuais; produzir exportações de estatísticas e de eventos. Os arquivos devem refletir exatamente os dados e filtros da tela.

### Dados e continuidade

Persistir a partida após cada ação confirmada e permitir retomar após fechamento do aplicativo. Backup exportável e restauração devem validar o conteúdo e informar conflitos antes de substituir registros. Offline e integridade dos dados permanecem requisitos próprios, independentes da transmissão futura. Conta, nuvem e sincronização não são removidas do inventário por esta decisão; só a transmissão foi explicitamente adiada.

## Critérios de UX

Preservar verde no cabeçalho, laranja nas ações de destaque, cartões claros, identificação dos times por cor e a quadra como centro do registro. Manter navegação e agrupamentos reconhecíveis nos vídeos. Adicionar alternativa por clique/toque ao arrasto, foco visível, rótulos acessíveis e recuperação de erros. O acabamento visual faz parte da aceitação de cada fluxo, junto com seu funcionamento.

## Registro de escopo

- Atual: reprodução dos fluxos conhecidos e implementação própria das lacunas acima.
- Futuro, por pedido explícito: transmissão ao vivo e acompanhamento remoto para espectadores.
- Evidência: conservar as análises originais das gravações sem reescrevê-las como se os comportamentos criados tivessem sido observados.
- Implementação: este documento define comportamento; não certifica que as funcionalidades já foram construídas.
