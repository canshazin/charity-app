const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Update = sequelize.define("update", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  msg: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Update;
