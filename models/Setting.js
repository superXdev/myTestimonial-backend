import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
// init DataTypes
const { DataTypes } = Sequelize;
 
// Define schema
const Setting = db.define('settings', {
  // Define attributes
  adminUsername: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  serverStarted: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  // Freeze Table Name
  freezeTableName: true
});

export default Setting;