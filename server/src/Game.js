import Player from './Player.js';

import GameController from './GameController.js';
import GameView from './GameView.js';
import { Server } from 'socket.io';

import fs from 'fs';

export default class Game {
    static GAME_TICK = 200;
    static MAX_GAME_DURATION = 4 * 60 * 1000;
    static MIN_GAME_DURATION = 2 * 60 * 1000;

    /**
     * Create a bomberman game.
     */
    constructor() {
        this.playersInLobby = {
            1: null,
            2: null
        };
        this.gameConfig = {
            gameDuration: 210000,
            powerUpEnabled: true
        };

        this.gameBoard = null;
        this.gameController = null;
        this.gameView = null;

        this.gameStarted = false;
        this.gameStartTime = null;
        this.gameOver = false;
        this.timeOut = null;
    }

    /**
     * Get the game lobby info.
     * @returns {object} The game lobby info.
     */
    getLobbyInfo() {
        return {
            player1: this.playersInLobby[1],
            player2: this.playersInLobby[2],
            gameConfig: this.gameConfig
        };
    }

    /**
     * Add user to lobby. Return true if user is added successfully.
     * @param {string} playerNo The player number.
     * @param {string} playerId The playerId of the user.
     * @returns {boolean} True if user is added successfully.
     */
    addPlayerToLobby(playerNo, playerId) {
        // Check is player joined as other player number before.
        if (this.playersInLobby[1] && this.playersInLobby[1].playerId === playerId) {
            return false;
        }
        if (this.playersInLobby[2] && this.playersInLobby[2].playerId === playerId) {
            return false;
        }
        // Check if player number is available.
        if (this.playersInLobby[playerNo] === null) {
            this.playersInLobby[playerNo] = {
                playerId,
                color: 1,
                maxHealth: 3,
                startingBomb: 1,
                isReady: false
            };
            return true;
        }
        return false;
    }

    /**
     * Get the player number by player id.
     * @param {number} playerId The player id.
     * @returns {number | null} The player number.
     */
    getPlayerNoByPlayerId(playerId) {
        if (this.playersInLobby[1] && this.playersInLobby[1].playerId === playerId) {
            return 1;
        }
        if (this.playersInLobby[2] && this.playersInLobby[2].playerId === playerId) {
            return 2;
        }
        return null;
    }

    /**
     * Update the player in lobby info.
     * @param {number} playerNo The player number.
     * @param {object} playerInfo The player info. Contains field `color`, `maxHealth`, `startingBomb`.
     */
    updatePlayerConfig(playerNo, playerInfo) {
        const { color, maxHealth, startingBomb } = playerInfo;
        this.playersInLobby[playerNo].color = color;
        this.playersInLobby[playerNo].maxHealth = maxHealth <= 0 ? 1 : maxHealth;
        this.playersInLobby[playerNo].startingBomb = startingBomb < 1 ? 1 : startingBomb > 5 ? 5 : startingBomb;
    }

    /**
     * Remove player from lobby.
     * @param {number} playerNo The player number.
     */
    removePlayerFromLobby(playerNo) {
        this.playersInLobby[playerNo] = null;
    }

    /**
     * Update the game configuration.
     * @param {object} gameConfig The game configuration. Contains field `gameMap`, `gameDuration`, `powerUpEnabled`.
     */
    updateGameConfig(gameConfig) {
        if (gameConfig.gameDuration > this.MAX_GAME_DURATION)
            gameConfig.gameDuration = this.MAX_GAME_DURATION;
        if (gameConfig.gameDuration < this.MIN_GAME_DURATION)
            gameConfig.gameDuration = this.MIN_GAME_DURATION;
        this.gameConfig = gameConfig;
    }

    /**
     * Set the ready state of the player.
     * @param {number} playerNo The player number.
     * @param {boolean} isReady The ready state of the player.
     */
    setPlayerReady(playerNo, isReady) {
        if (isReady == null) {
            isReady = false;
        }
        this.playersInLobby[playerNo].isReady = isReady;
    }

    /**
     * Check if the player is ready to start the game.
     * @param {number} playerNo The player number.
     * @returns {boolean} True if the player is ready to start the game.
     */
    isPlayerReady(playerNo) {
        return this.playersInLobby[playerNo].isReady;
    }

    /**
     * Check if all players are ready.
     * @returns {boolean} True if all players are ready.
     */
    isAllPlayersReady() {
        return (
            this.playersInLobby[1] != null &&
            this.playersInLobby[2] != null &&
            this.playersInLobby[1].isReady &&
            this.playersInLobby[2].isReady
        );
    }

    /**
     * Set the operation of the player.
     * @param {string} playerId The id of the player.
     * @param {string} operation The new operation of the player.
     */
    setPlayerOperation(playerId, operation) {
        if (operation !== null) {
            this.gameController.setPlayerOperation(playerId, operation);
        }
    }

    /**
     * Toggle the player cheat mode.
     * @param {string} playerId The player Id.
     */
    enablePlayerCheatMode(playerId, enable) {
        this.gameController.enablePlayerCheatMode(playerId, enable);
    }

    /**
     * Initialize the game.
     * @returns {boolean} True if the game is initialized successfully.
     */
    initializeGame() {
        if (!this.isAllPlayersReady()) {
            return false;
        }

        // Create game board.
        switch (this.gameConfig.gameMap) {
            case 'default':
                this.gameBoard = GameBoardLoader.createRandomBoard(20, 20);
                break;
            default:
                return false;
        }
        // Create game board controller.
        this.gameController = new GameController(this.gameBoard);
        // Create game board view.
        this.gameView = new GameView(this.gameController);

        // Add players to the game board.
        const startingPositions = this.gameBoard.getAvailablePlayerStartingPositions();
        for (let i = 1; i <= 2; i++) {
            const player = new Player(
                this.playersInLobby[i].playerId,
                this.playersInLobby[i].color,
                startingPositions[i - 1],
                this.playersInLobby[i].maxHealth,
                this.playersInLobby[i].startingBomb
            );
            this.gameController.addPlayer(player);
        }

        return true;
    }

    /**
     * Check if the game has started.
     * @returns {boolean} True if the game has started.
     */
    isGameStarted() {
        return this.gameStarted;
    }

    /**
     * Stop the game.
     */
    setGameOver() {
        this.gameOver = true;
    }

    /**
     * Check if the game is over.
     * @param {Date} now The current time.
     * @returns {boolean} True if the game is over.
     */
    isGameOver(now, io) {
        // Check if game duration exceeds.
        if (now - this.gameStartTime > this.gameConfig.gameDuration) {
            this.gameOver = true;
        }

        // Check if any players is not alive.
        const players = this.gameController.getAllPlayers();

        const this_round_win_loss = {};

        const player_win = [];
        const player_loss = [];
        for (let i = 0; i < players.length; i++) {
            if (!players[i].isAlive(now)) {
                player_loss.push(players[i].id);
                this.gameOver = true;
            } else player_win.push(players[i].id);
        }

        // emit win/loss for this round AND save win/loss stat if someone dies
        if (this.gameOver) {
            this_round_win_loss['win'] = player_win;
            this_round_win_loss['loss'] = player_loss;
            // console.log('????', this_round_win_loss);
            io.emit('gameOver', JSON.stringify(this_round_win_loss));

            const overallStat = JSON.parse(fs.readFileSync('data/statisticBoard.json'));
            // console.log('1======overallStat', overallStat);

            for (const pl of player_loss) {
                if (pl in overallStat) {
                    // console.log('pl===', pl);
                    overallStat[pl]['loss'] += 1;
                } else overallStat[pl] = { win: 0, loss: 1 };
            }
            for (const pw of player_win) {
                if (pw in overallStat) {
                    // console.log('pw===', pw);
                    overallStat[pw]['win'] += 1;
                } else overallStat[pw] = { win: 1, loss: 0 };
            }
            // console.log('2======overallStat', overallStat);
            fs.writeFileSync('data/statisticBoard.json', JSON.stringify(overallStat, null, ' '));
        }

        return this.gameOver;
    }

    /**
     * Start the game.
     * @param {Server} io The socket.io instance.
     */
    startGame(io) {
        const initializeSuccess = this.initializeGame();
        if (!initializeSuccess) {
            console.error('Error occur when starting game.');
            return;
        }
        this.gameStarted = true;
        // Start the game loop.
        this.gameStartTime = new Date();
        this.updateGame(io);
    }

    /**
     * Update the game.
     * @param {Server} io The socket.io instance.
     */
    updateGame(io) {
        let currentTime = new Date();

        // Check game over condition.
        if (this.isGameOver(currentTime, io)) {
            console.log('Game over!');
            clearTimeout(this.timeOut);
            // Signal the game over event.
            io.emit('gameOver');
            this.resetGame();
            return;
        }

        this.gameController.resetGameAudio();

        this.gameController.preformAllPlayersOperation(currentTime, io);
        this.gameController.clearAllPlayerOperation();
        this.gameController.handleExplodedBomb(currentTime);
        this.gameController.handleFadedBombExplosion(currentTime);
        this.gameController.spawnPowerUp(currentTime);

        const timeLeft = this.gameConfig.gameDuration - (currentTime - this.gameStartTime);
        const view = this.gameView.getGameInfo(currentTime, timeLeft);
        this.gameView.getDebugView();
        io.emit('gameInfo', JSON.stringify(view));

        // Update game again after GAME_TICK.
        this.timeOut = setTimeout(() => this.updateGame(io), Bomberman.GAME_TICK);
    }

    /**
     * Reset the game.
     */
    resetGame() {
        this.playersInLobby = {
            1: null,
            2: null
        };
        this.gameConfig = {
            gameMap: 'default',
            gameDuration: 210000,
            powerUpEnabled: true
        };

        this.gameBoard = null;
        this.gameController = null;
        this.gameView = null;

        this.gameStarted = false;
        this.gameStartTime = null;
        this.gameOver = false;
        this.timeOut = null;
    }
}
