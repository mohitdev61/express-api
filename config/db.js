// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false, 
        dialectOptions: {
            connectTimeout: 60000 
        },
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('🚀 AWS RDS Database connected successfully via Sequelize!');
    } catch (error) {
        console.error('❌ Unable to connect to AWS RDS:', error);
    }
};

module.exports = { sequelize, connectDB };
