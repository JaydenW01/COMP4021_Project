// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function(ctx, loc, colour, spriteSheet) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.

    const playerIMG = null;
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { x: 16, y: 16, width: 16, height: 16, count: 1, timing: 2000, loop: false },
        idleUp:    { x: 64, y: 0,  width: 16, height: 16, count: 1, timing: 2000, loop: false },
        idleRight: { x: 64, y: 16, width: 16, height: 16, count: 1, timing: 2000, loop: false },
        idleDown:  { x: 16, y: 0,  width: 16, height: 16, count: 1, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 0,  y: 16, width: 16, height: 16, count: 3, timing: 290, loop: true },
        moveUp:    { x: 48, y: 0,  width: 16, height: 16, count: 3, timing: 290, loop: true },
        moveRight: { x: 48, y: 16, width: 16, height: 16, count: 3, timing: 290, loop: true },
        moveDown:  { x: 0,  y: 0,  width: 16, height: 16, count: 3, timing: 290, loop: true }
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, loc.x, loc.y, spriteSheet);
    let position = {x:0, y:0};
    let facing = "down";
    let oldFacing = "down";
    let idle = 0;

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
          .setScale(1)
          .setShadowScale({ x: 0, y: 0 })
    
    sprite.useSpriteImg(spriteSheet);

    /*
    switch(color) {
        case("blue"):
            img = blueIMG;
            break;
        case("red"):
            sprite.useSheet("../assets/red_sprite.png");
            break;
        case("yellow"):
            sprite.useSheet("../assets/yellow_sprite.png");
            break;
        case("black"):
            sprite.useSheet("../assets/black_sprite.png");
            break;
    }*/

    /*
    const setPosition = function(newPosition) {
        if (facing != oldFacing) {
            console.log("Player changed facing, changing sequence ", oldFacing, facing)
            switch(facing) {
                case "left":
                    sprite.setSequence(sequences.moveLeft);
                    break;
                case "up":
                    sprite.setSequence(sequences.moveUp);
                    break;
                case "right":
                    sprite.setSequence(sequences.moveRight);
                    break;
                case "down":
                    sprite.setSequence(sequences.moveDown);
                    break;
                default:

            }
        }

        position = newPosition;
        sprite.setXY(position.x, position.y);
    }*/
    const setPosition = (newPosition, time) => {
        console.log("[player] setPosition: ", position, newPosition)
        if (JSON.stringify(position) == JSON.stringify(newPosition)) {
            console.log("[player] setPosition: ", colour, "position no change")
            if (time - idle > 1200) {
                console.log("[player] Player idle, changing sequence ", oldFacing, facing)
                switch(facing) {
                    case "left":
                        sprite.setSequence(sequences.idleLeft);
                        break;
                    case "up":
                        sprite.setSequence(sequences.idleUp);
                        break;
                    case "right":
                        sprite.setSequence(sequences.idleRight);
                        break;
                    case "down":
                        sprite.setSequence(sequences.idleDown);
                        break;
                    default:
                        break;
                }
            }
        } else {
            idle = time;
            console.log("[player] setPosition: ", colour, "idle", idle)
            if (facing != oldFacing) {
                console.log("[player] Player changed facing, changing sequence ", oldFacing, facing)
                switch(facing) {
                    case "left":
                        sprite.setSequence(sequences.moveLeft);
                        break;
                    case "up":
                        sprite.setSequence(sequences.moveUp);
                        break;
                    case "right":
                        sprite.setSequence(sequences.moveRight);
                        break;
                    case "down":
                        sprite.setSequence(sequences.moveDown);
                        break;
                    default:
                        break;
                }
            }
        }

        position = newPosition;
        sprite.setXY(position.x, position.y);
    }

    /*
    const setFacing = function(newFacing) {
        oldFacing = facing;
        facing = newFacing;
        console.log("Set facing done ", oldFacing, facing)
    }*/
    const setFacing = (newFacing) => {
        oldFacing = facing;
        facing = newFacing;
        console.log("[player] Set facing done ", oldFacing, facing)
    }

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    /*
    const update = function(newPosition, newFacing, time) {
        console.log("Player update: ", oldFacing, facing)
        this.setFacing(newFacing);
        this.setPosition(newPosition)
        sprite.update(time);
    };*/
    const update = (newPosition, newFacing, time) => {
        console.log("[player] update: oldFacing = ", oldFacing);
        console.log("[player] update: facing = ", facing);
        console.log("[player] update: newPosition = ", newPosition);
        console.log("[player] update: newFacing = ", newFacing);
        console.log("[player] update: time = ", time);
        setFacing(newFacing);
        setPosition(newPosition, time);
        sprite.update(time);
    };

    const draw = ()=>{
        ctx.drawImage(playerIMG,position.x,position.y)
    }

    // The methods are returned as an object here.
    return {
        setFacing: setFacing,
        setPosition: setPosition,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update
    };
};
