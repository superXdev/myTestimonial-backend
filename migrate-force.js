import db from "./config/database.js";

try {
    await db.authenticate();
    db.sync({ force: true });
    await Setting.create({ 
        serverStarted: Date.now() 
    })
} catch (error) {
    throw Error(error.message);
}