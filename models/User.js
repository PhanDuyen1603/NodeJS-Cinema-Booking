const Sequelize = require('sequelize');
const db = require('./db');

const user = db.define('User', {
	user_ID: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	user_Email: {
		type: Sequelize.STRING,
		allowNull: false,
		unique: true,
	},
	user_Password: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	user_Name: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	user_NumberPhone: {
		type: Sequelize.STRING,
		allowNull: false,
	},
	user_Address: {
		type: Sequelize.STRING,
		allowNull: true,
	},
	user_Code: {
		type: Sequelize.STRING,
		allowNull: true
	},
	accept_User: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	}
});

user.findByEmail = async (email) => {
	return user.findOne({ where: { user_Email: email } });
}

user.activateAccount = async (email, code) => {
	user.update();
}

module.exports = user;
