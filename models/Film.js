const Sequelize = require('sequelize');
const db = require('./db');

const Film = db.define('Film', {
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
        type: Sequelize.DATEONLY,
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
    film_Public: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
    },
    film_Content: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    film_Trailer: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    film_VisitCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
    film_ViewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
    },
});

module.exports = Film;
