const Sequelize = require('sequelize');
const db = require('./db.js');
const cinemaTimeShow = require('./CinemaTimeShow.js');
const user = require('./User.js');

const tiket = db.define('Ticket' ,{
	ticket_ID :{
		type : Sequelize.STRING ,
		allowNull : false ,
        primaryKey : true ,
    },
    ticket_Num :{
        type : Sequelize.INTEGER ,
        allowNull : false ,
        autoIncrement :true ,
    },
    ticket_ChairType :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    ticket_Chair :{
        type : Sequelize.STRING,
        allowNull : true,
    },
    ticket_TotalMoney :{
        type : Sequelize.INTEGER,
        allowNull : true,
    },
	cinemaTimeShow_ID :{
        type : Sequelize.INTEGER ,
        allowNull : true ,
    },
    user_ID :{
        type : Sequelize.INTEGER,
        allowNull : false,
    },
});
tiket.belongsTo(user,{
    foreignKey : 'user_ID',
});
tiket.belongsTo(cinemaTimeShow,{
    foreignKey : 'cinemaTimeShow_ID',
});

module.exports = tiket;