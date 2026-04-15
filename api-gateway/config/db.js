const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // .env file se URI utha kar connect karega
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`🚀 MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Error: ${error.message}`);
        process.exit(1); // Agar fail hua toh server band kar do
    }
};

module.exports = connectDB;
