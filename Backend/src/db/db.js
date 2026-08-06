import mongoose from 'mongoose';
import config from '../config/config.js';


async function connectWithUri(uri, label) {
    await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log(`Connected to MongoDB (${label})`);
}

async function connectToDb() {
    const urisToTry = [
        { uri: config.MONGODB_URI, label: 'primary' },
        { uri: config.MONGODB_LOCAL_URI, label: 'local fallback' },
    ].filter(({ uri }) => typeof uri === 'string' && uri.length > 0);

    let lastError;

    for (const { uri, label } of urisToTry) {
        try {
            await connectWithUri(uri, label);
            return;
        } catch (error) {
            lastError = error;
            console.log(`Error connecting to MongoDB (${label})`, error.message);
        }
    }

    console.error(
        'MongoDB connection failed. Check MONGODB_URI in Backend/.env or set MONGODB_LOCAL_URI for local development.'
    );
    process.exit(1);
}


export default connectToDb;