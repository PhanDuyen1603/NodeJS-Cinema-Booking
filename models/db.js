const Sequelize = require('sequelize');
const url = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/cinema2'
const db = new Sequelize(url);

module.exports = db;