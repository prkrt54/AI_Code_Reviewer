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
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;

        const project = socket.handshake.query.project;
        const authorizedProject = await getAuthorizedProject(project, socket.userId);
        if (!authorizedProject) {
            console.warn("Socket project authorization denied", {
                userId: socket.userId,
                projectId: project
            });
            return next(new Error('Project access denied'));
        }

        socket.projectId = project;
        
        next();
    } catch (error) {
        console.error("Socket authentication or authorization failed:", error.message);
        next(new Error('Invalid token: ' + error.message));
    }
});

async function getAuthorizedProject(projectId, userId) {
    return projectModel.findOne({
        _id: projectId,
        $or: [
            { owner: userId },
            { members: userId }
        ]
    }).select("_id");
}

io.on('connection', (socket) => {

    console.log('New client connected to project', {
        userId: socket.userId,
        projectId: socket.projectId
    });

    const project = socket.projectId;
    socket.join(project)

    socket.on('disconnect', () => {
        console.log('Client disconnected from project', {
            userId: socket.userId,
            projectId: project
        });
    });


    socket.on('chat-history', async () => {
        console.log("Chat history requested", {
            userId: socket.userId,
            projectId: project
        });
        try {
            const authorizedProject = await getAuthorizedProject(project, socket.userId);
            if (!authorizedProject) {
                console.warn("Chat history authorization denied", {
                    userId: socket.userId,
                    projectId: project
                });
                return socket.emit("error", "Project not found");
            }

            const messages = await messageModel.find({ project: project })
                .sort({ createdAt: 1 });
            console.log("Chat history returned", {
                userId: socket.userId,
                projectId: project,
                messageCount: messages.length
            });
            socket.emit("chat-history", messages)
        } catch (error) {
            console.error("Chat history failed:", error.message);
            socket.emit("error", error.message)
        }
    })

    socket.on("get-project-code", async () => {
        try {
            const projectData = await projectModel.findOne({
                _id: project,
                $or: [
                    { owner: socket.userId },
                    { members: socket.userId }
                ]
            }).select("code")
            if (!projectData) {
                return socket.emit("error", "Project not found")
            }
            socket.emit("project-code", projectData.code)
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on("chat-message", async message => {
        try {
            const authorizedProject = await getAuthorizedProject(project, socket.userId);
            if (!authorizedProject) {
                return socket.emit("error", "Project not found");
            }

            if (typeof message !== "string" || !message.trim()) {
                return socket.emit("error", "Message text is required");
            }

            const savedMessage = await messageModel.create({
                project: project,
                text: message.trim(),
                user: socket.userId
            });

            io.to(project).emit("chat-message", savedMessage);
        } catch (error) {
            socket.emit("error", error.message)
        }
    })

    socket.on('code-change', async (code) => {
        try {
            socket.broadcast.to(project).emit('code-change', code)
            await projectModel.findOneAndUpdate(
                {
                    _id: project,
                    $or: [
                        { owner: socket.userId },
                        { members: socket.userId }
                    ]
                },
                { code: code }
            )
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