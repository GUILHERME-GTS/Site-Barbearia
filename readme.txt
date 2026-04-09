task desenvolvedor


add transaparencia 100% na logo


















































A regra é: Sempre PUXE o código da nuvem antes de começar a trabalhar, e sempre EMPURRE para a nuvem quando terminar.

Aqui está a sua rotina oficial de trabalho a partir de hoje, não importa em qual dos dois PCs você esteja sentando para programar:

🟢 Passo 1: Quando você sentar no computador (Sincronizar)
Antes de editar ou digitar qualquer linha de código no VS Code, abra o terminal e digite:

Bash

- git pull


(Isso garante que o PC atual baixe todas as atualizações que você possa ter feito no outro computador. Se você não fizer isso, pode acabar programando em cima de um código velho).

🟡 Passo 2: A hora do trabalho
Edite seu código à vontade! Mude o CSS, adicione novas travas de segurança no JavaScript, coloque fotos reais, etc. Vá testando no navegador como você sempre faz.

🔴 Passo 3: Quando for parar ou trocar de PC (Salvar e Enviar)
Terminou o que estava fazendo ou precisa ir embora? Faça o ciclo de envio para deixar a nuvem 100% atualizada para quando você for usar o outro computador:

Bash

-git add .
Bash

-git commit -m "Descreva o que voce alterou hoje"
Bash

-git push


Resumo mental (o mantra do desenvolvedor):

Chegou no PC? PULL.

Trabalhou? ADD e COMMIT.

Terminou? PUSH.