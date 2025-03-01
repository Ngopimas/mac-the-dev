/**
 * Player character for Sonic the Developer game
 */

class Player extends Sprite {
  /**
   * Create a new player character
   * @param {Object} options - Player options
   * @param {number} options.groundY - Y position of the ground
   */
  constructor(options) {
    super({
      image: Assets.images.player.run,
      x: 100,
      y: options.groundY - 50, // Position player on the ground
      width: 50,
      height: 50,
    });

    // Player state
    this.state = {
      isRunning: true,
      isJumping: false,
      isDoubleJumping: false,
      isSliding: false,
      isCrashed: false,
      hasSpeedBoost: false,
    };

    // Player properties
    this.groundY = options.groundY;
    this.jumpForce = -600;
    this.gravity = 1200;
    this.baseSpeed = 300;
    this.speedBoost = 0;
    this.speedBoostDuration = 0;
    this.invincible = false;
    this.invincibilityDuration = 0;

    // Collectibles
    this.score = 0;
    this.coffeeCount = 0;
    this.codeSnippets = 0;
    this.gitCommits = 0;

    // Adjust collision box to be slightly smaller than sprite
    this.collisionBox = {
      x: this.x + 10,
      y: this.y + 5,
      width: this.width - 20,
      height: this.height - 10,
    };
  }

  /**
   * Update player state and position
   * @param {number} deltaTime - Time since last update in ms
   * @param {Object} input - Input state
   */
  update(deltaTime) {
    if (this.state.isCrashed) {
      // Only update position if crashed (falling)
      super.update(deltaTime);

      // Check if player has fallen off screen
      if (this.y > this.groundY + 200) {
        this.isActive = false;
      }

      return;
    }

    // Update speed boost
    if (this.state.hasSpeedBoost) {
      this.speedBoostDuration -= deltaTime;

      if (this.speedBoostDuration <= 0) {
        this.state.hasSpeedBoost = false;
        this.speedBoost = 0;
      }
    }

    // Update invincibility
    if (this.invincible) {
      this.invincibilityDuration -= deltaTime;

      if (this.invincibilityDuration <= 0) {
        this.invincible = false;
      }
    }

    // Apply gravity and update position
    super.update(deltaTime);

    // Check if player has landed after jumping
    if (this.state.isJumping && this.y >= this.groundY - this.height) {
      this.land();
    }

    // Ensure player doesn't fall through the ground
    if (this.y > this.groundY - this.height) {
      this.y = this.groundY - this.height;
      this.velocityY = 0;
    }

    // Update sprite image based on state
    this.updateSprite();

    // Always update collision box
    this.updateCollisionBox();
  }

  /**
   * Update collision box position
   */
  updateCollisionBox() {
    // Adjust collision box based on player state
    if (this.state.isSliding) {
      this.collisionBox.x = this.x + 10;
      this.collisionBox.y = this.y + 20;
      this.collisionBox.width = this.width - 20;
      this.collisionBox.height = this.height - 25;
    } else {
      this.collisionBox.x = this.x + 10;
      this.collisionBox.y = this.y + 5;
      this.collisionBox.width = this.width - 20;
      this.collisionBox.height = this.height - 10;
    }
  }

  /**
   * Update sprite image based on player state
   */
  updateSprite() {
    if (this.state.isCrashed) {
      this.image = Assets.images.player.crash;
    } else if (this.state.isJumping || this.state.isDoubleJumping) {
      this.image = Assets.images.player.jump;
    } else if (this.state.isSliding) {
      this.image = Assets.images.player.slide;
    } else {
      this.image = Assets.images.player.run;
    }
  }

  /**
   * Make the player jump
   */
  jump() {
    // Add a small coyote time (allow jumping slightly after falling off platform)
    const canJump =
      !this.state.isJumping ||
      (this.state.isJumping && this.y < this.groundY - this.height + 10);

    if (canJump && !this.state.isDoubleJumping) {
      // First jump
      this.velocityY = this.jumpForce;
      this.state.isJumping = true;
      this.state.isRunning = false;
      this.state.isSliding = false;
      Assets.playSfx("jump");
    } else if (this.state.isJumping && !this.state.isDoubleJumping) {
      // Double jump
      this.velocityY = this.jumpForce * 0.8;
      this.state.isDoubleJumping = true;
      Assets.playSfx("jump");
    }
  }

  /**
   * Make the player slide
   */
  slide() {
    if (!this.state.isJumping && !this.state.isSliding) {
      this.state.isSliding = true;
      this.state.isRunning = false;

      // Adjust height for sliding
      this.height = 30;
    }
  }

  /**
   * End the slide and return to running
   */
  endSlide() {
    if (this.state.isSliding) {
      this.state.isSliding = false;
      this.state.isRunning = true;

      // Restore original height
      this.height = 50;
    }
  }

  /**
   * Land after jumping
   */
  land() {
    this.y = this.groundY - this.height;
    this.velocityY = 0;
    this.state.isJumping = false;
    this.state.isDoubleJumping = false;
    this.state.isRunning = true;
  }

  /**
   * Crash the player (hit by obstacle)
   */
  crash() {
    if (this.invincible) return;

    this.state.isCrashed = true;
    this.state.isRunning = false;
    this.state.isJumping = false;
    this.state.isSliding = false;

    // Apply "crash" physics
    this.velocityY = this.jumpForce * 0.5;
    this.velocityX = -100;

    Assets.playSfx("crash");
  }

  /**
   * Collect a coffee power-up
   */
  collectCoffee() {
    this.coffeeCount++;
    this.state.hasSpeedBoost = true;
    this.speedBoost = 200;
    this.speedBoostDuration = 5000; // 5 seconds

    Assets.playSfx("powerup");
  }

  /**
   * Collect a Stack Overflow answer (invincibility)
   */
  collectStackOverflow() {
    this.invincible = true;
    this.invincibilityDuration = 3000; // 3 seconds

    Assets.playSfx("powerup");
  }

  /**
   * Collect a Git commit (checkpoint)
   */
  collectGitCommit() {
    this.gitCommits++;

    Assets.playSfx("collect");
  }

  /**
   * Collect a code snippet (points)
   */
  collectCodeSnippet() {
    this.codeSnippets++;
    this.score += 10;

    Assets.playSfx("collect");
  }

  /**
   * Get current player speed
   * @returns {number} - Current speed
   */
  getSpeed() {
    // Slightly reduce speed when jumping to make the game more controllable
    const jumpingModifier = this.state.isJumping ? 0.9 : 1;
    return (this.baseSpeed + this.speedBoost) * jumpingModifier;
  }

  /**
   * Reset player to initial state
   */
  reset() {
    this.x = 100;
    this.y = this.groundY - 50;
    this.velocityX = 0;
    this.velocityY = 0;

    this.state = {
      isRunning: true,
      isJumping: false,
      isDoubleJumping: false,
      isSliding: false,
      isCrashed: false,
      hasSpeedBoost: false,
    };

    this.speedBoost = 0;
    this.speedBoostDuration = 0;
    this.invincible = false;
    this.invincibilityDuration = 0;

    this.score = 0;
    this.coffeeCount = 0;
    this.codeSnippets = 0;
    this.gitCommits = 0;

    this.isActive = true;
    this.updateSprite();
  }
}
