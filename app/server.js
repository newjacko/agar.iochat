const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();

// Serve static files from 'public' directory
app.use(express.static('public'));

// CORS setup: Adjust the origin according to your requirements
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (origin.endsWith('.agar.io') || origin === 'https://agar.io') {
            callback(null, true);
        } else {
            callback(new Error('CORS not allowed from ' + origin), false);
        }
    }
}));

// Create an HTTP server using the Express app
const server = http.createServer(app);

// Initialize a WebSocket server instance tied to the HTTP server
const wss = new WebSocket.Server({ server });

// Map to store user details including their GAME IP
const users = new Map();

// Retrieve all connected users with their nicknames and IDs
function getConnectedUsers() {
    return Array.from(users.values()).map(user => ({
        userNickname: user.userNickname || "Anonymous",
        userId: user.userId,
        avatar: user.avatar // Avatar from local storage
    }));
}

wss.on('connection', function connection(ws, req) {
    const host = req.headers.host; // e.g., 'live-arena-1hoiqdc.agar.io'
    const userId = host.split('.')[0].split('-').pop(); // Extracts user ID
    const clientIP = req.socket.remoteAddress; // Client's IP address

    console.log(`New connection: userId=${userId}, clientIP=${clientIP}`);

    // Store client's initial details
    users.set(ws, { userId, userNickname: "Anonymous", clientIP, avatar: '' }); // No default avatar

    ws.on('message', function incoming(data) {
        try {
            const message = JSON.parse(data);
            console.log(`Received message from ${userId}:`, message);

            // Handle different message types
            switch (message.type) {
                case 'nickname':
                    const userDetails = users.get(ws);
                    userDetails.userNickname = message.nickname || "Anonymous";
                    userDetails.avatar = message.avatar || ''; // Update avatar if provided
                    users.set(ws, userDetails);
                    console.log(`User ${userId} set nickname to ${userDetails.userNickname} and avatar to ${userDetails.avatar}`);
                    break;
                case 'requestUsers':
                    ws.send(JSON.stringify({ type: 'userList', users: getConnectedUsers() }));
                    break;
                default:
                    console.log('Received:', message.name + ": " + message.text);
                    // Include avatar in the message
                    message.avatar = users.get(ws).avatar;
                    // Broadcast to all clients from the same GAME IP, including the sender
                    broadcastToSameIP(ws, message, clientIP);
                    break;
            }
        } catch (e) {
            console.error('Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log(`Connection closed: userId=${userId}`);
        users.delete(ws); // Remove user from map on disconnect
    });
});

// Broadcast messages to clients from the same GAME IP, including the sender
function broadcastToSameIP(ws, message, clientIP) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            const clientDetails = users.get(client);
            if (clientDetails && clientDetails.clientIP === clientIP) {
                client.send(JSON.stringify(message));
            }
        }
    });
}

// Start the server on the environment-specified port or 3001
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/`);
});
