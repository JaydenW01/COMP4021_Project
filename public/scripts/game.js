const Game = function () {
    const canvas = $('canvas').get(0);
    canvas.width = 272; // 20 * 20 block. each block is 16px, so 16 * 20 = 320
    canvas.height = 208;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const Music = {
        background: new Audio('assets/audio/game_background.mp3'),
        collect: new Audio('assets/audio/collect_item.mp3'),
        explode: new Audio('assets/audio/explosion.mp3'),
        gameover: new Audio('assets/audio/gameover.mp3')
    };

    const blockWidth = 16;
    const blockHeight = 16;

    const breakables = {}
    const players = {}

    /* Size of Game Board:
     *  11 (height) x 13 (width)
     */
    let num_breakables_init= 0;
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 13; j++) {
            breakables[{x:i, y:j}] = new Breakable(context, j*blockWidth, i*blockHeight);
            num_breakables_init++;
        }
    }
    console.log("num breakables init: ", num_breakables_init);

    setInputEnabled = function (inputEnabled) {
        if (inputEnabled) {
            console.log("enabling input");
            $(document).on('keydown', function (event) {
                /* Handle the key down */
                switch (event.keyCode) {
                    case 37:
                    case 65:
                        Socket.moveLeft();
                        break;
                    case 38:
                    case 87:
                        Socket.moveUp();
                        break;
                    case 39:
                    case 68:
                        Socket.moveRight();
                        break;
                    case 40:
                    case 83:
                        Socket.moveDowwn();
                        break;
                    case 32:
                        Socket.placeBomb();
                        break;
                    // c - cheat mode
                    case 67:
                        // TODO
                        break;
                    // v - cheat mode off
                    case 86:
                        // TODO
                        break;
                }
            });
        } else {
            console.log("disable input");
            $(document).off('keydown');
        }
    };

    updateBoard = function (gameBoard) {
        const now = new Date().getTime();

        // Clear the screen
        context.clearRect(0, 0, canvas.width, canvas.height);
        const gameArea = BoundingBox(context, 32, 48, canvas.height - 32, canvas.width - 48);
        
        // draw map
        var img = new Image(src="../assets/gameboard.png");
        context.drawImage(img, 0, 0)

        // draw breakables
        let num_breakables_drawn = 0;
        for (const breakable of gameBoard.breakables) {
            breakables[breakable].draw();
            num_breakables_drawn++;
        }
        console.log("num breakables draw: ", num_breakables_drawn);

        for (const player of gameBoard.players) {
            if (player in players) {
                players[player.playerNo].update(
                    {x : player.location.y * blockWidth, y : player.location.x * blockHeight},
                    player.facing,
                    now);
            } else {
                players[player.playerNo] = new Player(
                    context,
                    player.location.y * blockWidth,
                    player.location.x * blockHeight,
                    player.colour
                )
                players[player.playerNo].update(player.location, player.facing, now);
            }
        }

        for (let key in players) {
            players[key].draw();
            console.log("player "+key+" drawn");
          }
    };

    return { setInputEnabled, updateBoard };
};
