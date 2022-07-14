import db from "./config/database.js";

(async function () {
    try {
        await db.authenticate();
        db.sync({ force: true });
        await Setting.create({ 
            serverStarted: Date.now() 
        });
        console.log('Done');
    } catch (error) {
        throw Error(error.message);
    }
})