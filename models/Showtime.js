const Sequelize = require('sequelize');
const db = require('./db');
const Film = require('./Film');
const Cinema = require('./Cinema');

const Showtime = db.define('Showtime', {
    showtime_ID: {
        type: Sequelize.INTEGER,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true,
    },
    showtime_Film: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    showtime_Cinema: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    showtime_Date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    showtime_Begin: {
        type: Sequelize.TIME,
        allowNull: false,
    },
    showtime_Price: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },

});


Showtime.belongsTo(Film, {
    foreignKey: 'showtime_Film',
});

Showtime.belongsTo(Cinema, {
    foreignKey: 'showtime_Cinema'
});

module.exports = Showtime;