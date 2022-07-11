import express from "express";
import cors from "cors";
import db from "./config/database.js";
import Router from "./routes/api.js";
import { bot, secretPath } from './bot.js'
 
const app = express();

app.use(bot.webhookCallback(secretPath))
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
 
// Testing database connection 
try {
    await db.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}
 
// use router
app.use(Router);
 
// listen on port
app.listen(5000, () => console.log('Server running at http://localhost:5000'));