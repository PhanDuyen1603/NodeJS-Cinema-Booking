const Sequelize = require('sequelize');
const db = require('./db');

const cineplex = db.define('Cineplex', {
    cineplex_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
    },
    cineplex_Name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    cineplex_Address: {
        type: Sequelize.STRING,
        allowNull: false,
    }
});

module.exports = cineplex;