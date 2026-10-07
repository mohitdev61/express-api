const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
const { connectDB, sequelize } = require('./config/db');

const Upload = require('./models/Upload');

require('dotenv').config();

app.use(cors());
app.use(express.json());

connectDB();

sequelize.sync({ alter: true })
    .then(() => console.log('🔄 All models synced with AWS RDS!'))
    .catch(err => console.error('❌ Sync error:', err));


// aws s3 api setup
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// 1. AWS S3 Client को कॉन्फ़िगर करें
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// 2. Multer को मेमोरी स्टोरेज पर सेट करें (फाइल सर्वर पर सेव नहीं होगी, सीधे S3 जाएगी)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 3. लाइव इमेज अपलोड API एंडपॉइंट (/api/upload)
app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'कोई फाइल अपलोड नहीं हुई!' });
        }

        const originalName = req.file.originalname;
        const fileName = `uploads/${Date.now()}_${req.file.originalname}`;

        // S3 पर फाइल भेजने का कमांड तैयार करें
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: fileName,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        };

        // फाइल को S3 बकेट में पुश करें
        await s3.send(new PutObjectCommand(uploadParams));

        // अपलोड होने के बाद लाइव फाइल का URL जेनरेट करें
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        const newUpload = await Upload.create({
            fileName: originalName,
            s3Url: fileUrl
        });

        res.json({
            success: true,
            message: 'इमेज S3 बकेट में सफलतापूर्वक अपलोड हो गई!',
            data: newUpload
        });

    } catch (error) {
        console.error('S3 Upload Error:', error);
        res.status(500).json({ success: false, message: 'सर्वर एरर: अपलोड फेल हो गया!' });
    }
});

// end

// Main API Endpoint
app.get('/api', (req, res) => {
    res.json({
        status: "Success",
        message: "Hello Mohit! Live automation testing here succesfully!",
        timestamp: new Date()
    });
});

// 🖼️ डेटाबेस से सभी अपलोड की गई इमेजेस की लिस्ट लाने की API
app.get('/api/images', async (req, res) => {
    try {
        // डेटाबेस से सारे रिकॉर्ड्स लेटेस्ट फर्स्ट (Newest First) ऑर्डर में निकालो
        const images = await Upload.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            data: images
        });
    } catch (error) {
        console.error('Fetch Images Error:', error);
        res.status(500).json({ success: false, message: 'डेटाबेस से इमेजेस लाने में एरर!' });
    }
});


app.listen(PORT, () => {
    console.log(`Express Server is running internally on port ${PORT}`);
});

