const Sequelize = require('sequelize');
const db = require('./db.js');


const TimeShow = db.define('TimeShow', {
	timeShow_ID: {
		type: Sequelize.INTEGER,
		allowNull: true,
		primaryKey: true,
	},
	timeShow_Start: {
		type: Sequelize.TIME,
		allowNull: true,
	},
	timeShow_End: {
		type: Sequelize.TIME,
		allowNull: true,
	},
});
module.exports = TimeShow;