/**
 * Collectibles for Sonic the Developer game
 */

class Collectible extends Sprite {
  /**
   * Create a new collectible
   * @param {Object} options - Collectible options
   * @param {string} options.type - Collectible type
   * @param {number} options.speed - Collectible speed
   */
  constructor(options) {
    const type = options.type || "codeSnippet";
    let spriteImage, width, height;

    // Set properties based on collectible type
    switch (type) {
      case "coffee":
        spriteImage = Assets.images.collectibles.coffee;
        width = 30;
        height = 30;
        break;
      case "stackOverflow":
        spriteImage = Assets.images.collectibles.stackOverflow;
        width = 30;
        height = 30;
        break;
      case "gitCommit":
        spriteImage = Assets.images.collectibles.gitCommit;
        width = 30;
        height = 30;
        break;
      case "codeSnippet":
        spriteImage = Assets.images.collectibles.codeSnippet;
        width = 20;
        height = 20;
        break;
      default:
        spriteImage = Assets.images.collectibles.codeSnippet;
        width = 20;
        height = 20;
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

    // Special properties for different collectible types
    this.setupSpecialProperties();
  }

  /**
   * Set up special properties based on collectible type
   */
  setupSpecialProperties() {
    switch (this.type) {
      case "coffee":
        // Coffee bobs up and down
        this.oscillateSpeed = 3;
        this.oscillateRange = 10;
        this.initialY = this.y;
        this.oscillateOffset = Math.random() * Math.PI * 2; // Random starting phase
        break;

      case "stackOverflow":
        // Stack Overflow answers pulse
        this.pulseSpeed = 2;
        this.pulseRange = 0.2;
        this.initialScale = 1;
        break;

      case "gitCommit":
        // Git commits rotate
        this.rotationSpeed = 1;
        this.rotation = 0;
        break;

      case "codeSnippet":
        // Code snippets sparkle
        this.sparkleTimer = 0;
        this.sparkleInterval = 500;
        this.isSparkle = false;
        break;
    }
  }

  /**
   * Update collectible position and special behaviors
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    super.update(deltaTime);

    // Apply special behaviors based on collectible type
    switch (this.type) {
      case "coffee":
        // Oscillate up and down
        this.y =
          this.initialY +
          Math.sin(
            (Date.now() / 1000) * this.oscillateSpeed + this.oscillateOffset
          ) *
            this.oscillateRange;
        break;

      case "stackOverflow":
        // Pulse size
        const pulseFactor =
          1 + Math.sin((Date.now() / 1000) * this.pulseSpeed) * this.pulseRange;
        this.width = 30 * pulseFactor;
        this.height = 30 * pulseFactor;
        this.updateCollisionBox();
        break;

      case "gitCommit":
        // Rotate (visual effect only, not implemented in this simple version)
        this.rotation += this.rotationSpeed * (deltaTime / 1000);
        break;

      case "codeSnippet":
        // Sparkle effect (toggle visibility briefly)
        this.sparkleTimer += deltaTime;
        if (this.sparkleTimer >= this.sparkleInterval) {
          this.isSparkle = !this.isSparkle;
          this.sparkleTimer = 0;
          this.isVisible = !this.isSparkle || Math.random() > 0.5;
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
   * Apply effect when player collects this item
   * @param {Player} player - Player object
   */
  applyEffect(player) {
    switch (this.type) {
      case "coffee":
        player.collectCoffee();
        break;

      case "stackOverflow":
        player.collectStackOverflow();
        break;

      case "gitCommit":
        player.collectGitCommit();
        break;

      case "codeSnippet":
        player.collectCodeSnippet();
        break;
    }

    // Deactivate the collectible after it's collected
    this.isActive = false;
  }
}

/**
 * Collectible factory for creating different types of collectibles
 */
const CollectibleFactory = {
  /**
   * Create a random collectible
   * @param {number} speed - Base speed for the collectible
   * @param {number} groundY - Y position of the ground
   * @returns {Collectible} - New collectible instance
   */
  createRandom: function (speed, groundY) {
    // Weighted random selection
    const rand = Math.random();
    let type;

    if (rand < 0.6) {
      // 60% chance for code snippets
      type = "codeSnippet";
    } else if (rand < 0.85) {
      // 25% chance for coffee
      type = "coffee";
    } else if (rand < 0.95) {
      // 10% chance for Stack Overflow
      type = "stackOverflow";
    } else {
      // 5% chance for Git commit
      type = "gitCommit";
    }

    return this.create(type, speed, groundY);
  },

  /**
   * Create a specific type of collectible
   * @param {string} type - Collectible type
   * @param {number} speed - Base speed for the collectible
   * @param {number} groundY - Y position of the ground
   * @returns {Collectible} - New collectible instance
   */
  create: function (type, speed, groundY) {
    let y;

    switch (type) {
      case "coffee":
        // Coffee can be at various heights
        y = groundY - Utils.randomInt(50, 150);
        break;

      case "stackOverflow":
        // Stack Overflow answers are higher up
        y = groundY - Utils.randomInt(100, 200);
        break;

      case "gitCommit":
        // Git commits are at medium height
        y = groundY - Utils.randomInt(80, 120);
        break;

      case "codeSnippet":
        // Code snippets can be anywhere
        y = groundY - Utils.randomInt(30, 180);
        break;

      default:
        y = groundY - 100;
    }

    return new Collectible({
      type: type,
      speed: speed,
      x: 800,
      y: y,
    });
  },

  /**
   * Create a row of code snippets
   * @param {number} speed - Base speed for the collectibles
   * @param {number} groundY - Y position of the ground
   * @param {number} count - Number of snippets in the row
   * @param {number} startX - Starting X position
   * @param {number} y - Y position for the row
   * @returns {Array} - Array of collectible instances
   */
  createCodeSnippetRow: function (speed, groundY, count, startX, y) {
    const snippets = [];
    const spacing = 40;

    for (let i = 0; i < count; i++) {
      snippets.push(
        new Collectible({
          type: "codeSnippet",
          speed: speed,
          x: startX + i * spacing,
          y: y || groundY - 100,
        })
      );
    }

    return snippets;
  },
};
