/**
 * Sprite management for Mac the Developer game
 */

class Sprite {
  /**
   * Create a new sprite
   * @param {Object} options - Sprite options
   * @param {HTMLCanvasElement|HTMLImageElement} options.image - Sprite image
   * @param {number} options.x - X position
   * @param {number} options.y - Y position
   * @param {number} options.width - Sprite width
   * @param {number} options.height - Sprite height
   * @param {number} options.frameX - Current frame X in spritesheet (default 0)
   * @param {number} options.frameY - Current frame Y in spritesheet (default 0)
   * @param {number} options.frameWidth - Width of a single frame (default: image width)
   * @param {number} options.frameHeight - Height of a single frame (default: image height)
   * @param {number} options.frameCount - Number of animation frames (default 1)
   * @param {number} options.frameDelay - Delay between frames in ms (default 100)
   */
  constructor(options) {
    this.image = options.image;
    this.x = options.x || 0;
    this.y = options.y || 0;
    this.width = options.width || this.image.width;
    this.height = options.height || this.image.height;

    // Animation properties
    this.frameX = options.frameX || 0;
    this.frameY = options.frameY || 0;
    this.frameWidth = options.frameWidth || this.image.width;
    this.frameHeight = options.frameHeight || this.image.height;
    this.frameCount = options.frameCount || 1;
    this.frameDelay = options.frameDelay || 100;

    // Animation state
    this.currentFrame = 0;
    this.frameTimer = 0;
    this.isAnimating = this.frameCount > 1;

    // Physics properties
    this.velocityX = 0;
    this.velocityY = 0;
    this.gravity = 0;

    // Collision properties
    this.collisionBox = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };

    // Flags
    this.isActive = true;
    this.isVisible = true;
  }

  /**
   * Update sprite position and animation
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    if (!this.isActive) return;

    // Update position
    this.x += this.velocityX * (deltaTime / 1000);
    this.y += this.velocityY * (deltaTime / 1000);

    // Apply gravity
    if (this.gravity) {
      this.velocityY += this.gravity * (deltaTime / 1000);
    }

    // Update collision box
    this.updateCollisionBox();

    // Update animation
    if (this.isAnimating) {
      this.frameTimer += deltaTime;

      if (this.frameTimer >= this.frameDelay) {
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;
        this.frameTimer = 0;
      }

      this.frameX = this.currentFrame;
    }
  }

  /**
   * Draw sprite on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    if (!this.isVisible) return;

    // For simple sprites (no animation)
    if (this.frameCount <= 1) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      // For animated sprites (spritesheet)
      ctx.drawImage(
        this.image,
        this.frameX * this.frameWidth,
        this.frameY * this.frameHeight,
        this.frameWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }

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

  /**
   * Update collision box position
   */
  updateCollisionBox() {
    this.collisionBox.x = this.x;
    this.collisionBox.y = this.y;
  }

  /**
   * Check if this sprite is colliding with another sprite
   * @param {Sprite} otherSprite - Sprite to check collision with
   * @returns {boolean} - True if colliding, false otherwise
   */
  isCollidingWith(otherSprite) {
    return Utils.checkCollision(this.collisionBox, otherSprite.collisionBox);
  }

  /**
   * Set sprite position
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.updateCollisionBox();
  }

  /**
   * Set sprite velocity
   * @param {number} vx - X velocity
   * @param {number} vy - Y velocity
   */
  setVelocity(vx, vy) {
    this.velocityX = vx;
    this.velocityY = vy;
  }

  /**
   * Reset sprite animation
   */
  resetAnimation() {
    this.currentFrame = 0;
    this.frameTimer = 0;
  }
}

/**
 * Background sprite that can be parallax scrolled
 * @extends Sprite
 */
class BackgroundSprite extends Sprite {
  /**
   * Create a new background sprite
   * @param {Object} options - Sprite options
   * @param {number} options.scrollSpeed - Scroll speed multiplier
   */
  constructor(options) {
    super(options);
    this.scrollSpeed = options.scrollSpeed || 1;
    this.initialX = this.x;
  }

  /**
   * Update background position for parallax scrolling
   * @param {number} deltaTime - Time since last update in ms
   * @param {number} gameSpeed - Current game speed
   */
  updateParallax(deltaTime, gameSpeed) {
    // Move background based on game speed and scroll speed
    this.x -= gameSpeed * this.scrollSpeed * (deltaTime / 1000);

    // If the background has scrolled off screen, reset it
    if (this.x <= -this.width) {
      this.x = this.initialX;
    }
  }

  /**
   * Update method to match the interface used in level.js
   * @param {number} deltaTime - Time since last update in ms
   * @param {number} gameSpeed - Current game speed
   */
  update(deltaTime, gameSpeed) {
    this.updateParallax(deltaTime, gameSpeed);
  }

  /**
   * Draw repeating background
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} canvasWidth - Canvas width
   */
  drawRepeating(ctx, canvasWidth) {
    if (!this.isVisible) return;

    // Draw first instance
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);

    // Draw second instance to create seamless scrolling
    ctx.drawImage(
      this.image,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );

    // Draw third instance if needed (for wider screens or fast scrolling)
    if (canvasWidth > this.width * 2 || this.scrollSpeed > 0.5) {
      ctx.drawImage(
        this.image,
        this.x + this.width * 2,
        this.y,
        this.width,
        this.height
      );
    }
  }
}
