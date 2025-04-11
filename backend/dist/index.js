"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 8080 });
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        var _a;
        // @ts-ignore 
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type == "join") {
            console.log("user joined room" + parsedMessage.payload.roomId);
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            });
        }
        if (parsedMessage.type == "chat") {
            const currentUserRoom = (_a = allSockets.find((x) => x.socket === socket)) === null || _a === void 0 ? void 0 : _a.room;
            for (const user of allSockets) {
                if (user.room === currentUserRoom) {
                    user.socket.send(JSON.stringify({
                        message: parsedMessage.payload.message,
                        sender: socket === user.socket ? "you" : "other",
                    }));
                }
            }
        }
        if (parsedMessage.type == "leave") {
            console.log("user left room" + parsedMessage.payload.roomId);
            allSockets = allSockets.filter((x) => x.socket !== socket);
        }
    });
});
