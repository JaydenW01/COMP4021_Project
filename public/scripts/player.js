// This function defines the Player module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the player
// - `y` - The initial y position of the player
// - `gameArea` - The bounding box of the game area
const Player = function(ctx, x, y, color) {

    // This is the sprite sequences of the player facing different directions.
    // It contains the idling sprite sequences `idleLeft`, `idleUp`, `idleRight` and `idleDown`,
    // and the moving sprite sequences `moveLeft`, `moveUp`, `moveRight` and `moveDown`.
    const sequences = {
        /* Idling sprite sequences for facing different directions */
        idleLeft:  { x: 16, y: 24, width: 16, height: 24, count: 1, timing: 2000, loop: false },
        idleUp:    { x: 64, y: 0,  width: 16, height: 24, count: 1, timing: 2000, loop: false },
        idleRight: { x: 64, y: 24, width: 16, height: 24, count: 1, timing: 2000, loop: false },
        idleDown:  { x: 16, y: 0,  width: 16, height: 24, count: 1, timing: 2000, loop: false },

        /* Moving sprite sequences for facing different directions */
        moveLeft:  { x: 0,  y: 24, width: 16, height: 24, count: 3, timing: 50, loop: true },
        moveUp:    { x: 48, y: 0,  width: 16, height: 24, count: 3, timing: 50, loop: true },
        moveRight: { x: 48, y: 24, width: 16, height: 24, count: 3, timing: 50, loop: true },
        moveDown:  { x: 0,  y: 0,  width: 16, height: 24, count: 3, timing: 50, loop: true }
    };

    // This is the sprite object of the player created from the Sprite module.
    const sprite = Sprite(ctx, x, y);
    let position = {x:0, y:0};
    let facing = "down";

    // The sprite object is configured for the player sprite here.
    sprite.setSequence(sequences.idleDown)
          .setScale(0.5)
          .setShadowScale({ x: 0, y: 0 })
    
    switch(color) {
        case("blue"):
            sprite.useSheet("../assets/blue_sprite.png");
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
    }

    const setPosition = function(newPosition) {
        if (position == newPosition) {
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
                    /* */
            }
        } else {
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
                        /* */
            }
        }
        position = newPosition;
        sprite.setXY(position.x, position.y);
    }

    const setFacing = function(newFacing) {
        facing = newFacing;
    }

    // This function updates the player depending on his movement.
    // - `time` - The timestamp when this function is called
    const update = function(newPosition, newFacing, time) {
        this.setFacing(newFacing);
        this.setPosition(newPosition)
        sprite.update(time);
    };

    // The methods are returned as an object here.
    return {
        setFacing: setFacing,
        setPosition: setPosition,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: update
    };
};
