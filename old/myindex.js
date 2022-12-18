const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const WebSocket = require('WS');
const WSc = new WebSocket.Server({ server });
const path = require('path')
const databaseConnection = require('../database');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    const query = "SELECT * FROM data ORDER BY id DESC"
    databaseConnection.query(query, function (error, data) {
        if (error) throw error
        console.log(!!arduinoClient)
        res.render('index', {
            tableData: data,
            arduino: !!arduinoClient
        });
    });
});

let arduinoClient
let temp = 0
let clients = [];

function broadcast(socket, data) {
    for (let i = 0; i < clients.length; i++) {
        if (clients[i] != socket) {
            clients[i].send(data);
        }
    }
}

WSc.on('connection', (socket, req) => {
    if (socket.protocol === 'arduino') {
        arduinoClient = socket
        console.log(`[WSc] ${socket.protocol} client is connected`);
    }

    clients.push(socket)

    socket.on('message', data => {
        broadcast(socket, data)
        temp = data.toString()
    });

    socket.on('close', () => {
        clients = clients.filter(sk => sk !== socket)
        if (socket.protocol === 'arduino') {
            arduinoClient = undefined
            console.log(`[WSc] ${socket.protocol} client is connected`);
        }
    });
});


app.post('/get_Text', (req, res) => {
    if (!arduinoClient) {
        return console.log('[WSc] No arduino client');
    }
    else {
        if (!req.body.Ndung) {
            req.body.Ndung = "";
        }
        const query = `INSERT INTO data (noidung, nhietdo, kichban) VALUES (${req.body.Ndung === ''? null: `'${req.body.Ndung}'`}, ${temp ? temp : null}, ${req.body.Kban})`
        console.log(query)
        databaseConnection.query(query, (err, result)=> {
            if(err) throw err;
            console.log(`[SQL] 1 record inserted, ID: ${result.insertId}`)
        });
        arduinoClient.send(JSON.stringify(req.body));
        console.log(`[WSc] data sended: ${JSON.stringify(req.body)}`)
        res.redirect('/')
    }
});

server.listen(PORT, () => {
    console.log('[SERVER] listening on localhost:' + PORT);
});