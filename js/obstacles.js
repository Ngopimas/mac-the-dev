/**
 * Game obstacles that the player must avoid or interact with
 */

class Obstacle extends Sprite {
  /**
   * Create a new obstacle
   * @param {Object} options - Obstacle options
   * @param {string} [options.type="bug"] - Obstacle type: "bug", "mergeConflict", "meeting", or "technicalDebt"
   * @param {number} [options.speed=300] - Obstacle movement speed in pixels per second
   * @param {number} [options.x=800] - Initial x position
   * @param {number} [options.y=0] - Initial y position
   */
  constructor(options) {
    const type = options.type || "bug";
    let spriteImage, width, height;

    // Set properties based on obstacle type
    switch (type) {
      case "bug":
        spriteImage = Assets.images.obstacles.bug;
        width = 40;
        height = 40;
        break;
      case "mergeConflict":
        spriteImage = Assets.images.obstacles.mergeConflict;
        width = 60;
        height = 60;
        break;
      case "meeting":
        spriteImage = Assets.images.obstacles.meeting;
        width = 80;
        height = 40;
        break;
      case "technicalDebt":
        spriteImage = Assets.images.obstacles.technicalDebt;
        width = 50;
        height = 70;
        break;
      default:
        spriteImage = Assets.images.obstacles.bug;
        width = 40;
        height = 40;
    }

    super({
      image: spriteImage,
      x: options.x || 800,
      y: options.y || 0,
      width: width,
      height: height,
    });

    this.type = type;
    this.velocityX = -(options.speed || 300);

    // Adjust collision box to be slightly smaller than sprite
    this.collisionBox = {
      x: this.x + 5,
      y: this.y + 5,
      width: this.width - 10,
      height: this.height - 10,
    };

    this.setupSpecialProperties();
    this.emoji = this.getObstacleEmoji();
  }

  /**
   * Initializes type-specific properties for obstacle behavior
   */
  setupSpecialProperties() {
    switch (this.type) {
      case "bug":
        // Bugs can move up and down
        this.oscillateSpeed = 2;
        this.oscillateRange = 20;
        this.initialY = this.y;
        this.oscillateOffset = Math.random() * Math.PI * 2; // Random starting phase
        break;

      case "mergeConflict":
        // Merge conflicts are stationary but larger
        break;

      case "meeting":
        // Meetings slow down the player on collision
        break;

      case "technicalDebt":
        // Technical debt grows over time
        this.growthRate = 0.05;
        this.maxGrowth = 1.5;
        this.currentGrowth = 1;
        break;
    }
  }

  /**
   * Updates obstacle position and applies type-specific behaviors
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime) {
    // Update position based on velocity
    this.x += this.velocityX * (deltaTime / 1000);

    // Apply special behaviors based on obstacle type
    switch (this.type) {
      case "bug":
        // Oscillate up and down
        this.y =
          this.initialY +
          Math.sin(
            (Date.now() / 1000) * this.oscillateSpeed + this.oscillateOffset
          ) *
            this.oscillateRange;
        break;

      case "technicalDebt":
        // Grow over time
        if (this.currentGrowth < this.maxGrowth) {
          this.currentGrowth += this.growthRate * (deltaTime / 1000);

          // Update size
          const growthFactor = this.currentGrowth;
          this.width = 50 * growthFactor;
          this.height = 70 * growthFactor;
        }
        break;
    }

    this.updateCollisionBox();

    // Remove if off screen
    if (this.x < -this.width) {
      this.isActive = false;
    }
  }

  /**
   * Synchronizes collision box with current obstacle position and size
   */
  updateCollisionBox() {
    this.collisionBox.x = this.x + 5;
    this.collisionBox.y = this.y + 5;
    this.collisionBox.width = this.width - 10;
    this.collisionBox.height = this.height - 10;
  }

  /**
   * Applies type-specific effects when player collides with this obstacle
   * @param {Player} player - The player that collided with this obstacle
   */
  applyEffect(player) {
    switch (this.type) {
      case "bug":
      case "technicalDebt":
        // These obstacles crash the player
        player.crash();
        break;

      case "mergeConflict":
        // Merge conflicts now slow down the player (more than meetings)
        if (!player.invincible) {
          player.speedBoost = -150; // Stronger negative boost = more slowdown
          player.state.hasSpeedBoost = true;
          player.speedBoostDuration = 3000; // 3 seconds of slowdown

          // Make the merge conflict disappear
          this.isActive = false;
        }
        break;

      case "meeting":
        // Meetings slow down the player
        if (!player.invincible) {
          player.speedBoost = -100; // Negative boost = slowdown
          player.state.hasSpeedBoost = true;
          player.speedBoostDuration = 2000; // 2 seconds of slowdown

          // Make the meeting disappear
          this.isActive = false;
        }
        break;
    }
  }

  /**
   * Returns the appropriate emoji for the current obstacle type
   * @returns {string} Emoji character representing this obstacle
   */
  getObstacleEmoji() {
    switch (this.type) {
      case "bug":
        return "🐛";
      case "mergeConflict":
        return "⚠️";
      case "meeting":
        return "👥";
      case "technicalDebt":
        return "🧶";
      default:
        return "❓";
    }
  }

  /**
   * Renders the obstacle with its emoji and optional debug information
   * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
   */
  draw(ctx) {
    if (!this.isVisible) return;

    // Draw the obstacle
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

    // Draw emoji on top of the obstacle
    ctx.font = `${Math.min(this.width, this.height) * 0.6}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.emoji, this.x + this.width / 2, this.y + this.height / 2);

    // Debug: draw collision box
    if (window.DEBUG_MODE) {
      ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
      ctx.strokeRect(
        this.collisionBox.x,
        this.collisionBox.y,
        this.collisionBox.width,
        this.collisionBox.height
      );
    }
  }
}

/**
 * Factory for creating different types of game obstacles
 */
const ObstacleFactory = {
  /**
   * Creates a random obstacle with appropriate positioning
   * @param {number} speed - Base movement speed for the obstacle
   * @param {number} groundY - Y position of the ground level
   * @returns {Obstacle} A randomly selected obstacle instance
   */
  createRandom: function (speed, groundY) {
    const types = ["bug", "mergeConflict", "meeting", "technicalDebt"];
    const type = types[Utils.randomInt(0, types.length - 1)];

    return this.create(type, speed, groundY);
  },

  /**
   * Creates a specific type of obstacle with appropriate positioning
   * @param {string} type - Obstacle type to create
   * @param {number} speed - Base movement speed for the obstacle
   * @param {number} groundY - Y position of the ground level
   * @returns {Obstacle} The created obstacle instance
   */
  create: function (type, speed, groundY) {
    let y;

    switch (type) {
      case "bug":
        // Bugs can be at various heights
        y = groundY - Utils.randomInt(40, 120);
        break;

      case "mergeConflict":
        // Merge conflicts are on the ground
        y = groundY - 60;
        break;

      case "meeting":
        // Meetings are on the ground
        y = groundY - 40;
        break;

      case "technicalDebt":
        // Technical debt starts small and grows
        y = groundY - 70;
        break;

      default:
        y = groundY - 40;
    }

    return new Obstacle({
      type: type,
      speed: speed,
      x: 800,
      y: y,
    });
  },
};
