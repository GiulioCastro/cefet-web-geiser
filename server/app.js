// importação de dependência(s)
import express from 'express';
import { readFile } from 'fs/promises'

const app = express();

// variáveis globais deste módulo
const PORT = 3000
const db = {}

// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

const jogadoresJSON = await readFile('server/data/jogadores.json')
db.jogadores = JSON.parse(jogadoresJSON);

const jogosPorJogadorJSON = await readFile('server/data/jogosPorJogador.json')
db.jogosPorJogador = JSON.parse(jogosPorJogadorJSON);


// configurar qual templating engine usar. Sugestão: hbs (handlebars)
//app.set('view engine', '???qual-templating-engine???');
//app.set('views', '???caminho-ate-pasta???');
// dica: 2 linhas
app.set("view engine", "hbs");
app.set("views", "server/views");

// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)

app.get("/", (req, res) => {
    res.render("index.hbs", db.jogadores);
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

app.get("/jogador/:numero_identificador", (req, res) => {
    const steamid = req.params.numero_identificador;
    const player = db.jogadores.players.find((player) => player.steamid === steamid);

    if (!player) return res.status(404).send('Jogador não encontrado!');

    const { game_count, games } = db.jogosPorJogador[steamid];

    const not_played_count = games.filter(game => game.playtime_forever === 0).length;
    const top5_played = games.sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0,5);

    const details = {
        player,
        game_count,
        not_played_count,
    };

    details.top5_played = top5_played.map(game => ({
        ...game,
        playtime_forever: (game.playtime_forever / 60).toFixed(0)
    }));

    details.favorite_game = details.top5_played[0];

    res.render("jogador.hbs", details);
});

// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código

app.use(express.static('./client'));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => console.log(`listening on port: ${PORT}`));