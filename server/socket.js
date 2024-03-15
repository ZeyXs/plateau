const { generateGameInstance, initGameFetch } = require("./utils");
const {
    onClientJoin,
    onNewChatMessage,
    onPlayerLeave,
    onStartTimer,
} = require("./handlers/basicHandlers");
const {
    onBatailleStart,
    onReceiveHandshake,
} = require("./handlers/batailleHandlers");

// Variable stockant toutes les instances des parties (identifiées par leur code/room)
var roomToGame = {};

// Récupération des données depuis la base de données à l'initialisation
const initAndFetch = async () => {
    let data = await initGameFetch();
    for (let gameData of data) {
        roomToGame[gameData.code] = await generateGameInstance(gameData);
    }
};
initAndFetch();

// _______________ CONTROLLERS _______________

const basicSocketHandler = (io, socket, data) => {
    const headers = data.headers;
    const code = headers.code;
    const channel = headers.channel;
    const gameInstance = roomToGame[code];
    let handled = true;
    switch (channel) {
        case "client.join":
            onClientJoin(io, socket, data, gameInstance, roomToGame);
            break;
        case "client.leave":
            onPlayerLeave(io, socket, data, gameInstance, roomToGame);
            break;
        case "client.sendMessage":
            onNewChatMessage(io, socket, data, gameInstance);
            break;
        case "client.startTimer":
            onStartTimer(socket, data);
        default:
            handled = false;
            break;
    }
    return handled;
};

// PAS ENCORE IMPLEMENTE
const batailleSocketHandler = (io, socket, data) => {
    const headers = data.headers;
    const code = headers.code;
    const channel = headers.channel;
    const gameInstance = roomToGame[code];
    switch (channel) {
        case "client.start":
            onBatailleStart(io, socket, data, gameInstance);
            break;
        case "client.receivedHandshake":
            console.log("Confirm handshake from router")
            onReceiveHandshake(io, socket, data, gameInstance);
            break;
        case "client.selectedCard":
            break;
    }
};

// PAS ENCORE IMPLEMENTE
const sixQuiPrendSocketHandler = (io, socket, data) => {
    const headers = data.headers;
    const code = headers.code;
    const channel = headers.channel;
    const gameInstance = roomToGame[code];
    switch (channel) {
        case "client.start":
            break;
        case "client.selectedCard":
            break;
    }
};

// PAS ENCORE IMPLEMENTE
const milleBornesSocketHandler = (io, socket, data) => {
    const headers = data.headers;
    const code = headers.code;
    const channel = headers.channel;
    const gameInstance = roomToGame[code];
    switch (channel) {
        case "client.start":
            break;
        case "client.selectedCard":
            break;
    }
}

// _______________ SOCKET IO _______________

const sockets = (io) => {
    io.on("connection", (socket) => {
        socket.on("client.message", (data) => {
            const headers = data.headers;
            const gameType = headers.gameType;
            if (!basicSocketHandler(io, socket, data)) {
                switch (gameType) {
                    case "Bataille":
                        batailleSocketHandler(io, socket, data);
                        break;
                    case "SixQuiPrend":
                        sixQuiPrendSocketHandler(io, socket, data);
                        break;
                    default:
                        break;
                }
            }
        });

        socket.on("disconnecting", () => {
            //console.log("[NOTIF] disconnecting received");
        });
    });

    return io;
};

module.exports = sockets;
