const Sequelize = require('sequelize');
const db = require('./db.js');
const cinema = require('./Cinema.js');
const film = require('./Film.js');
const TimeShow = require('./TimeShow.js');
const cinemaTimeShow = db.define('CinemaTimeShow' ,{
	cinemaTimeShow_ID :{
		type : Sequelize.INTEGER ,
		allowNull : true ,
		autoIncrement :true ,
		primaryKey : true ,
	},
	cinemaTimeShow_Date :{
		type : Sequelize.DATEONLY,
		allowNull : true,
		defaultValue : null,
	},
	timeShow_ID :{
		type : Sequelize.INTEGER ,
		allowNull : true ,
	},
	film_ID : {
		type : Sequelize.INTEGER,
		allowNull : true ,
	},
	cinema_ID :{
		type : Sequelize.INTEGER,
		allowNull : true ,
	}
});

cinemaTimeShow.belongsTo(cinema,{
	foreignKey : 'cinema_ID',
});
cinemaTimeShow.belongsTo(film,{
	foreignKey : 'film_ID',
});
cinemaTimeShow.belongsTo(TimeShow,{
	foreignKey :'timeShow_ID',
});


module.exports = cinemaTimeShow;
