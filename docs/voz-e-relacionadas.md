# Relacionadas e voz — MVP

Novo jogo agora tem seleção de relacionadas antes das titulares. Somente relacionadas são copiadas para a partida; o cadastro do time permanece completo. Jogos anteriores não são recortados automaticamente. O banco tem altura limitada com rolagem, inclusive nos jogos antigos com 30 atletas.

Voz usa SpeechRecognition do navegador em pt-BR, sob ação explícita. O reconhecimento pode usar serviço remoto do navegador. A transcrição só é aceita se corresponder integralmente a time A/B/local/visitante + camisa numérica + uma ação da lista. Frases extras, camisa ausente ou no banco são rejeitadas. O app não grava estatística na captura; abre o editor existente para revisão/correção e confirmação explícita. Sem timeout de confirmação. Em navegador sem suporte, registro manual continua disponível.

Limites: sem garantia offline; números falados por extenso podem ser rejeitados, exceto dois/três; arremessos de campo por voz no MVP são para 5×5; nenhum áudio é armazenado pelo app. Captura real com ruído de ginásio ainda precisa de validação. Links e vínculos opcionais de lances continuam no editor manual.

Validação: 15 testes, tipagem e compilação; navegador com elenco de 30 atletas, substituição, mapa, recarga e largura móvel. Teste de reconhecimento acústico real não realizado.
