const Sequelize = require('sequelize');
const db = require('./db');

const Cineplex = db.define('Cineplex', {
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
    },
    cineplex_Image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    cineplex_GoogleMap: {
        type: Sequelize.TEXT,
        allowNull: true,
    },

});

module.exports = Cineplex;