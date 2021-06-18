const Sequelize = require('sequelize');
const db = require('./db.js');
const Booking = require('./Booking');

const Ticket = db.define('Ticket', {
    ticket_ID: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
    },
    ticket_Booking: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ticket_Seat: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ticket_Price: {
        type: Sequelize.FLOAT,
        allowNull: false,
    },
});

Ticket.belongsTo(Booking, {
    foreignKey: 'ticket_Booking',
});
Booking.hasMany(Ticket, {
    onDelete: 'cascade',
    hooks: true
});
module.exports = Ticket;