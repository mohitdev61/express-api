const express = require('express');
const app = express();
const PORT = 3000;

// Main API Endpoint
app.get('/api', (req, res) => {
    res.json({
        status: "Success",
        message: "Hello Bro! Your real Node.js Express API is officially live on AWS Cloud!",
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Express Server is running internally on port ${PORT}`);
});

