const sockets = io => {
    io.on('connection', socket => {
        socket.on('join', code => {
            socket.join(code);

            console.log(`🔥 ${socket.id} connected to ${code}`);
            console.log(socket.rooms);
        });

        socket.on('disconnecting', () => {
            for (const code of socket.rooms) {
                if (code !== socket.id) {
                    console.log(`🔥 ${socket.id} disconnected from ${code}`);
                }
            }
        });
    });

    return io;
};

const getRooms = () => {};

module.exports = sockets;
