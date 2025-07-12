import { socketConnection } from "../../../Database/models/user.model.js";
import { authentication } from "../../../middleware/Socket/auth.middleware.js";

export const registerSocket = async (socket) => {
    const { data, valid } = await authentication({ socket })
    if (!valid) {
        return socket.emit('Socket_Error', data)
    }
    socketConnection.set(data?.user._id.toString(), socket.id)
    console.log(socketConnection);

    return "Done"

}


export const logOutSocketID = async (socket) => {

    return socket.on('disconnect', async () => {
        const { data, valid } = await authentication({ socket })

        if (!valid) {
            return socket.emit('Socket_Error', data)
        }
        socketConnection.delete(data?.user._id.toString(), socket.id)
        return "Done"
    })

}