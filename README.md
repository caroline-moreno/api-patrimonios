24/03/2024

Este é um projeto para o gerenciamento de patrimônios de uma empresa. Neste projeto é possível a visualização dos patrimônios, o cadastro destres, o escaneamento com a câmera, a atualização, a importação por um arquivo XLSX, a exportação para este mesmo tipo de arquivo e também a impressão dos códigos QR, atribuídos a cada patrimônio, além do gerenciamento dos registros dos usuários.

Projeto feito com Node JS, Express e EJS. Usando um banco de dados MySQL. O projeto armazena informações sobre patrimônios com a finalidade de possuir uma maior organização sobre os mesmos.

Neste projeto podemos escanear, importar, imprimir, cadastrar, atualizar e deletar os patrimônios do banco de dados.

O escaneamento dos patrimônios acontece através de um código QR que é referente a cada patrimônio cadastrado no banco de dados. Para o escaneamento de um patrimônio é necessário que o dispositivo utilizado possua uma camêra. Após isso é necessário apontar a câmera para o código QR.

Para importação de patrimônios é necessário um arquivo XLSX, tipo este usado pelo excel. Os arquivos que serão importados não podem passar do tamanho limite que é 30 KB. Estes arquivos precisam ser do padrão da empresa SENAI. Neste padrão o cabeçalho possuí: "Nº invent.", "Dt.incorp.", "Denominação do imobilizado", "Localiz.", "Ambiente" e "Código". O número de inventário é o principal identificador. Na data da incorporação cada linha possuí um texto padrão, por exemplo "24.03.2024", que segue o padrão "dia.mês.ano". A denominação é o nome do patrimônio. A localização é normalmente um código. O ambiente é o nome do ambiente. E o código é o código do patrimônio.

Na parte de impressão de patrimônios é gerada uma lista. Para o geramento desta lista é necessário que o usuário coloque suas especificações na lista e aperte o botão de impressão. Após isso é gerado um arquivo PDF com todos os códigos QR especificados anteriormante.

Autor: Mateus dos Santos Pereira.
GITHUB: https://github.com/mateussantospereira