const express = require('express');
const app = express();
const PORT = 3000;

// Main API Endpoint
app.get('/api', (req, res) => {
    res.json({
        status: "Success",
        message: "Hello Mohit! Your have done it on AWS Cloud!",
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Express Server is running internally on port ${PORT}`);
});

