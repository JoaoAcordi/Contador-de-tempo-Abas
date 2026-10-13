# Política de Privacidade - Contador Tempo Apontamento

A extensão **Contador Tempo Apontamento** foi desenvolvida com foco total na privacidade do usuário. Esta política descreve como as informações são tratadas.

## 1. Coleta de Dados
A extensão monitora apenas o tempo ativo gasto em grupos de abas (*tab groups*) específicos do navegador e os nomes atribuídos a esses grupos pelo próprio usuário.

## 2. Armazenamento Local
Todos os dados coletados (nomes dos grupos e histórico de tempo) são armazenados **exclusivamente de forma local** no seu próprio dispositivo, utilizando a API nativa `chrome.storage.local`. Nenhum dado é transmitido, sincronizado ou armazenado em servidores externos, bancos de dados em nuvem ou serviços de terceiros.

## 3. Compartilhamento de Dados
Nós não vendemos, alugamos, compartilhamos ou transmitimos qualquer informação do usuário para terceiros. O fluxo de informações ocorre estritamente de forma manual: os dados só saem da extensão quando você clica em "Copiar" para colar na ferramenta de sua escolha (como o Jira).

## 4. Uso das Permissões
Para funcionar corretamente, a extensão solicita as seguintes permissões do navegador, utilizadas estritamente para os fins descritos abaixo:

* **`storage`**: Utilizado unicamente para salvar o seu histórico de apontamentos e o estado do relógio de forma local no seu computador.
* **`tabs` e `tabGroups`**: Utilizados para identificar em qual grupo de abas o usuário está navegando no momento, permitindo calcular o tempo da sessão de trabalho.
* **`scripting` e permissão de host (`<all_urls>`)**: Utilizados estritamente para exibir um cronômetro em tempo real no título (`<title>`) da aba ativa. A extensão **não** lê, extrai, altera ou rastreia o conteúdo interno das páginas visitadas.
* **`idle`**: Utilizado para detectar inatividade do computador (ex: usuário longe do teclado) e pausar o cronômetro automaticamente, garantindo a precisão do tempo apontado.

## 5. Alterações nesta Política
Caso haja mudanças na forma como a extensão lida com dados no futuro (como a adição de novas funcionalidades), esta política será devidamente atualizada e transparente.

## 6. Contato
Em caso de dúvidas ou sugestões sobre esta política de privacidade, sinta-se à vontade para entrar em contato através da página de suporte da extensão na Chrome Web Store.
