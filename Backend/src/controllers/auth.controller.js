import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        const result = await registerUser(name, email, password);
        
        res.status(201).json({
            message: 'User registered successfully',
            ...result
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const result = await loginUser(email, password);
        
        res.status(200).json({
            message: 'Login successful',
            ...result
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
}
