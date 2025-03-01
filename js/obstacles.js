/**
 * Obstacles for Sonic the Developer game
 */

class Obstacle extends Sprite {
  /**
   * Create a new obstacle
   * @param {Object} options - Obstacle options
   * @param {string} options.type - Obstacle type
   * @param {number} options.speed - Obstacle speed
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

    // Special properties for different obstacle types
    this.setupSpecialProperties();
  }

  /**
   * Set up special properties based on obstacle type
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
   * Update obstacle position and special behaviors
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    super.update(deltaTime);

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

          // Update collision box
          this.updateCollisionBox();
        }
        break;
    }

    // Remove if off screen
    if (this.x < -this.width) {
      this.isActive = false;
    }
  }

  /**
   * Update collision box position and size
   */
  updateCollisionBox() {
    this.collisionBox.x = this.x + 5;
    this.collisionBox.y = this.y + 5;
    this.collisionBox.width = this.width - 10;
    this.collisionBox.height = this.height - 10;
  }

  /**
   * Apply effect when player collides with this obstacle
   * @param {Player} player - Player object
   */
  applyEffect(player) {
    switch (this.type) {
      case "bug":
      case "mergeConflict":
      case "technicalDebt":
        // These obstacles crash the player
        player.crash();
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
}

/**
 * Obstacle factory for creating different types of obstacles
 */
const ObstacleFactory = {
  /**
   * Create a random obstacle
   * @param {number} speed - Base speed for the obstacle
   * @param {number} groundY - Y position of the ground
   * @returns {Obstacle} - New obstacle instance
   */
  createRandom: function (speed, groundY) {
    const types = ["bug", "mergeConflict", "meeting", "technicalDebt"];
    const type = types[Utils.randomInt(0, types.length - 1)];

    return this.create(type, speed, groundY);
  },

  /**
   * Create a specific type of obstacle
   * @param {string} type - Obstacle type
   * @param {number} speed - Base speed for the obstacle
   * @param {number} groundY - Y position of the ground
   * @returns {Obstacle} - New obstacle instance
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
