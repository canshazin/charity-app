const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Donation = sequelize.define("donation", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },

  url: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  paymentid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  orderid: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = Donation;
