const PORT = process.env.PORT || 3000;
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const WebSocket = require('ws');
const WSc = new WebSocket.Server({ server });
const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')

const client = require('./database')

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));
app.use(flash())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {
    const query = "SELECT * FROM data ORDER BY id DESC"
    const data = await client.query({
        rowMode: 'object',
        text: query,
    })
    const msg = req.flash('msg')
    const type = req.flash('type')
    res.render('index', {
      tableData: data.rows,
      connected: !!arduinoClient,
      msg: msg,
      type: type
    });
});

let arduinoClient = false
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
            arduinoClient = false
            console.log(`[WSc] ${socket.protocol} client is disconnected`);
        }
    });
});


app.post('/get_Text', async (req, res) => {
    if (!arduinoClient) {
        console.log('[WSc] No arduino client');
        req.flash('msg', '! ESP chưa kết nối!')
        req.flash('type', 'warning')
        res.redirect('/')
    }
    else {
        if (req.body.Ndung === undefined) {
            req.body.Ndo = true
        }
        const query = `INSERT INTO data (noidung, nhietdo, kichban) VALUES (${!req.body.Ndung? null: `'${req.body.Ndung}'`}, ${temp ? temp : null}, ${req.body.Kban})`
        await client.query(query);
        arduinoClient.send(JSON.stringify(req.body));
        console.log(`[WSc] data sended: ${JSON.stringify(req.body)}`)
        req.flash('msg', '! Gửi dữ liệu thành công!')
        req.flash('type', 'success')
        res.redirect('/')
    }
});

server.listen(PORT, () => {
    console.log('[SERVER] listening on *:' + PORT);
});