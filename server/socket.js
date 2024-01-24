const sockets = (http) => {
    const io = require('socket.io')(http, {
        cors: {
            origin: "http://localhost:3000"
        }
    });
    
    //Add this before the app.get() block
    io.on('connection', (socket) => {
        console.log(`⚡: ${socket.id} user just connected!`);
        socket.on('disconnect', () => {
          console.log('🔥: A user disconnected');
        });
    });

    return io;
}

module.exports = sockets;