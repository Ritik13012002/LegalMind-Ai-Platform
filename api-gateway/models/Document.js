const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Ye link karega ki kis user ne konsi file dali
    },
    title: {
        type: String,
        required: true,
    },
    fileUrl: {
        type: String, // Node server e.g. http://localhost:5000/uploads/file.pdf
        required: true, 
    },
    status: {
        type: String,
        default: 'Uploaded' // Uploaded -> Ingested
    }
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
