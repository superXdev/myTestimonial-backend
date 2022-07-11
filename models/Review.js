import { Sequelize } from "sequelize";
import db from "../config/database.js";
 
// init DataTypes
const { DataTypes } = Sequelize;
 
// Define schema
const Review = db.define('reviews', {
  // Define attributes
  comment: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  accepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
},{
  // Freeze Table Name
  freezeTableName: true
});

export default Review;