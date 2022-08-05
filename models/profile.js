'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Profile.init({
    fullName: DataTypes.STRING,
    position: DataTypes.STRING,
    photo: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    website: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};