# Comparação com vídeo de referência — celular

Vídeo ScreenRecording_09-09-2026 21-34-44_1.MP4, duração 91 segundos. A partida é usada em orientação horizontal. Quadros analisados a cada 5 segundos e detalhes ampliados em 10, 25, 35, 50, 55 e 65 segundos.

Observado: escolha rápida de rebote com os dois elencos em quadra e opções de equipe; seleção de quem recebeu falta; configurações de telas de continuação e pausa; mapa/estatísticas de arremessos por quarto. O vídeo não revela todos os fluxos do aplicativo.

Nesta etapa: CSS específico para celular horizontal, gestos de ações por Pointer Events e continuação opcional após erro de arremesso de campo. A escolha de time define rebote ofensivo/defensivo. Dispensar a tela mantém somente o arremesso. O cronômetro não é pausado por essa tela. Lances livres não disparam essa continuação, pois nem todo erro permite disputa de rebote.

Validação: compilação e tipagem; navegador 844×390 e 390×844, 30 atletas, sem sobreposição de placar/ações; gesto touch emulado via protocolo do navegador abre o lance para Kevin e depois a seleção de rebote. Não equivale a teste em iPhone físico/Safari.

Limites: em viewport horizontal muito baixa o banco e ferramentas continuam abaixo da dobra; não foi implementado fullscreen/PWA. Não há paridade integral de gestos, telas de continuação e análises do vídeo. Paleta aprovada preservada.
