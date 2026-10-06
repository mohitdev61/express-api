const express = require('express');
const app = express();
const PORT = 3000;
const cors = require('cors');
require('dotenv').config();

app.use(cors());

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

        // फाइल का एक यूनिक नाम बनाएं ताकि पुरानी फाइल ओवरराइट न हो
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
        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}://{fileName}`;

        res.json({
            success: true,
            message: 'इमेज S3 बकेट में सफलतापूर्वक अपलोड हो गई!',
            url: fileUrl
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

app.listen(PORT, () => {
    console.log(`Express Server is running internally on port ${PORT}`);
});

