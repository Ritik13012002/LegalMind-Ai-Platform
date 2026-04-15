const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios'); // Python ko call marne ke liye
const Document = require('../models/Document');
const { protect } = require('../middleware/authMiddleware'); // Bouncer guard

// 1. Multer Storage Setup: Files ko kahan aur kaise save karna hai
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/'); // Ye upar banaya hua 'uploads' folder hai
    },
    filename(req, file, cb) {
        // file ka naam duplicate na ho isliye time lagate hain
        cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`); 
    }
});
const upload = multer({ storage });


// --- Get All User Documents Route ---
// Ye API login hue user ko uske saare previously uploaded documents list out karke degi.
router.get('/', protect, async (req, res) => {
    try {
        // Sirf wahi documents find karo jinme current user ki ID ho (taaki private rahe)
        // sort({ createdAt: -1 }) ka matlab latest uploaded file list mein sabse upar dikhe
        const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch documents" });
    }
});

// 2. Upload API Route
router.post('/upload', protect, upload.single('pdfFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Koi file upload nahi hui!" });
        }

        // a. Node.js khudka localhost link banayega file ka
        const localFileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        // b. Database me file ki details save karo
        const newDoc = await Document.create({
            userId: req.user._id,
            title: req.file.originalname,
            fileUrl: localFileUrl
        });

        console.log("File Node.js pe save ho gayi, ab Pythen Engine ko jagate hain...");

        // c. Asli Magic: Node.js tumhare Python AI (/ai/ingest) ko peeth-peeche (backend to backend) call karega
        const pythonResponse = await axios.post('http://127.0.0.1:8000/ai/ingest', {
            file_url: localFileUrl,          // Python ko link de diya
            document_id: newDoc._id.toString()// MongoDB ki document ID pass kar di!
        });

        // Taki database ko pata chale processing puri ho gayi Pinecone mein
        newDoc.status = 'Ingested';
        await newDoc.save();

        res.status(201).json({
            message: 'File successfully processed by AI Engine',
            document: newDoc,
            aiEngineOutput: pythonResponse.data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Upload and AI ingest failed", error: error.message });
    }
});

// --- 3. Chatbot Query Proxy Route ---
router.post('/query', protect, async (req, res) => {
    try {
        const { document_id, user_query } = req.body;
        // Node.js direct Python Engine ko bhejega sawal bina kisi ko bataye
        const pythonResponse = await axios.post('http://127.0.0.1:8000/ai/query', {
             user_query, document_id 
        });
        res.json(pythonResponse.data); // Answer react frontend ko return kiya
    } catch (error) {
        res.status(500).json({ error: "Failed connecting to AI Engine" });
    }
});

// --- 4. Risk Analysis Proxy Route ---
router.post('/analyze-risk', protect, async (req, res) => {
    try {
        const { document_id } = req.body;
        const pythonResponse = await axios.post('http://127.0.0.1:8000/ai/analyze-risk', { document_id });
        res.json(pythonResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Failed analyzing risk via AI Engine" });
    }
});

// --- 5. Document Summary Proxy Route ---
router.post('/summary', protect, async (req, res) => {
    try {
        const { document_id } = req.body;
        const pythonResponse = await axios.post('http://127.0.0.1:8000/ai/summary', { document_id });
        res.json(pythonResponse.data);
    } catch (error) {
        res.status(500).json({ error: "Failed getting summary via AI Engine" });
    }
});


module.exports = router;
