const Sequelize = require('sequelize');
const db = require('./db');
const Cineplex = require('./Cineplex');

const Cinema = db.define('Cinema', {
	cinema_ID: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	cinema_Name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	cinema_Type: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	cinema_Length: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	cinema_Width: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},

});

Cinema.belongsTo(Cineplex);
Cineplex.hasMany(Cinema, {
	onDelete: 'cascade',
	hooks: true
});
module.exports = Cinema;
