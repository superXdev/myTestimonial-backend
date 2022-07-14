import express from "express";
import cors from "cors";

import db from "./config/database.js";
import Router from "./routes/api.js";
import Setting from "./models/Setting.js";
import { bot, secretPath, BASE_URL } from './bot.js';
 
const app = express();

app.use(bot.webhookCallback(secretPath))
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
 
// use router
app.use(Router);
 
// listen on port
app.listen(5000, async () => {
    db.sync({ force: true });
    const isSettingExists = await Setting.count({ where: { id: 1 } });

    if(!isSettingExists) {
        await Setting.create({
            serverStarted: Date.now()
        });
    } else {
        await Setting.update({ serverStarted: Date.now() }, { where: { id: 1 } })
    }

    console.log(`Server running at 
Local: http://localhost:5000
Public: ${BASE_URL}`)
});