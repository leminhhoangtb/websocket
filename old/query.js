const { Client } = require('pg')
const client = new Client({
    connectionString: `postgres://ryscfnlykfoaeq:dbb3ef4035d5d5d45398ffe033218e54a8eef861d409119acb4ac25f2a965bc4@ec2-34-201-95-176.compute-1.amazonaws.com/ddc7hn7rmkpnv7`,
    ssl: {
        rejectUnauthorized: false
    }
})
client.connect().then(() => {
    // const query = "ALTER TABLE data ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW()"
    const query = `DELETE FROM data`
    client.query(query)
}) 
