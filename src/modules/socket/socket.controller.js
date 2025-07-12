
import { Server } from "socket.io";
import { logOutSocketID, registerSocket } from "./service/socket.service.js";


export const runIo = (httpServer) => {
    const io = new Server(httpServer, { cors: "*" })



    io.on('connection', async (socket) => {
        await registerSocket(socket)
        await logOutSocketID(socket)
    })

}