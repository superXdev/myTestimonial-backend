import db from "./config/database.js";

try {
    await db.authenticate();
    db.sync({ force: true });
} catch (error) {
    throw Error(error.message);
}