# Análise da gravação — Basketball Stats Assistant

Data: 08/09/2026. Destino: RafaelRef/armador_brasil.

## Evidência e método

Gravação de 218,72 segundos, sem faixa de áudio. Foram extraídos 219 quadros, um por segundo; a sequência geral foi examinada em intervalos de quatro segundos e os trechos de configuração, ações encadeadas, faltas e estatísticas foram aprofundados segundo a segundo. Quadros pontuais foram examinados em tamanho maior, em conjunto com os 13 screenshots enviados anteriormente.

Este método identifica telas e transições, mas não mede com precisão subsegundo a duração dos gestos. Comportamentos não demonstrados não são considerados comprovados. A versão 1.46 aparece no perfil por volta de 03:04. Não houve login, teste de rede, compra, exportação de arquivo ou acesso a valores Premium nesta gravação.

## Sequência observada

| Tempo aproximado | Tela / ação | O que a evidência confirma |
|---|---|---|
| 00:04–00:17 | Dashboard e seletor de equipe | Líderes de pontos, assistências e rebotes, jogos, resultados e MVPs. Seleção abre modal de equipes. |
| 00:18–00:33 | Perfil de Stephen | Equipe, camisa, temporada, estatísticas, arremessos e box score individual. |
| 00:36–00:49 | Estatísticas de partida | Tela horizontal; pontos e posses por período, tabela de atletas e ações adicionais. |
| 00:50 | Pontos | Duas linhas de evolução da pontuação. |
| 00:51–00:53 | Líderes | Gráficos de rosca por jogador para pontos, assistências, rebotes e eficiência; local/visitante. |
| 00:54–00:55 | Equipes | Barras comparativas dos dois lados e categorias de pontuação/aproveitamento. |
| 00:56–00:57 | Avançadas | Quatro fatores, eficiências, pontuação e arremessos; valores protegidos/desfocados. |
| 00:58–00:59 | Sistemas | Tabelas ofensiva e defensiva, com aviso Premium. |
| 01:00 | Diferenciais | Gráfico da diferença no placar ao longo do jogo. |
| 01:01–01:02 | Jogadas | Linha do tempo com período, relógio, placar, atleta e descrição; filtros por quarto. |
| 01:03–01:04 | Gráfico de lançamentos | Seleção múltipla de jogadores e troca local/visitante sobre mapa. |
| 01:10–01:14 | Jogos guardados e menu | Box score, retomar, relatório PDF; menu com editar, metadados e eliminar. |
| 01:15–01:22 | Novo jogo | Quadra ao fundo; mandante/visitante, data, árbitros, minha equipe, temporada/fase, compartilhamento e regras resumidas. Configuração não é aberta. |
| 01:23–01:25 | Convocação | Duas colunas para equipes; estado sem equipe selecionada e ação Iniciar jogo. Seleção completa não é demonstrada. |
| 01:28–01:36 | Retomar partida | Retomada de jogo guardado com placar 89–88 e estatísticas já preenchidas. |
| 01:39–01:44 | Lance livre | Ponto atualizado; pergunta organizado/contra-ataque com contagem visual. |
| 01:45–01:53 | Cesta de dois e complementos | Localização → tipo de arremesso → autor da assistência ou nenhuma; contexto organizado/contra-ataque. |
| 01:54–01:56 | Assistência | Estatística e mensagem breve de confirmação visíveis. |
| 01:59–02:04 | Arremesso errado | Escolha dois/três e gráfico para posição. |
| 02:08–02:17 | Substituições | Jogadores mudam entre os cartões da quadra e camisetas do banco. |
| 02:18–02:21 | Relógio | Início, contagem regressiva e pausa. |
| 02:22–02:24 | Tempos parados | Modal com tempo curto e completo. Durações não abertas. |
| 02:29–02:33 | Falta | Escolha de tipo → escolha de quem recebeu ou Não anotar; contadores atualizados. |
| 02:37–02:40 | Gravação / período | Indicador de salvamento automático, segundo período, relógio em 10:00 e faltas coletivas zeradas. |
| 02:56–03:04 | Dashboard / conta | Resultado atualizado; solicitação de login e perfil com backup/restauração e opções de assinatura. |
| 03:08–03:25 | Equipes e editor | Nome, treinador, cores, elenco, camisas, exclusão, temporada e entradas para jogadas ofensivas/defensivas. Modal para quantidade de jogadores, temporada e cor. |
| 03:32–03:35 | Navegação adicional | A aba Premium aparece após deslocamento da navegação. |

## Modelo de interação a reproduzir

### Registro ao vivo

A quadra é o espaço principal de operação. Cinco jogadores de cada equipe ficam distribuídos em cartões nas laterais; o banco fica abaixo. Camisa, número, nome curto, pontos, rebotes, assistências e faltas permanecem visíveis. O placar central superior exibe relógio, período, pontos e faltas das equipes. Há um controle grande de reprodução/pausa central e ferramentas nas laterais.

A gravação mostra ícones deslocados em direção aos atletas antes da atualização das estatísticas, consistente com o registro por arrastar e soltar. Os testes do clone devem conferir início do arrasto, alvo válido, soltura, cancelamento e atualização. Não substituir esse fluxo por uma interface apenas de formulários e considerar o UX equivalente. Entrada por toque/teclado pode complementar o arrasto, mas não eliminar o comportamento de referência.

### Cesta e assistência

A sequência demonstrada começa com ação/atleta e segue para quadra de localização, tipo de arremesso e assistência. No modal de assistência aparecem os outros quatro atletas em quadra, com alternativa sem assistência. O contexto organizado/contra-ataque permanece selecionável. O placar pode já estar atualizado enquanto os detalhes são preenchidos: ainda falta verificar se fechar cada modal cancela o detalhe ou também reverte o lance principal.

Tipos visíveis no seletor: Layup, Driving layup, Dunk, Putback / Tip in, Alley oop, Shot, Hook shot, Floating jump shot, Fadeaway jump shot, Turnaround jump shot, Step back jump shot, Pull up jump shot e Catch and shoot. Esses nomes descrevem opções observadas; não são uma definição completa de suas regras estatísticas.

O lance livre abre uma pergunta compacta sobre contra-ataque com contagem visível. A gravação não determina com segurança a preferência aplicada ao esgotar o tempo, nem se a contagem pode ser configurada.

### Faltas e eventos relacionados

O seletor observado contém falta defensiva, ofensiva, técnica, antidesportiva e desqualificante. Em seguida, a interface oferece os adversários em quadra e a opção de não anotar quem recebeu. O screenshot anterior também mostra um modal de quem recebeu um bloqueio. Esses eventos precisam preservar a relação entre autor e receptor para estatísticas como faltas recebidas, bloqueios recebidos e PIR.

Não presumir que desfazer somente a falta preserve corretamente todos os eventos derivados; a regra de reversão precisa ser verificada.

### Substituição, relógio e período

Banco e quadra mudam de composição diretamente. Minutos, quintetos e mais/menos dependem dos instantes das substituições e da pontuação. O relógio inicia e pausa visualmente. A passagem de período aparece junto de salvamento e reinício dos contadores coletivos; nenhuma prorrogação é demonstrada.

### Estatísticas e contexto

Existem níveis distintos: dashboard, atleta, equipe e partida. Não condensar todos em uma única tabela. Preservar seletores de equipe, temporada, local/visitante, período e múltiplos atletas conforme o contexto.

A página avançada mostra eFG%, ORB%, TOV%, FTr, eficiência líquida, eficiência ofensiva (OER), defensiva (DER), pontos por lançamento, por posse, por 100 posses, ritmo, PPFT, PP2PS e PP3PS. Parte inferior e valores estão incompletos/desfocados. Fórmulas, denominadores e convenções do BSA não podem ser deduzidos do nome da métrica.

Em Sistemas aparecem categorias ofensivas contra-ataque, organizado e transição; defensivas individual, press e zona. Colunas incluem vezes, sucessos, falhas, EFF%, pontos e indicadores associados. O editor de sistemas e sua ligação com eventos não são demonstrados.

## Linguagem visual e critérios de fidelidade

- Estrutura geral: cabeçalho verde escuro, título branco, ações amarelo/laranja; fundo cinza claro; cartões brancos arredondados e sombra discreta.
- Navegação principal: seletor cinza em forma de cápsula; aba ativa branca com texto verde. Abas estatísticas: fundo branco, texto ativo laranja e sublinhado.
- Estatísticas: faixas verde muito claro, números pretos de maior destaque e rótulos cinza; roscas verdes/laranja; cores das equipes mantidas em tabelas e gráficos.
- Quadra: fundo externo azul-petróleo, piso amarelo, garrafões vermelhos, linhas brancas; placar azul-marinho e mostradores pretos com números amarelos.
- Modais: fundo escurecido, painel claro arredondado, título em faixa laranja e fechamento circular branco. Não confundir com o modal verde de edição de equipe.
- Ações principais: botões pretos largos em telas de gestão; configuração em laranja na preparação da partida.
- A gravação alterna janela vertical de gestão e horizontal de operação/análise. Verificar orientação e dimensões por plataforma antes de adotar isso como comportamento universal.

As cores acima são observações visuais, não amostras exatas medidas. Os prints originais oferecem melhor resolução para medir espaçamentos, tipografia, ícones e proporções. A interface deve ser comparada nos mesmos tamanhos e estados, incluindo modal aberto e conteúdo rolado.

## O que a gravação ainda não resolve

1. Configuração de partida e engrenagem ao vivo: campos, valores, defaults, validações e preferências dos diálogos.
2. Correção, desfazer, cancelamento de fluxos, encerramento e prorrogação completos.
3. Valores e fórmulas Premium; quintetos; tipos de arremesso/falta/turnover completos e filtros avançados.
4. PDF/CSV real, notas, vídeo associado ao jogo e ações de compartilhamento.
5. Login, seguidores, transmissão em outro aparelho, backup, restauração e sincronização com perda de rede.
6. Criação completa de equipe/jogadores e convocação até iniciar uma partida nova.
7. Operação do editor de sistemas e eventuais recursos de clube, Insights/Compete e outras plataformas.

Esses itens continuam no inventário. Obter mais evidência não significa renegociar para um produto reduzido. A gravação já permite especificar o núcleo visual e diversos fluxos; ainda não permite afirmar cobertura integral do fornecedor.

## Verificação futura

Para cada fluxo: estado inicial → gesto → alvo → diálogo → cancelamento/confirmação → estatísticas resultantes → persistência após fechar/reabrir. Comparar valores com uma partida de teste idêntica no BSA e no Armador Brasil. Para offline, simular falha antes, durante e depois da sincronização; para exportação, comparar arquivos gerados; para UX, comparar capturas e número/ordem dos passos.

Uma funcionalidade só receberá estado Testada depois de possuir resultado verificável. Presença de ícone, nome da aba ou botão não comprova implementação funcional.
