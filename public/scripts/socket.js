const Socket = (function () {
    // This stores the current Socket.IO socket.
    let socket = null;

    // This function gets the socket form the module.
    const getSocket = function () {
        return socket;
    };

    // This function connects to the server and initializes the socket.
    const connect = function () {
        socket = io();

        // Wait for the socket to connect successfully.
        socket.on('connect', () => {
            socket.emit('get isGameStarted');
        });

        socket.on('isGameStarted', (message) => {
            message = JSON.parse(message);
            isGameStarted = message['isGameStarted'];
            if (!isGameStarted) {
                // Load lobby info
                socket.emit('get lobbyInfo');
            }
        });

        socket.on('playerJoinLobby', (playerJoinLobby) => {
            playerJoinLobby = JSON.parse(playerJoinLobby);
        });

        socket.on('lobbyInfo', (message) => {
            lobbyInfo = JSON.parse(message);
            gameLobby.updateLobby(lobbyInfo);
        });

        socket.on('startCountdown', () => {
            gameLobby.startCountdown();
        });

        socket.on('gameInfo', (gameInfo) => {
            gameInfo = JSON.parse(gameInfo);
            requestAnimationFrame(() => {
                bomberman.updateGameCanvas(gameInfo);
            });
            bomberman.playAudio(gameInfo);
        });

        socket.on('gameOver', () => {
            gameOver.enterGameOver();
        });
    };

    // This function disconnects the socket from the server
    const disconnect = function () {
        socket.disconnect();
        socket = null;
    };

    const playerJoinLobby = function (playerNo) {
        const message = JSON.stringify({
            playerNo
        });
        socket.emit('post playerJoinLobby', message);
    };

    const updatePlayerConfig = function (color, maxHealth, startingBomb) {
        const message = JSON.stringify({
            color,
            maxHealth,
            startingBomb
        });
        socket.emit('post updatePlayerConfig', message);
    };

    const playerLeaveLobby = function () {
        socket.emit('post playerLeaveLobby');
    };

    const setPlayerReady = function (isReady) {
        const message = JSON.stringify({
            isReady
        });
        socket.emit('post playerReady', message);
    };

    const updateGameDuration = function (gameDuration) {
        const message = JSON.stringify({
            gameMap: 'default',
            gameDuration,
            powerUpEnabled: true
        });
        socket.emit('post updateGameConfig', message);
    };

    const playerOperation = function (operation) {
        const message = JSON.stringify({
            operation
        });
        socket.emit('post playerOperation', message);
    };

    const enablePlayerCheatMode = function (enable) {
        const message = JSON.stringify({
            enable
        });
        socket.emit('post enableCheat', message);
    };

    return {
        getSocket,
        connect,
        disconnect,
        playerJoinLobby,
        updatePlayerConfig,
        playerLeaveLobby,
        setPlayerReady,
        updateGameDuration,
        playerOperation,
        enablePlayerCheatMode
    };
})();
