const Game = function (sprites) {
    const bgIMG = sprites.bgIMG;
    const bkIMG = sprites.breakableIMG;
    const blueIMG = sprites.blueIMG;
    const redIMG = sprites.redIMG;
    const yellowIMG = sprites.yellowIMG;
    const blackIMG = sprites.blackIMG;
    const spritesheet = sprites.spritesheet;
    const redSprite = sprites.redSprite;
    const blueSprite = sprites.blueSprite;
    const blackSprite = sprites.blackSprite;
    const yellowSprite = sprites.yellowSprite;
    const canvas = $('#canvas').get(0);
    canvas.width = 272; // 20 * 20 block. each block is 16px, so 16 * 20 = 320
    canvas.height = 208;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const Music = {
        background: new Audio('assets/audio/game_bgm.mp3'),
        collect: new Audio('assets/audio/collect_item.mp3'),
        explode: new Audio('assets/audio/explosion.mp3'),
        gameover: new Audio('assets/audio/gameover.mp3')
    };

    const blockWidth = 16;
    const blockHeight = 16;

    // const breakables = {}
    const players = {}

    let fires = []

    let lastGameBoard = null;

    /* Size of Game Board:
     *  11 (height) x 13 (width)
     */
    // let num_breakables_init= 0;
    // for (let i = 0; i < 11; i++) {
    //     for (let j = 0; j < 13; j++) {
    //         breakables[{x:i, y:j}] = new Breakable(context, j*blockWidth, i*blockHeight,bkIMG);
    //         num_breakables_init++;
    //     }
    // }
    // console.log("num breakables init: ", num_breakables_init);

    setInputEnabled = function (inputEnabled) {
        if (inputEnabled) {
            console.log("enabling input");
            $(document).on('keydown', function (event) {
                /* Handle the key down */
                switch (event.keyCode) {
                    case 37:
                    case 65: // left
                        socket.emit("moveLeft");
                        break;
                    case 38:
                    case 87: // up
                        socket.emit("moveUp");
                        break;
                    case 39:
                    case 68: // right
                        socket.emit("moveRight");  
                        break;
                    case 40:
                    case 83: // down
                        socket.emit("moveDown");  
                        break;
                    case 32: // bomb
                        socket.emit("placeBomb");  
                        break;
                    // c - cheat mode
                    case 67:
                        // TODO
                        socket.emit("enable cheat");
                        break;
                    // v - cheat mode off
                    case 86:
                        // TODO
                        socket.emit("disable cheat");
                        break;
                }
            });
        } else {
            console.log("disable input");
            $(document).off('keydown');
        }
    };

    updateBoard = function (gameBoard, repeat = true) {
        const now = new Date().getTime();
        lastGameBoard = JSON.parse(JSON.stringify(gameBoard));
        // console.log(breakables);
        // Clear the screen
        context.clearRect(0, 0, canvas.width, canvas.height);
        const player1info = gameBoard.players[0];
        const player2info = gameBoard.players[1];

        $("#player1-points").text(`Player 1 Points: ${player1info.points}`);
        $("#player2-points").text(`Player 2 Points: ${player2info.points}`);
        $("#player1-health").text(`Player 1 Remaining Life: ${player1info.health}/3`);
        $("#player2-health").text(`Player 2 Remaining Life: ${player2info.health}/3`);
        // draw map
        // let img = new Image();
        // img.onload = () => {
        //     context.drawImage(img, 0, 0);
        // }
        // img.src = "../assets/gameboard.png";
        context.drawImage(bgIMG, 0, 0)

        // draw breakables
        let num_breakables_drawn = 0;
        for (const breakable of gameBoard.breakables) {
            // const b = new Breakable(context, (breakable.x+2)*blockWidth, (breakable.y+1)*blockHeight,bkIMG)
            // b.draw();
            context.drawImage(bkIMG,(breakable.x+2)*blockWidth,(breakable.y+1)*blockHeight);
            num_breakables_drawn++;
        }
        console.log("num breakables draw: ", num_breakables_drawn);

        for (const player of gameBoard.players) {
            const loc = {x: (player.location.x+2)*blockWidth, y: (player.location.y+1)*blockHeight};
            if (player in players) {
                console.log("updating player "+player.playerNo+" location: ("+loc.x+", "+loc.y+")");
                players[player.playerNo].update(
                    loc,
                    player.facing,
                    now);
            } else {
                let spriteSheet;
                switch(player.colour) {
                    case("blue"):
                        spriteSheet = blueSprite;
                        break;
                    case("red"):
                        spriteSheet = redSprite;
                        break;
                    case("yellow"):
                        spriteSheet = yellowSprite;
                        break;
                    case("black"):
                        spriteSheet = blackSprite;
                        break;
                }
                console.log("creating player "+player.playerNo+" location: ("+loc.x+", "+loc.y+")");
                players[player.playerNo] = new Player(
                    context,
                    loc,
                    player.colour,
                    spriteSheet,                    
                )
                console.log("updating player "+player.playerNo);
                players[player.playerNo].update(loc, player.facing, now);
            }
            players[player.playerNo].draw();
        }

            /*
        for (const player of gameBoard.players){
            let sheet = null;
            const loc = {x:(player.location.x+2)*blockWidth,y:(player.location.y+1)*blockHeight};
            if (player.colour === "red"){
                sheet = redSprite;
            } else if (player.colour === "yellow"){
                sheet = yellowSprite;
            } else if (player.colour === "black"){
                sheet = blackSprite;
            } else if (player.colour === "blue"){
                sheet = blueSprite;
            }

            if (player.facing === "down"){
                context.drawImage(sheet,0,0,16,16,loc.x,loc.y,16,16);
            } else if (player.facing === "up"){
                context.drawImage(sheet,3*16,0,16,16,loc.x,loc.y,16,16);
            } else if (player.facing === "left"){
                context.drawImage(sheet,32,16,16,16,loc.x,loc.y,16,16);
            } else if (player.facing === "right"){
                context.drawImage(sheet,48,16,16,16,loc.x,loc.y,16,16);
            }
        }*/


        //context.drawImage(spriteSheet,sheet.x,sheet.y,sheet width (px),sheet.height, canvas.x, canvas.y, canvas.width, canvas.height)

        /*
        for (const player of gameBoard.players){
            const loc = {x:(player.location.x+2)*blockWidth,y:(player.location.y+1)*blockHeight};
            if (player.colour === "blue"){
                if (player.facing === "up"){
                    context.drawImage(blueIMG,loc.x,loc.y);
                } else if (player.facing === "down"){
                    context.drawImage(blueIMG,loc.x,loc.y);
                } else if (player.facing === "left"){
                    context.drawImage(blueIMG,loc.x,loc.y);
                } else if (player.facing === "right"){
                    context.drawImage(blueIMG,loc.x,loc.y);
                }
            } else if (player.colour === "red"){
                if (player.facing === "up"){
                    context.drawImage(redIMG,loc.x,loc.y);
                } else if (player.facing === "down"){
                    context.drawImage(redIMG,loc.x,loc.y);
                } else if (player.facing === "left"){
                    context.drawImage(redIMG,loc.x,loc.y);
                } else if (player.facing === "right"){
                    context.drawImage(redIMG,loc.x,loc.y);
                }
            } else if (player.colour === "yellow"){
                if (player.facing === "up"){
                    context.drawImage(yellowIMG,loc.x,loc.y);
                } else if (player.facing === "down"){
                    context.drawImage(yellowIMG,loc.x,loc.y);
                } else if (player.facing === "left"){
                    context.drawImage(yellowIMG,loc.x,loc.y);
                } else if (player.facing === "right"){
                    context.drawImage(yellowIMG,loc.x,loc.y);
                }
            } else if (player.colour === "black"){
                if (player.facing === "up"){
                    context.drawImage(blackIMG,loc.x,loc.y);
                } else if (player.facing === "down"){
                    context.drawImage(blackIMG,loc.x,loc.y);
                } else if (player.facing === "left"){
                    context.drawImage(blackIMG,loc.x,loc.y);
                } else if (player.facing === "right"){
                    context.drawImage(blackIMG,loc.x,loc.y);
                }
            }
        }*/

        for (const bomb of gameBoard.bombs){
            if (bomb){
                const loc = {x:(bomb.x+2)*blockWidth,y:(bomb.y+1)*blockHeight};
                context.drawImage(spritesheet,128,48,16,16,loc.x,loc.y,16,16);
            }
        }

        if (gameBoard.coins){
            for (const coin of gameBoard.coins){
                const loc = {x:(coin.x+2)*blockWidth,y:(coin.y+1)*blockHeight};
                context.drawImage(spritesheet,12*16,32,16,16,loc.x,loc.y,16,16);
            }
        }

        if (gameBoard.hearts){
            for (const heart of gameBoard.hearts){
                const loc = {x:(heart.x+2)*blockWidth,y:(heart.y+1)*blockHeight};
                context.drawImage(spritesheet,0,16,16,16,loc.x,loc.y,16,16);
            }
        }

        
        fires = fires.filter(obj => (now - obj.startTime) <= 2400);


        console.log("fires list: "+JSON.stringify(fires));

        for(let i = 0; i < fires.length; i++) {
            console.log(fires[i]);
            fires[i].fire.update(now);
            fires[i].fire.draw();
        }

        console.log("fires list: "+JSON.stringify(fires));

        if(repeat == true) {
            setTimeout(updateBoard(lastGameBoard, false), 150);
        }
    };

    explodeBomb = function (points) {
        console.log("Exploding bomb");
        console.log("points:", points);
        const now = new Date().getTime();

        const loc = {x:(points.loc.x+2)*blockWidth,y:(points.loc.y+1)*blockHeight};
        fires.push({fire: new Fire(context, loc, spritesheet), startTime: now})

        for (const fire of points.fires) {
            const loc = {x: (fire.x + 2) * blockWidth, y: (fire.y + 1) * blockHeight};
            fires.push({fire: new Fire(context, loc, spritesheet), startTime: now});
          }
    };

    return { setInputEnabled, updateBoard, explodeBomb};
};
