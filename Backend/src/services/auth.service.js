import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userModel from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = '7d';

export async function registerUser(name, email, password) {
    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword
        });

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };
    } catch (error) {
        throw error;
    }
}

export async function loginUser(email, password) {
    try {
        // Find user and include password field
        const user = await userModel.findOne({ email }).select('+password');
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        };
    } catch (error) {
        throw error;
    }
}

export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

export async function getUserById(userId) {
    try {
        const user = await userModel.findById(userId).select('-password');
        return user;
    } catch (error) {
        throw error;
    }
}
