// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
// - `color` - The colour of the gem
const Fire = function(ctx, loc, spriteSheet) {

    // This is the sprite sequences of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = {
        fire:  { x: 0, y:  160, width: 16, height: 16, count: 8, timing: 140, loop: false },
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, loc.x, loc.y, spriteSheet);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences["fire"])
          .setScale(1)
          .setShadowScale({ x: 0.75, y: 0.2 })
          .useSpriteImg(spriteSheet);

    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};
