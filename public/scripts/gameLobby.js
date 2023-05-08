// control UI relevant to game lobby
const gameLobby = (function () {
    let lobbyInfo = null;

    const enterLobby = function () {
        const currentUser = Authentication.getUser();
        if (currentUser) {
            $('#menu').hide();
            $('#game-lobby').show();
            $('.player-joined').hide();
            Socket.connect();
        }
    };

    const updateLobby = function (info) {
        lobbyInfo = info;
        const currentUser = Authentication.getUser();
        const players = ['player1', 'player2'];

        // Game config
        $('#config-time #decrease').text('-');
        $('#config-time #increase').text('+');
        if (lobbyInfo.gameConfig.gameDuration >= 240000) {
            $('#config-time #increase').text(' ');
        } else if (lobbyInfo.gameConfig.gameDuration <= 120000) {
            $('#config-time #decrease').text(' ');
        }

        for (const player of players) {
            // Check if P1 or P2 has joined
            if (lobbyInfo[player]) {
                // If joined, show player name and hide join button
                $(`#lobby-${player} .join-button`).hide();
                $(`#lobby-${player} .player-joined`).show();
                $(`#lobby-${player} .selector`).show();
                $(`#lobby-${player} .num-change`).show();
                fetch(`/users/${lobbyInfo[player].playerId}`)
                    .then((response) => response.json())
                    .then((response) => {
                        $(`#lobby-${player} .player-name`).text(response.user.name);
                    });
                // Player skin
                console.log(lobbyInfo[player].color);
                $(`#lobby-${player} #avatar-image`).attr('src', `assets/player${lobbyInfo[player].color}.png`);

                // Life button
                $(`#lobby-${player} #config-life #decrease`).text('-');
                $(`#lobby-${player} #config-life #increase`).text('+');
                $(`#lobby-${player} #config-life-num`).text(lobbyInfo[player].maxHealth);
                if (lobbyInfo[player].maxHealth >= 5) {
                    $(`#lobby-${player} #config-life #increase`).text(' ');
                } else if (lobbyInfo[player].maxHealth <= 1) {
                    $(`#lobby-${player} #config-life #decrease`).text(' ');
                }
                // Bomb button
                $(`#lobby-${player} #config-init-bomb #decrease`).text('-');
                $(`#lobby-${player} #config-init-bomb #increase`).text('+');
                $(`#lobby-${player} #config-init-bomb-num`).text(lobbyInfo[player].startingBomb);
                if (lobbyInfo[player].startingBomb >= 5) {
                    $(`#lobby-${player} #config-init-bomb #increase`).text(' ');
                } else if (lobbyInfo[player].startingBomb <= 1) {
                    $(`#lobby-${player} #config-init-bomb #decrease`).text(' ');
                }
                // Hide player option unless it's the current user
                if (lobbyInfo[player].playerId == currentUser.username) {
                    $(`#lobby-${player} .ready-message`).hide();
                    $(`#lobby-${player} .leave-button`).show();

                    // Check if the player is ready
                    if (!lobbyInfo[player].isReady) {
                        // If not ready, show ready button and hide cancel button
                        $(`#lobby-${player} .ready-button`).show();
                        $(`#lobby-${player} .cancel-button`).hide();
                    } else {
                        // If ready, show cancel button and hide ready button
                        $(`#lobby-${player} .ready-button`).hide();
                        $(`#lobby-${player} .cancel-button`).show();
                        // FIXME: To enhance ui only
                        // $(`#lobby-${player} .selector`).hide();
                        // $(`#lobby-${player} .num-change`).hide();
                    }
                } else {
                    // If the player is not the current user, hide all buttons
                    $(`#lobby-${player} .ready-button`).hide();
                    $(`#lobby-${player} .leave-button`).hide();
                    $(`#lobby-${player} .cancel-button`).hide();
                    $(`#lobby-${player} .selector`).hide();
                    $(`#lobby-${player} .num-change`).hide();
                    // Only shows the ready message if the player is ready
                    if (lobbyInfo[player].isReady) {
                        $(`#lobby-${player} .ready-message`).show().text(`I am ready!`);
                    } else {
                        $(`#lobby-${player} .ready-message`).show().text(`I am not ready!`);
                    }
                }
            } else {
                // If no one joined as P1/P2, show join button and hide player name
                $(`#lobby-${player} .join-button`).show();
                $(`#lobby-${player} .player-joined`).hide();
            }
        }

        // Game configuration
        // Convert milliseconds in MM:SS
        const duration = lobbyInfo.gameConfig.gameDuration / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        $('#lobby-game-config .game-duration').text(`${minutes}:${seconds == 0 ? '00' : seconds}`);
    };

    const backToMenu = function () {
        $('#game-lobby').hide();
        $('#menu').show();
        $('#canvas').css('background-image', "url('./assets/jayden/game_background.jpg')").css('background-color', 'none');

        // Disconnect user from websocket.
        Socket.disconnect();
    };

    const joinAsPlayer = function (id) {
        Socket.playerJoinLobby(id);
    };

    const leaveAsPlayer = function () {
        Socket.playerLeaveLobby();
    };

    const playerReady = function (isReady) {
        Socket.setPlayerReady(isReady);
    };

    const getPlayerConfig = function (username) {
        for (const player of ['player1', 'player2']) {
            if (lobbyInfo[player] && lobbyInfo[player].playerId == username) {
                return lobbyInfo[player];
            }
        }
    };

    const decreaseHealth = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        if (playerConfig.maxHealth > 1) {
            playerConfig.maxHealth--;
            Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
        }
    };

    const increaseHealth = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        if (playerConfig.maxHealth < 5) {
            playerConfig.maxHealth++;
            Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
        }
    };

    const decreaseBomb = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        if (playerConfig.startingBomb > 1) {
            playerConfig.startingBomb--;
            Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
        }
    };

    const increaseBomb = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        if (playerConfig.startingBomb < 5) {
            playerConfig.startingBomb++;
            Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
        }
    };

    const chooseLeftSkin = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        playerConfig.color--;
        if (playerConfig.color < 1) {
            playerConfig.color = 3;
        }
        Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
    };

    const chooseRightSkin = function () {
        const currentUser = Authentication.getUser();
        if (currentUser == null) return;
        let playerConfig = getPlayerConfig(currentUser.username);
        playerConfig.color++;
        if (playerConfig.color > 3) {
            playerConfig.color = 1;
        }
        Socket.updatePlayerConfig(playerConfig.color, playerConfig.maxHealth, playerConfig.startingBomb);
    };

    const increaseGameDuration = function () {
        let duration = lobbyInfo.gameConfig.gameDuration;
        if (duration < 240000) {
            duration += 30000;
        }
        Socket.updateGameDuration(duration);
    };

    const decreaseGameDuration = function () {
        let duration = lobbyInfo.gameConfig.gameDuration;
        if (120000 < duration) {
            duration -= 30000;
        }
        Socket.updateGameDuration(duration);
    };

    const startCountdown = function () {
        $('.leave-button').hide();
        $('.cancel-button').hide();
        $('.ready-message').show().text('I am ready!');
        $('#countdown').show();

        $('#countdown').text(3);
        setTimeout(() => {
            $('#countdown').text(2);
            setTimeout(() => {
                $('#countdown').text(1);
                setTimeout(() => {
                    $('#countdown').hide();
                    $('#game-lobby').hide();
                    $('#canvas').css('background-image', 'none').css('background-color', 'white');
                    bomberman.enableGameInput(true);
                }, 1000);
            }, 1000);
        }, 1000);
    };

    return {
        enterLobby,
        updateLobby,
        backToMenu,
        joinAsPlayer,
        leaveAsPlayer,
        playerReady,
        increaseGameDuration,
        decreaseGameDuration,
        startCountdown,
        increaseHealth,
        decreaseHealth,
        increaseBomb,
        decreaseBomb,
        chooseLeftSkin,
        chooseRightSkin
    };
})();
