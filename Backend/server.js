import app from './src/app.js'
import connectToDb from './src/db/db.js';
import { Server as SocketServer } from 'socket.io';
import messageModel from './src/models/message.model.js';
import http from 'http';
import projectModel from './src/models/project.model.js';
import { getReview } from './src/services/ai.service.js';
import { verifyToken } from './src/services/auth.service.js';


connectToDb();

const server = http.createServer(app);
const io = new SocketServer(server, {
    cors: {
        origin: '*',
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Closing server gracefully...');
    io.close();
    server.close(() => {
        process.exit(0);
    });
});


// Socket authentication middleware
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        
        next();
    } catch (error) {
        next(new Error('Invalid token: ' + error.message));
    }
});


io.on('connection', (socket) => {

    console.log('New client connected:', socket.userId);


    const project = socket.handshake.query.project
    socket.join(project)

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });


    socket.on('chat-history', async () => {
        try {
            const messages = await messageModel.find({ project: project })
            socket.emit("chat-history", messages)
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on("get-project-code", async () => {
        try {
            const projectData = await projectModel.findById(project).select("code")
            socket.emit("project-code", projectData.code)
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on("chat-message", async message => {
        try {
            socket.broadcast.to(project).emit("chat-message", message)
            await messageModel.create({
                project: project,
                text: message,
                user: socket.userId
            })
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on('code-change', async (code) => {
        try {
            socket.broadcast.to(project).emit('code-change', code)
            await projectModel.findOneAndUpdate({ _id: project }, { code: code })
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on("get-review", async (code) => {
        try {
            const review = await getReview(code)
            socket.emit("code-review", review)
        } catch (error) {
            console.error("Review error:", error);
            socket.emit("review-error", error.message)
        }
    })
});

server.listen(3000, () => {
    console.log("Server is running on port 3000");
});