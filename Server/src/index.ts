import { WebSocket, WebSocketServer } from "ws";

const ws = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket;
    room: string;
}

let activeConnections: User[] = [];

ws.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === "join") {
            activeConnections = activeConnections.filter(conn => conn.socket !== socket);
            activeConnections.push({
                socket,
                room: parsedMessage.payload.roomId
            });
            return;
        }

        if (parsedMessage.type === "chat") {
            const senderConnection = activeConnections.find(conn => conn.socket === socket);
            if (!senderConnection) return;

            activeConnections.forEach(conn => {
                if (conn.room === senderConnection.room && conn.socket !== socket) {
                    conn.socket.send(JSON.stringify({
                        text: parsedMessage.payload.message,
                        id: parsedMessage.payload.id
                    }));
                }
            });
        }
    });

    socket.on("close", () => {
        activeConnections = activeConnections.filter(conn => conn.socket !== socket);
    });
});