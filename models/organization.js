const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Organization = sequelize.define("organization", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  oname: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  mission: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  location: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  contactEmail: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  isApproved: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
  },

  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  goal: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Organization;
