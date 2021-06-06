const Sequelize = require('sequelize');
const db = require('./db');

const film = db.define('Film', {
    film_ID: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    film_Name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    film_DatePublic: {
        type: Sequelize.DATE,
        allowNull: true,
    },
    film_Image: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    film_Time: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    film_ViewCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        get() {
            return 0;
        }
    },
    film_Public: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        get() {
            return false;
        }
    },
    film_Content: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

module.exports = film;
