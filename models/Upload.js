// models/Upload.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// इमेज स्टोर करने के लिए टेबल का ढांचा (Schema)
const Upload = sequelize.define('Upload', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    s3Url: {
        type: DataTypes.STRING(500), // URL लंबा हो सकता है इसलिए साइज़ 500 रखा है
        allowNull: false
    }
}, {
    timestamps: true // इससे createdAt और updatedAt कॉलम अपने आप बन जाएंगे
});

module.exports = Upload;
