// const mysql = require('mysql');
// const options = {
// 	host: 'localhost',
// 	database: 'esp8266_nhom06',
// 	user: 'root',
// 	password: ''
// }
// var connection = mysql.createConnection(options);

// connection.connect(function (error) {
// 	if (error) {
// 		throw error;
// 	}
// 	console.log(`[SQL] Database ${options.database} is connected successfully`);
// });

// module.exports = connection;

const { Client } = require('pg')
const client = new Client({
    connectionString: `postgres://ryscfnlykfoaeq:dbb3ef4035d5d5d45398ffe033218e54a8eef861d409119acb4ac25f2a965bc4@ec2-34-201-95-176.compute-1.amazonaws.com/ddc7hn7rmkpnv7`,
    ssl: {
        rejectUnauthorized: false
    }
})
client.connect().then((err, result) => {
    if(err) throw new err
    console.log("[SQL] Connected to SQL successfully")
})
module.exports = client;