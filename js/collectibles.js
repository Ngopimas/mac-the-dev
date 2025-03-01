/**
 * Game collectible items with different behaviors and effects
 */

class Collectible extends Sprite {
  /**
   * Create a new collectible
   * @param {Object} options - Collectible options
   * @param {string} options.type - Type of collectible (coffee, stackOverflow, gitCommit, codeSnippet)
   * @param {number} options.speed - Horizontal movement speed
   * @param {number} [options.x=800] - Initial x position
   * @param {number} [options.y=0] - Initial y position
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

    // Set emoji based on collectible type
    this.emoji = this.getCollectibleEmoji();
  }

  /**
   * Initialize special movement and visual properties based on collectible type
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
        // Code snippets no longer sparkle
        // No special properties needed
        break;
    }
  }

  /**
   * Update collectible position and special behaviors
   * @param {number} deltaTime - Time since last update in milliseconds
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

  /**
   * Get the emoji for this collectible type
   * @returns {string} - Emoji character
   */
  getCollectibleEmoji() {
    switch (this.type) {
      case "coffee":
        return "☕";
      case "stackOverflow":
        return "🛡️";
      case "gitCommit":
        return "📌";
      case "codeSnippet":
        return "💻";
      default:
        return "❓";
    }
  }

  /**
   * Draw the collectible with special effects
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    ctx.save();

    // Apply rotation for git commits
    if (this.type === "gitCommit" && this.rotation) {
      ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
      ctx.rotate(this.rotation);
      ctx.drawImage(
        this.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      // Draw emoji with rotation
      ctx.font = `${Math.min(this.width, this.height) * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.emoji, 0, 0);
    } else {
      // Normal drawing for other collectibles
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

      // Draw emoji on top of the collectible
      ctx.font = `${Math.min(this.width, this.height) * 0.6}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        this.emoji,
        this.x + this.width / 2,
        this.y + this.height / 2
      );
    }

    ctx.restore();

    // Debug: draw collision box
    if (window.DEBUG_MODE) {
      ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
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
 * Factory for creating different types of collectibles with appropriate positioning
 */
const CollectibleFactory = {
  /**
   * Create a random collectible with weighted probability
   * @param {number} speed - Base speed for the collectible
   * @param {number} groundY - Y position of the ground
   * @returns {Collectible} - New collectible instance
   */
  createRandom: function (speed, groundY) {
    const rand = Math.random();
    let type;

    if (rand < 0.6) {
      type = "codeSnippet"; // 60% chance
    } else if (rand < 0.85) {
      type = "coffee"; // 25% chance
    } else if (rand < 0.95) {
      type = "stackOverflow"; // 10% chance
    } else {
      type = "gitCommit"; // 5% chance
    }

    return this.create(type, speed, groundY);
  },

  /**
   * Create a specific type of collectible with appropriate vertical positioning
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
   * Create a horizontal row of code snippets with even spacing
   * @param {number} speed - Base speed for the collectibles
   * @param {number} groundY - Y position of the ground
   * @param {number} count - Number of snippets to create
   * @param {number} startX - Starting X position
   * @param {number} y - Y position for the row (optional)
   * @returns {Collectible[]} - Array of collectibles
   */
  createCodeSnippetRow: function (speed, groundY, count, startX, y) {
    const snippets = [];
    const spacing = 40;

    for (let i = 0; i < count; i++) {
      const snippet = new Collectible({
        type: "codeSnippet",
        speed: speed,
        x: startX + i * spacing,
        y: y || groundY - 100,
      });
      snippets.push(snippet);
    }

    return snippets;
  },
};
