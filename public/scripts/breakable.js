// This function defines the Gem module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the gem
// - `y` - The initial y position of the gem
// - `color` - The colour of the gem
const Breakable = function(ctx, x, y) {

    // This is the sprite sequences of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = {
        default:  { x: 0, y:  0, width: 16, height: 16, count: 1, timing: 200, loop: false },
    };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences["default"])
          .setScale(1)
          .setShadowScale({ x: 0, y: 0 })
          .useSheet("breakable.png");

    // The methods are returned as an object here.
    return {
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update
    };
};
