import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({port: 8080});

interface User {
    socket : WebSocket;
    room : string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        // @ts-ignore 
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type == "join") {
            console.log("user joined room" + parsedMessage.payload.roomId);
            
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId
            })
        }

        if (parsedMessage.type == "chat") {
          const currentUserRoom = allSockets.find(
            (x) => x.socket === socket
          )?.room;

          for (const user of allSockets) {
            if (user.room === currentUserRoom) {
              user.socket.send(
                JSON.stringify({
                  message: parsedMessage.payload.message,
                  sender: socket === user.socket ? "you" : "other",
                })
              );
            }
          }
        }
        if (parsedMessage.type == "leave") {
            console.log("user left room" + parsedMessage.payload.roomId);
            allSockets = allSockets.filter((x) => x.socket !== socket);
        }
    })
      
        
})

