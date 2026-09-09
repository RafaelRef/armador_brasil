# Logos privados

PNG/JPG/WebP até 2 MB, enviados ao salvar a equipe. O banco guarda somente o caminho; a exibição obtém links assinados por uma hora e renova antes do vencimento. Sem logo ou em falha de acesso, a camisa com a cor do time permanece visível.

O bucket team-logos é privado. Políticas permitem leitura, envio e remoção somente na pasta do usuário autenticado. O MVP continua com várias equipes por conta; não implementa ainda o modelo futuro de uma conta por time.

Arquivos têm nomes únicos e não são sobrescritos. Logos antigos são preservados para partidas já salvas que guardam a referência histórica. Remover o logo no cadastro retira sua referência da equipe, sem apagar arquivos usados por jogos anteriores. Backup JSON contém referências, não os bytes das imagens.

Validação: tipagem e compilação de produção; upload e link assinado pela conta dona; leitura e envio em pasta alheia negados; arquivo de teste removido ao fim.
