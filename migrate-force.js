import db from "./config/database.js";

try {
    await db.authenticate();
    db.sync();
} catch (error) {
    throw Error(error.message);
}