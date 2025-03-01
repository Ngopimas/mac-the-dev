/**
 * Level management for Mac the Developer game
 */

class Level {
  /**
   * Create a new level
   * @param {Object} options - Level options
   * @param {string} options.theme - Level theme ('legacy', 'startup', or 'enterprise')
   * @param {number} options.width - Canvas width
   * @param {number} options.height - Canvas height
   */
  constructor(options) {
    this.theme = options.theme || "legacy";
    this.width = options.width;
    this.height = options.height;

    // Level properties
    this.groundY = this.height - 50;
    this.speed = 300;
    this.distance = 0;
    this.difficulty = 1;

    // Game objects
    this.backgrounds = [];
    this.obstacles = [];
    this.collectibles = [];

    // Spawn timers
    this.obstacleTimer = 0;
    this.collectibleTimer = 0;
    this.obstacleInterval = 2000; // 2 seconds
    this.collectibleInterval = 1000; // 1 second

    // Deadline properties
    this.deadlinePosition = 0; // Start at 0
    this.deadlineSpeed = 8; // Reduced from 15 to 8 to make it much slower
    this.deadlineWarningActive = false;
    this.deadlineWarningThreshold = 70; // Show warning when deadline is at 70%

    // Initialize level
    this.initialize();
  }

  /**
   * Initialize level elements
   */
  initialize() {
    // Create parallax backgrounds
    this.createBackgrounds();
  }

  /**
   * Create parallax background layers
   */
  createBackgrounds() {
    let bgImage;

    // Select background based on theme
    switch (this.theme) {
      case "legacy":
        bgImage = Assets.images.backgrounds.legacy;
        break;
      case "startup":
        bgImage = Assets.images.backgrounds.startup;
        break;
      case "enterprise":
        bgImage = Assets.images.backgrounds.enterprise;
        break;
      default:
        bgImage = Assets.images.backgrounds.legacy;
    }

    // Create three layers of parallax backgrounds
    this.backgrounds = [
      new BackgroundSprite({
        image: bgImage,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        scrollSpeed: 0.2,
      }),
      new BackgroundSprite({
        image: bgImage,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        scrollSpeed: 0.5,
      }),
      new BackgroundSprite({
        image: bgImage,
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
        scrollSpeed: 0.8,
      }),
    ];
  }

  /**
   * Update level state
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   * @returns {boolean} - True if deadline caught up with player
   */
  update(deltaTime, player) {
    // Update level distance based on player speed
    const playerSpeed = player.getSpeed();
    this.distance += playerSpeed * (deltaTime / 1000);

    // Update difficulty based on distance
    this.updateDifficulty();

    // Update backgrounds
    this.backgrounds.forEach((bg) => {
      bg.update(deltaTime, playerSpeed);
    });

    // Update obstacles
    this.updateObstacles(deltaTime, player);

    // Update collectibles
    this.updateCollectibles(deltaTime, player);

    // Update spawners
    this.updateSpawners(deltaTime);

    // Update deadline
    return this.updateDeadline(deltaTime, player);
  }

  /**
   * Update difficulty based on distance traveled
   */
  updateDifficulty() {
    // Gradually increase difficulty based on distance
    // Start with difficulty 1 and max out at 2.5
    const maxDifficulty = 2.5;
    const difficultyRampUpDistance = 10000; // Distance at which to reach max difficulty

    // More gradual difficulty increase
    this.difficulty =
      1 +
      Math.min(
        (this.distance / difficultyRampUpDistance) * (maxDifficulty - 1),
        maxDifficulty - 1
      );
  }

  /**
   * Update obstacle and collectible spawners
   * @param {number} deltaTime - Time since last update in ms
   */
  updateSpawners(deltaTime) {
    // Calculate game time in seconds
    const gameTimeSeconds = this.distance / this.speed;

    // Reduce obstacle frequency in the first 10 seconds
    const obstacleFrequencyMultiplier = gameTimeSeconds < 10 ? 0.3 : 1.0;

    // Update obstacle timer
    this.obstacleTimer += deltaTime * obstacleFrequencyMultiplier;
    if (this.obstacleTimer >= this.obstacleInterval) {
      this.spawnObstacle();

      // Reset timer with some randomness
      this.obstacleTimer = 0;
      this.obstacleInterval = Utils.randomInt(
        1500 / this.difficulty, // Min interval decreases with difficulty
        3000 / this.difficulty // Max interval decreases with difficulty
      );
    }

    // Increase collectible frequency in the first 15 seconds and overall
    const collectibleFrequencyMultiplier = gameTimeSeconds < 15 ? 2.0 : 1.5;

    // Update collectible timer
    this.collectibleTimer += deltaTime * collectibleFrequencyMultiplier;
    if (this.collectibleTimer >= this.collectibleInterval) {
      this.spawnCollectible();

      // Reset timer with some randomness - shorter intervals for more frequent spawns
      this.collectibleTimer = 0;
      this.collectibleInterval = Utils.randomInt(600, 1500);
    }
  }

  /**
   * Spawn a new obstacle
   */
  spawnObstacle() {
    // Calculate game time in seconds
    const gameTimeSeconds = this.distance / this.speed;

    // Don't spawn obstacles in the first 3 seconds
    if (gameTimeSeconds < 3) {
      return;
    }

    // Don't spawn obstacles too early in the game
    if (this.distance < 500) {
      return;
    }

    // Limit the number of obstacles on screen to prevent impossible situations
    if (this.obstacles.length >= 3) {
      return;
    }

    // Occasionally spawn obstacle patterns instead of single obstacles
    const patternRoll = Math.random();

    // Reduce pattern frequency at the beginning
    const patternThreshold =
      gameTimeSeconds < 10
        ? 0.05 * this.difficulty
        : this.distance < 2000
        ? 0.1 * this.difficulty
        : 0.2 * this.difficulty;

    if (patternRoll < patternThreshold) {
      // Spawn a pattern (more likely at higher difficulties)
      this.spawnObstaclePattern();
    } else {
      // Spawn a single obstacle
      const obstacle = ObstacleFactory.createRandom(this.speed, this.groundY);
      this.obstacles.push(obstacle);
    }
  }

  /**
   * Spawn a pattern of obstacles
   */
  spawnObstaclePattern() {
    const patternType = Utils.randomInt(0, 2);

    switch (patternType) {
      case 0:
        // Double obstacle (high and low)
        this.obstacles.push(
          ObstacleFactory.create("bug", this.speed, this.groundY - 100),
          ObstacleFactory.create("meeting", this.speed, this.groundY)
        );
        break;

      case 1:
        // Triple obstacle with gaps
        this.obstacles.push(
          ObstacleFactory.create("bug", this.speed, this.groundY - 150),
          ObstacleFactory.create(
            "mergeConflict",
            this.speed,
            this.groundY - 60
          ),
          ObstacleFactory.create("technicalDebt", this.speed, this.groundY)
        );

        // Adjust positions to create gaps
        this.obstacles[this.obstacles.length - 3].x = this.width;
        this.obstacles[this.obstacles.length - 2].x = this.width + 200;
        this.obstacles[this.obstacles.length - 1].x = this.width + 400;
        break;

      case 2:
        // Low obstacles in sequence (requires sliding)
        this.obstacles.push(
          ObstacleFactory.create("meeting", this.speed, this.groundY),
          ObstacleFactory.create("meeting", this.speed, this.groundY)
        );

        // Adjust positions to create a sequence
        this.obstacles[this.obstacles.length - 2].x = this.width;
        this.obstacles[this.obstacles.length - 1].x = this.width + 150;
        break;
    }
  }

  /**
   * Spawn a new collectible
   */
  spawnCollectible() {
    // Don't spawn collectibles too early in the game
    if (this.distance < 100) {
      return;
    }

    // Limit the number of collectibles on screen to prevent clutter
    if (this.collectibles.length >= 5) {
      return;
    }

    // Occasionally spawn collectible patterns instead of single collectibles
    const patternRoll = Math.random();
    if (patternRoll < 0.2) {
      // 20% chance to spawn a pattern
      this.spawnCollectiblePattern();
    } else {
      // Determine collectible type for single spawn
      let type;
      const roll = Math.random();

      // Increased coffee spawn rate
      if (roll < 0.45) {
        // 45% chance for coffee (increased from ~25%)
        type = "coffee";
      } else if (roll < 0.65) {
        // 20% chance for stack overflow
        type = "stackOverflow";
      } else if (roll < 0.8) {
        // 15% chance for git commit
        type = "gitCommit";
      } else {
        // 20% chance for code snippet
        type = "codeSnippet";
      }

      // Create collectible
      const collectible = CollectibleFactory.create(
        type,
        this.width,
        Utils.randomInt(this.groundY - 150, this.groundY - 20)
      );

      this.collectibles.push(collectible);
    }
  }

  /**
   * Spawn a pattern of collectibles
   */
  spawnCollectiblePattern() {
    const patternType = Utils.randomInt(0, 3);

    switch (patternType) {
      case 0:
        // Row of code snippets
        for (let i = 0; i < 5; i++) {
          const collectible = CollectibleFactory.create(
            "codeSnippet",
            this.width,
            this.groundY - 100
          );
          collectible.x = this.width + i * 50;
          this.collectibles.push(collectible);
        }
        break;

      case 1:
        // Arc of code snippets
        for (let i = 0; i < 5; i++) {
          const collectible = CollectibleFactory.create(
            "codeSnippet",
            this.width,
            this.groundY - 100 - Math.sin((i / 4) * Math.PI) * 80
          );
          collectible.x = this.width + i * 50;
          this.collectibles.push(collectible);
        }
        break;

      case 2:
        // Coffee with code snippets leading to it
        for (let i = 0; i < 3; i++) {
          const collectible = CollectibleFactory.create(
            "codeSnippet",
            this.width,
            this.groundY - 100
          );
          collectible.x = this.width + i * 50;
          this.collectibles.push(collectible);
        }

        const coffee = CollectibleFactory.create(
          "coffee",
          this.width,
          this.groundY - 100
        );
        coffee.x = this.width + 3 * 50;
        this.collectibles.push(coffee);
        break;

      case 3:
        // Coffee trail - multiple coffee power-ups in a row
        for (let i = 0; i < 3; i++) {
          const collectible = CollectibleFactory.create(
            "coffee",
            this.width,
            this.groundY - 100
          );
          collectible.x = this.width + i * 100;
          this.collectibles.push(collectible);
        }
        break;
    }
  }

  /**
   * Draw level elements
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  draw(ctx) {
    // Draw backgrounds
    this.backgrounds.forEach((bg) => {
      bg.drawRepeating(ctx, this.width);
    });

    // Draw ground
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Draw deadline
    this.drawDeadline(ctx);

    // Draw obstacles
    this.obstacles.forEach((obstacle) => {
      obstacle.draw(ctx);
    });

    // Draw collectibles
    this.collectibles.forEach((collectible) => {
      collectible.draw(ctx);
    });
  }

  /**
   * Get deadline proximity as a percentage (0-100)
   * @returns {number} - Deadline proximity percentage
   */
  getDeadlineProximity() {
    return (this.deadlinePosition / this.width) * 100;
  }

  /**
   * Check if deadline has caught up with player
   * @returns {boolean} - True if deadline has caught up
   */
  isDeadlineCaught() {
    return this.deadlinePosition >= 100; // Player is at x=100
  }

  /**
   * Check if deadline warning should be active
   * @returns {boolean} - True if deadline warning is active
   */
  isDeadlineWarning() {
    return this.deadlineWarningActive;
  }

  /**
   * Reset level to initial state
   */
  reset() {
    // Reset level properties
    this.distance = 0;
    this.difficulty = 1;
    this.deadlinePosition = 0;
    this.deadlineWarningActive = false;

    // Clear game objects
    this.obstacles = [];
    this.collectibles = [];

    // Reset spawn timers
    this.obstacleTimer = 0;
    this.collectibleTimer = 0;
    this.obstacleInterval = 2000;
    this.collectibleInterval = 1000;

    // Recreate backgrounds
    this.createBackgrounds();
  }

  /**
   * Update deadline position and check if it caught up with player
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   * @returns {boolean} - True if deadline caught up with player
   */
  updateDeadline(deltaTime, player) {
    // Calculate game time in seconds
    const gameTimeSeconds = this.distance / this.speed;

    // Deadline moves much slower in the first 15 seconds (extended grace period)
    let deadlineSpeedMultiplier = 0.05; // Reduced from 0.1 to 0.05

    if (gameTimeSeconds >= 15) {
      // Extended from 10 to 15 seconds
      // After grace period, deadline speed depends on player speed
      const playerSpeed = player.getSpeed();
      const baseSpeed = player.baseSpeed;

      // If player is moving at base speed, deadline slowly catches up
      // If player is boosted, deadline falls behind
      deadlineSpeedMultiplier =
        (baseSpeed / playerSpeed) * this.difficulty * 0.7; // Added 0.7 multiplier to slow down deadline

      // If player has coffee boost, slow down the deadline significantly
      if (player.state.hasSpeedBoost) {
        deadlineSpeedMultiplier *= 0.3; // Reduce deadline speed by 70% when coffee is active
      }

      // Ensure deadline always moves at least a little bit
      deadlineSpeedMultiplier = Math.max(0.05, deadlineSpeedMultiplier); // Reduced from 0.1 to 0.05
    }

    // Update deadline position
    this.deadlinePosition +=
      this.deadlineSpeed * deadlineSpeedMultiplier * (deltaTime / 1000);

    // Check if deadline is in warning zone
    const deadlineProximity = this.getDeadlineProximity();
    this.deadlineWarningActive =
      deadlineProximity >= this.deadlineWarningThreshold;

    // Check if deadline caught up with player
    return this.isDeadlineCaught();
  }

  /**
   * Draw deadline visualization
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   */
  drawDeadline(ctx) {
    // Draw deadline as a vertical red line with gradient
    const gradient = ctx.createLinearGradient(
      this.deadlinePosition - 20,
      0,
      this.deadlinePosition,
      0
    );
    gradient.addColorStop(0, "rgba(255, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.7)");

    ctx.fillStyle = gradient;
    ctx.fillRect(this.deadlinePosition - 20, 0, 20, this.height);

    // Draw deadline line
    ctx.strokeStyle = "rgba(255, 0, 0, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.deadlinePosition, 0);
    ctx.lineTo(this.deadlinePosition, this.height);
    ctx.stroke();

    // Draw deadline text
    ctx.save();
    ctx.translate(this.deadlinePosition - 10, this.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = "#ff0000";
    ctx.font = "bold 16px Arial";
    ctx.fillText("DEADLINE", 0, 0);
    ctx.restore();
  }

  /**
   * Update obstacles and check for collisions
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   */
  updateObstacles(deltaTime, player) {
    // Update each obstacle
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.update(deltaTime);

      // Check for collision with player
      if (
        obstacle.isActive &&
        player.isActive &&
        !player.state.isCrashed &&
        player.isCollidingWith(obstacle)
      ) {
        // Apply obstacle effect to player
        obstacle.applyEffect(player);
      }

      // Remove inactive obstacles
      if (!obstacle.isActive) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  /**
   * Update collectibles and check for collisions
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   */
  updateCollectibles(deltaTime, player) {
    // Update each collectible
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];
      collectible.update(deltaTime);

      // Check for collision with player
      if (
        collectible.isActive &&
        player.isActive &&
        !player.state.isCrashed &&
        player.isCollidingWith(collectible)
      ) {
        // Apply collectible effect to player
        collectible.applyEffect(player);
      }

      // Remove inactive collectibles
      if (!collectible.isActive) {
        this.collectibles.splice(i, 1);
      }
    }
  }
}
