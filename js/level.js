/**
 * Level management for Sonic the Developer game
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
    this.deadlineSpeed = 20; // Reduced from 50 to 20 to make it slower

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

    // Increase collectible frequency in the first 10 seconds
    const collectibleFrequencyMultiplier = gameTimeSeconds < 10 ? 1.5 : 1.0;

    // Update collectible timer
    this.collectibleTimer += deltaTime * collectibleFrequencyMultiplier;
    if (this.collectibleTimer >= this.collectibleInterval) {
      this.spawnCollectible();

      // Reset timer with some randomness
      this.collectibleTimer = 0;
      this.collectibleInterval = Utils.randomInt(800, 2000);
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
          ObstacleFactory.create("mergeConflict", this.speed, this.groundY),
          ObstacleFactory.create("bug", this.speed + 100, this.groundY - 80),
          ObstacleFactory.create("technicalDebt", this.speed, this.groundY)
        );

        // Adjust positions
        this.obstacles[this.obstacles.length - 3].x = this.width;
        this.obstacles[this.obstacles.length - 2].x = this.width + 200;
        this.obstacles[this.obstacles.length - 1].x = this.width + 400;
        break;

      case 2:
        // Technical debt wall
        for (let i = 0; i < 3; i++) {
          const obstacle = ObstacleFactory.create(
            "technicalDebt",
            this.speed,
            this.groundY
          );
          obstacle.x = this.width + i * 100;
          this.obstacles.push(obstacle);
        }
        break;
    }
  }

  /**
   * Spawn a new collectible
   */
  spawnCollectible() {
    // Occasionally spawn collectible patterns instead of single collectibles
    const patternRoll = Math.random();

    if (patternRoll < 0.3) {
      // Spawn a pattern
      this.spawnCollectiblePattern();
    } else {
      // Spawn a single collectible
      const collectible = CollectibleFactory.createRandom(
        this.speed,
        this.groundY
      );
      this.collectibles.push(collectible);
    }
  }

  /**
   * Spawn a pattern of collectibles
   */
  spawnCollectiblePattern() {
    const patternType = Utils.randomInt(0, 2);

    switch (patternType) {
      case 0:
        // Row of code snippets
        const snippets = CollectibleFactory.createCodeSnippetRow(
          this.speed,
          this.groundY,
          5,
          this.width,
          this.groundY - Utils.randomInt(50, 150)
        );
        this.collectibles.push(...snippets);
        break;

      case 1:
        // Coffee with code snippets around it
        const coffee = CollectibleFactory.create(
          "coffee",
          this.speed,
          this.groundY
        );
        coffee.x = this.width;
        this.collectibles.push(coffee);

        // Add code snippets in a circle around the coffee
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const radius = 60;
          const snippet = CollectibleFactory.create(
            "codeSnippet",
            this.speed,
            this.groundY
          );
          snippet.x = this.width + Math.cos(angle) * radius;
          snippet.y = coffee.y + Math.sin(angle) * radius;
          this.collectibles.push(snippet);
        }
        break;

      case 2:
        // Stack Overflow answer with code snippets leading to it
        const stackOverflow = CollectibleFactory.create(
          "stackOverflow",
          this.speed,
          this.groundY
        );
        stackOverflow.x = this.width + 200;
        this.collectibles.push(stackOverflow);

        // Add code snippets leading to the Stack Overflow answer
        for (let i = 0; i < 5; i++) {
          const snippet = CollectibleFactory.create(
            "codeSnippet",
            this.speed,
            this.groundY
          );
          snippet.x = this.width + i * 40;
          snippet.y = stackOverflow.y + i * 10;
          this.collectibles.push(snippet);
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
    for (const bg of this.backgrounds) {
      bg.drawRepeating(ctx, this.width);
    }

    // Draw ground
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Draw obstacles
    for (const obstacle of this.obstacles) {
      obstacle.draw(ctx);
    }

    // Draw collectibles
    for (const collectible of this.collectibles) {
      collectible.draw(ctx);
    }

    // Draw deadline (red line on the left)
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.fillRect(this.deadlinePosition, 0, 5, this.height);
  }

  /**
   * Get deadline proximity as a percentage (0-100)
   * @returns {number} - Deadline proximity percentage
   */
  getDeadlineProximity() {
    return (this.deadlinePosition / 100) * 100;
  }

  /**
   * Check if deadline has caught up with player
   * @returns {boolean} - True if deadline caught up with player
   */
  isDeadlineCaught() {
    return this.deadlinePosition >= 100;
  }

  /**
   * Reset level to initial state
   */
  reset() {
    this.speed = 300;
    this.distance = 0;
    this.difficulty = 1;

    this.obstacles = [];
    this.collectibles = [];

    this.obstacleTimer = 0;
    this.collectibleTimer = 0;
    this.obstacleInterval = 2000;
    this.collectibleInterval = 1000;

    this.deadlinePosition = 0;
  }

  /**
   * Update deadline position
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   * @returns {boolean} - True if deadline caught up with player
   */
  updateDeadline(deltaTime, player) {
    // Deadline moves at a constant speed, but player can increase distance with coffee
    const playerSpeed = player.getSpeed();

    // Make the deadline move slower at the beginning to give player time to adjust
    let speedDifference = this.deadlineSpeed - (playerSpeed - this.speed);

    // Calculate game time in seconds
    const gameTimeSeconds = this.distance / this.speed;

    // First 10 seconds: very easy mode
    if (gameTimeSeconds < 10) {
      // Almost no deadline pressure for the first 10 seconds
      speedDifference = Math.max(0, speedDifference * 0.1);
    }
    // Next 5 seconds: gradual increase in difficulty
    else if (gameTimeSeconds < 15) {
      // Gradually increase deadline speed after the initial grace period
      const transitionFactor = (gameTimeSeconds - 10) / 5; // 0 to 1 over 5 seconds
      speedDifference = Math.max(
        0,
        speedDifference * (0.1 + transitionFactor * 0.5)
      );
    }
    // After 15 seconds: normal difficulty
    else if (this.distance < 3000) {
      // Slightly reduced difficulty until distance 3000
      speedDifference = Math.max(0, speedDifference * 0.6);
    }

    // Update deadline position
    this.deadlinePosition += speedDifference * (deltaTime / 1000);

    // Ensure deadline doesn't go backwards
    this.deadlinePosition = Math.max(0, this.deadlinePosition);

    // Check if deadline caught up with player
    return this.deadlinePosition >= 100;
  }

  /**
   * Update obstacles and check for collisions
   * @param {number} deltaTime - Time since last update in ms
   * @param {Player} player - Player object
   */
  updateObstacles(deltaTime, player) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];

      // Update obstacle
      obstacle.update(deltaTime);

      // Check for collision with player
      if (
        obstacle.isActive &&
        player.isActive &&
        !player.state.isCrashed &&
        obstacle.isCollidingWith(player)
      ) {
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
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const collectible = this.collectibles[i];

      // Update collectible
      collectible.update(deltaTime);

      // Check for collision with player
      if (
        collectible.isActive &&
        player.isActive &&
        !player.state.isCrashed &&
        collectible.isCollidingWith(player)
      ) {
        collectible.applyEffect(player);
      }

      // Remove inactive collectibles
      if (!collectible.isActive) {
        this.collectibles.splice(i, 1);
      }
    }
  }
}
