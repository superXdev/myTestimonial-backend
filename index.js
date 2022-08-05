const express = require('express');
const cors = require('cors');

const Router = require("./routes/api.js");
const { Setting } = require("./models/index.js");
const { bot, secretPath, BASE_URL } = require('./bot.js');
 
const app = express();

app.use(bot.webhookCallback(secretPath))
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
 
// use router
app.use(Router);
 
// listen on port
app.listen(5000, async () => {
    await Setting.update({ serverStarted: Date.now() }, { where: { id: 1 } });

    console.log(`Server running at 
Local: http://localhost:5000`);
});