const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors());

// Main API Endpoint
app.get('/api', (req, res) => {
    res.json({
        status: "Success",
        message: "Hello Mohit! Live automation testing here succesfully!",
        timestamp: new Date()
    });
});

app.listen(PORT, () => {
    console.log(`Express Server is running internally on port ${PORT}`);
});

