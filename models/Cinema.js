const Sequelize = require('sequelize');
const db = require('./db');
const cineplex =  require('./Cineplex.js');

const cinema = db.define('Cinema',{
	cinema_ID : {
		type : Sequelize.INTEGER,
		primaryKey :true ,
		allowNull :false,
		autoIncrement :true ,
	},
	cinema_Name :{
		type : Sequelize.STRING ,
		allowNull : false,
	},
	cinema_Type :{
		type : Sequelize.STRING ,
		allowNull : false,
	},
	cinema_Length :{
		type : Sequelize.INTEGER ,
		allowNull : false,
	},
	cinema_Width :{
		type : Sequelize.INTEGER ,
		allowNull : false,
	},
	
});

cinema.belongsTo(cineplex);
module.exports = cinema;
