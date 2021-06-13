const Sequelize = require('sequelize');
const db = require('./db');
const User = require('./User');
const Showtime = require('./Showtime');
const { DATE, TIME } = require('sequelize');

const Booking = db.define('Booking', {
    booking_ID: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    booking_User: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    booking_Showtime: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    booking_Date: {
        type: Sequelize.DATEONLY,
        defaultValue: DATE.now,
        allowNull: false,
    },
    booking_Time: {
        type: Sequelize.TIME,
        defaultValue: Sequelize.NOW,
        allowNull: false,
    },
    booking_TotalPrice: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
    },
});


Booking.belongsTo(User, {
    foreignKey: 'booking_User',
});
Booking.belongsTo(Showtime, {
    foreignKey: 'booking_Showtime',
});

module.exports = Booking;