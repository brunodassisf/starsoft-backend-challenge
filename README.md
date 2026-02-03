# Teste para Desenvolvedor(a) Back-End Node.js/NestJS - Sistemas Distribuídos

## Visão Geral

O Cine-Starsoft é uma plataforma robusta de back-end desenvolvida para orquestrar o ciclo de vida completo de ingressos de cinema. O sistema foi projetado para ser uma solução de alta performance, capaz de gerenciar desde o catálogo de filmes e salas até o fluxo crítico de vendas e reserva de assentos em tempo real.

O foco central da arquitetura é a resiliência e a escalabilidade, garantindo que a experiência do usuário seja fluida mesmo durante picos de demanda, como grandes lançamentos de blockbusters.

## Tecnologias

- Banco de Dados: PostgreSQL
- Mensageria: RabbitMQ
- Cache: Redis

Enquanto o PostgreSQL é a nossa 'fonte da verdade' para dados persistentes, o RabbitMQ orquestra o fluxo de trabalho entre componentes de forma resiliente, e o Redis garante que as informações mais críticas cheguem ao usuário com velocidade sub-milissegundo.

## Execução

Após fazer o clone do projeto crie um arquivo **.env** com as seguintes informações: <br>
```
DB_HOST=db
DB_PORT=5432
DB_USERNAME=cine_user
DB_PASSWORD=cine_09
DB_NAME=cine_challenge_db

REDIS_HOST=redis
REDIS_PORT=6379

PORT=3000
NODE_ENV=development
```
Para rodar o projeto use o comando:<br>
`docker compose up`<br>
Quando a API e iniciada, as tabelas de usuario e sessão seram populados automaticamente.

## Estratégias Implementadas

O race condition foi resolvido aplicado o uso do Redis ao NestJS, com ele conseguimos determinar quem é o **'primeiro'** usuário que clica no assento, fazendo assim o segundo usuário receber um aviso que o assento ja esta ocupado.

Importante lembrar que o assento não tem seu status alterado no banco de dados para **'ocupado'**, o endpoint que lista a sessão do cinema onde traz a lista de assentos, compara se o **'assento_id'** que está no Redis esta na validade de 30 segundos. Caso esteja, ele mostra aquele assento como ocupado.

Após 30 segundos sem a **'confirmação da intenção de compra'**, o Redis com aquele **assento_id** perde a validade e fica **disponível** novamente para o usuário. Caso o usuário clique para **'confirmar a inteção de compra'**, aquele Redis com o assento_id renova sua validade por 10 minutos. Para que o usuário conclua sua compra nesse prazo, onde o seu assento ja esta garantido ao final da compra.

## Endpoints da API

1. Escolher o id de um usuário, para isso acesse o endpoint:<br> `/seed/users`<br>![alt text](/exemplos/image.png)


2. Listamos a sessão dos filmes e selecionamos o id de um assento dentro dessa sessão:<br> `/sessao/todas`<br>![alt text](/exemplos/image-1.png)


3. Com o id do assento e o id do usuário em mãos, executamos o endpoint:<br> `/reserva/assento`<br>![alt text](/exemplos/image-2.png)

4. Recebemos um retorno mostrando que nosso assento esta reservado por 30 segundos.<br>![alt text](/exemplos/image-3.png)

5. Ao verificamos a sessão com a lista de assentos, vemos que o assento selecionado está como ocupado. Isso e claro sem essa informação esteja salva no banco de dados graças ao Redis.<br>![alt text](/exemplos/image-4.png)

6. Durante os 30 segundos que o assento esta reservado, se o usuário clicar em confirmar aquele assento, será chamado esse endpoint: <br> `/reserva/confirma-intencao`<br>![alt text](/exemplos/image-5.png)

7. Onde receberá esse retorno, no qual, o nosso Redis terá um valor de expiração renovado para 10 minutos. Dando tempo para o usuário finalizar sua compra utilizando os meios de pagamento.<br>![alt text](/exemplos/image-6.png)

8. Por fim, ao chamar o endpoint:<br>`/reserva/pagamento`<br> Conseguimos concluir o ciclo de compra do assento, que consiste em reserva do assento por 30 segundos garantindo que dois usuário que clicarem no mesmo instante para reserva o assento, apenas o primeira consiga a reserva. Após essa primeira reserva o usuário podera avança para o pagamento, isso consiste em, **confirmar a intenção de compra** do assento. Onde nos colcoamos um tempo de expiração maior no registro do Redis. Por fim, ao realizar o pagamento nos processamos o pagamento, atualizamos o banco de dados com a nova informação no assento comprado e removemos o registro do Redis.<br>![alt text](/exemplos/image-7.png)<br>![alt text](/exemplos/image-8.png)


## Limitações Conhecidas

Não houve limitações das tecnologias envolvidas. Apenas a limitação do tempo para desenvolvimento e entrega.

## Melhorias Futuras

Para os proximos passo eu listaria os seguinte pontos de melhoria:

- Implementar testes unitários e de integração para as funcionalidades desenvolvidas.

- Desacoplar a lógica de pagamento do Controller de Reservas, permitindo a escalabilidade e a inclusão de novos métodos de pagamento (Strategy Pattern).

- Refatorar o objeto de Usuário para incluir campos adicionais (e-mail, data de nascimento, etc.), viabilizando a integração com microsserviços de mensageria para envio de recibos, notificações de lançamentos e campanhas de marketing personalizadas.

- Implementar o sistema de reembolso, garantindo a reversão de transações e a atualização do status da reserva.