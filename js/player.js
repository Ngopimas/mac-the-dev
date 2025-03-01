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
    this.invincibilityFlashTimer = 0;
    this.coyoteTime = 100; // Time in ms that player can still jump after leaving ground
    this.coyoteTimeCounter = 0;
    this.jumpBufferTime = 150; // Time in ms to buffer a jump input before landing
    this.jumpBufferCounter = 0;
    this.canDoubleJump = false;

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
      this.velocityY += this.gravity * (deltaTime / 1000);
      this.y += this.velocityY * (deltaTime / 1000);

      // Check if player has fallen off screen
      if (this.y > this.groundY + 200) {
        this.isActive = false;
      }

      // Update collision box
      this.updateCollisionBox();
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
      this.invincibilityFlashTimer += deltaTime;

      // Flash effect for invincibility
      if (this.invincibilityFlashTimer >= 100) {
        this.isVisible = !this.isVisible;
        this.invincibilityFlashTimer = 0;
      }

      if (this.invincibilityDuration <= 0) {
        this.invincible = false;
        this.isVisible = true; // Ensure player is visible when invincibility ends
      }
    }

    // Apply gravity if in the air
    if (this.state.isJumping || this.y < this.groundY - this.height) {
      this.velocityY += this.gravity * (deltaTime / 1000);
    }

    // Update position
    this.y += this.velocityY * (deltaTime / 1000);

    // Update coyote time (time window where player can still jump after leaving ground)
    if (!this.state.isJumping && this.y < this.groundY - this.height) {
      this.coyoteTimeCounter += deltaTime;
      if (this.coyoteTimeCounter > this.coyoteTime) {
        this.state.isJumping = true;
      }
    } else {
      this.coyoteTimeCounter = 0;
    }

    // Update jump buffer (time window where jump input is remembered before landing)
    if (this.jumpBufferCounter > 0) {
      this.jumpBufferCounter -= deltaTime;

      // If we're on the ground and have a buffered jump, execute it
      if (!this.state.isJumping && this.y >= this.groundY - this.height) {
        this.executeJump();
        this.jumpBufferCounter = 0;
      }
    }

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
    // If we're in the air and not able to double jump, buffer the jump
    if (
      (this.state.isJumping || this.y < this.groundY - this.height) &&
      !this.canDoubleJump &&
      !this.state.isDoubleJumping
    ) {
      this.jumpBufferCounter = this.jumpBufferTime;
      return;
    }

    // If we can jump (on ground or within coyote time) or can double jump
    if (
      !this.state.isJumping ||
      this.coyoteTimeCounter <= this.coyoteTime ||
      this.canDoubleJump
    ) {
      if (!this.state.isJumping || this.coyoteTimeCounter <= this.coyoteTime) {
        // First jump
        this.executeJump();
        this.canDoubleJump = true;
      } else if (this.canDoubleJump) {
        // Double jump
        this.velocityY = this.jumpForce * 0.8;
        this.state.isDoubleJumping = true;
        this.canDoubleJump = false;
        if (Assets.playSfx) {
          Assets.playSfx("jump");
        }
      }
    }
  }

  /**
   * Execute the jump (internal method)
   */
  executeJump() {
    this.velocityY = this.jumpForce;
    this.state.isJumping = true;
    this.state.isRunning = false;
    this.state.isSliding = false;
    this.coyoteTimeCounter = this.coyoteTime + 1; // Prevent double first jump
    if (Assets.playSfx) {
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
    this.state.isJumping = false;
    this.state.isDoubleJumping = false;
    this.state.isRunning = true;
    this.velocityY = 0;
    this.canDoubleJump = false;
  }

  /**
   * Crash the player
   */
  crash() {
    if (this.invincible) return; // Don't crash if invincible

    if (this.gitCommits > 0) {
      // Use a git commit instead of crashing
      this.gitCommits--;
      this.invincible = true;
      this.invincibilityDuration = 2000; // 2 seconds of invincibility
      if (Assets.playSfx) {
        Assets.playSfx("powerup");
      }
      return;
    }

    this.state.isCrashed = true;
    this.state.isRunning = false;
    this.state.isJumping = false;
    this.state.isSliding = false;
    this.velocityY = this.jumpForce / 2; // Small upward bounce on crash
    if (Assets.playSfx) {
      Assets.playSfx("crash");
    }
  }

  /**
   * Collect coffee power-up
   */
  collectCoffee() {
    this.coffeeCount++;
    this.score += 50;
    this.state.hasSpeedBoost = true;
    this.speedBoost = 300;
    this.speedBoostDuration = 8000;
    if (Assets.playSfx) {
      Assets.playSfx("collect");
    }
  }

  /**
   * Collect Stack Overflow power-up
   */
  collectStackOverflow() {
    this.score += 100;
    this.invincible = true;
    this.invincibilityDuration = 5000; // 5 seconds
    if (Assets.playSfx) {
      Assets.playSfx("powerup");
    }
  }

  /**
   * Collect Git Commit power-up
   */
  collectGitCommit() {
    this.gitCommits++;
    this.score += 150;
    if (Assets.playSfx) {
      Assets.playSfx("collect");
    }
  }

  /**
   * Collect Code Snippet
   */
  collectCodeSnippet() {
    this.codeSnippets++;
    this.score += 10;
    if (Assets.playSfx) {
      Assets.playSfx("collect");
    }
  }

  /**
   * Get current player speed
   * @returns {number} - Current speed
   */
  getSpeed() {
    return this.baseSpeed + this.speedBoost;
  }

  /**
   * Reset player to initial state
   */
  reset() {
    this.y = this.groundY - 50;
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
    this.isVisible = true;
    this.isActive = true;
    this.score = 0;
    this.coffeeCount = 0;
    this.codeSnippets = 0;
    this.gitCommits = 0;
    this.height = 50;
    this.updateCollisionBox();
  }
}
