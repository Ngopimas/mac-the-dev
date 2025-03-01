/**
 * Main game logic for Sonic the Developer game
 */

class Game {
  /**
   * Create a new game instance
   */
  constructor() {
    // Game canvas
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    // Set canvas size
    this.resizeCanvas();

    // Game state
    this.state = {
      isRunning: false,
      isPaused: false,
      isGameOver: false,
      score: 0,
      highScore: Utils.getHighScore() || 0,
      coffeeBoost: 0,
      deadlineProximity: 0,
      powerUps: {
        coffee: 0,
        invincibility: 0,
        gitCommits: 0,
      },
    };

    // Game objects
    this.player = null;
    this.level = null;

    // UI manager
    this.ui = new UI();

    // Input handling
    this.input = {
      isJumpPressed: false,
      isSlidePressed: false,
      jumpTimer: 0,
      lastJumpTime: 0,
      touchStartY: 0,
    };

    // Game loop variables
    this.lastFrameTime = 0;
    this.animationFrameId = null;
    this.accumulatedTime = 0;
    this.timeStep = 1000 / 60; // Target 60 FPS

    // Initialize game
    this.initialize();
  }

  /**
   * Initialize game
   */
  async initialize() {
    try {
      // Load assets
      await Assets.loadAll();

      // Set up event listeners
      this.setupEventListeners();

      // Set up UI buttons
      this.ui.setupButtons({
        onStart: () => this.startGame(),
        onRestart: () => this.restartGame(),
      });

      // Handle window resize
      window.addEventListener("resize", () => this.resizeCanvas());

      // Debug mode (for development)
      window.DEBUG_MODE = false;

      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Error initializing game:", error);
      // Display error message to user
      alert(
        "There was an error loading the game. Please refresh the page and try again."
      );
    }
  }

  /**
   * Set up event listeners for player input
   */
  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      // Handle game restart when dead
      if (this.state.isGameOver) {
        if (e.key === " " || e.key === "Enter") {
          this.restartGame();
          return;
        }
      }

      // Allow jump and slide even when paused to improve responsiveness
      if (!this.state.isRunning) return;

      switch (e.key) {
        case " ":
        case "ArrowUp":
          e.preventDefault(); // Prevent page scrolling
          this.handleJump();
          break;

        case "ArrowDown":
          e.preventDefault(); // Prevent page scrolling
          this.input.isSlidePressed = true;
          if (this.player) this.player.slide();
          break;

        case "p":
        case "Escape":
          this.togglePause();
          break;

        case "?":
        case "h":
          // Show instructions and pause the game
          this.showInstructions();
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      if (!this.state.isRunning) return;

      switch (e.key) {
        case "ArrowDown":
          this.input.isSlidePressed = false;
          if (this.player) this.player.endSlide();
          break;
      }
    });

    // Mouse/touch events
    this.canvas.addEventListener("mousedown", (e) => {
      if (!this.state.isRunning || this.state.isPaused) return;
      e.preventDefault(); // Prevent default behavior
      this.handleJump();
    });

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        e.preventDefault(); // Prevent default behavior

        // Get touch position
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const y = touch.clientY - rect.top;

        // Store touch start position for swipe detection
        this.input.touchStartY = y;

        // If touch is in bottom third of screen, slide; otherwise jump
        if (y > this.canvas.height * 0.7) {
          this.input.isSlidePressed = true;
          if (this.player) this.player.slide();
        } else {
          this.handleJump();
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        e.preventDefault(); // Prevent default behavior

        // Get current touch position
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const y = touch.clientY - rect.top;

        // Detect swipe down for slide
        if (y - this.input.touchStartY > 50 && !this.input.isSlidePressed) {
          this.input.isSlidePressed = true;
          if (this.player) this.player.slide();
        }
        // Detect swipe up for jump
        else if (this.input.touchStartY - y > 50 && !this.input.isJumpPressed) {
          this.handleJump();
        }
      },
      { passive: false }
    );

    this.canvas.addEventListener(
      "touchend",
      (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        e.preventDefault(); // Prevent default behavior

        // End slide if sliding
        if (this.input.isSlidePressed) {
          this.input.isSlidePressed = false;
          if (this.player) this.player.endSlide();
        }
      },
      { passive: false }
    );

    // Add help button event listener
    const helpButton = document.getElementById("help-button");
    if (helpButton) {
      helpButton.addEventListener("click", () => {
        this.showInstructions();
      });
    }

    // Add back button event listener to return from instructions to game
    const backButton = document.getElementById("back-button");
    if (backButton) {
      backButton.addEventListener("click", () => {
        if (this.state.isRunning) {
          this.ui.showGameUI();
          // Don't unpause automatically - let the player decide when to resume
        } else {
          this.ui.showScreen("start");
        }
      });
    }

    // Add pause/resume button event listener
    const pauseButton = document.getElementById("pause-button");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }
  }

  /**
   * Handle jump input (including double jump detection)
   */
  handleJump() {
    if (!this.player || this.state.isPaused) return;

    this.input.isJumpPressed = true;

    const now = Date.now();
    const timeSinceLastJump = now - this.input.lastJumpTime;

    // Check for double jump (if jump pressed within 300ms of last jump)
    if (timeSinceLastJump < 300) {
      this.input.jumpTimer = 0;
      this.player.jump(); // This will trigger double jump if conditions are met
    } else {
      this.player.jump();
    }

    this.input.lastJumpTime = now;
  }

  /**
   * Start a new game
   */
  startGame() {
    // Reset game state
    this.state.isRunning = true;
    this.state.isPaused = false;
    this.state.isGameOver = false;
    this.state.score = 0;
    this.state.coffeeBoost = 0;
    this.state.deadlineProximity = 0;
    this.state.powerUps = {
      coffee: 0,
      invincibility: 0,
      gitCommits: 0,
    };

    // Create player
    this.player = new Player({
      groundY: this.canvas.height - 50,
    });

    // Create level
    this.level = new Level({
      theme: "startup",
      width: this.canvas.width,
      height: this.canvas.height,
    });

    // Show game UI
    this.ui.showScreen("game");

    // Start game loop
    this.lastFrameTime = performance.now();
    this.accumulatedTime = 0;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.animationFrameId = requestAnimationFrame((timestamp) =>
      this.gameLoop(timestamp)
    );

    // Play background music
    if (Assets.playMusic) {
      Assets.playMusic("main");
    }
  }

  /**
   * Restart the game after game over
   */
  restartGame() {
    // Cancel any existing animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Start a new game
    this.startGame();
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    if (!this.state.isRunning || this.state.isGameOver) return;

    this.state.isPaused = !this.state.isPaused;

    if (this.state.isPaused) {
      // Show pause message
      const pauseMessage = document.getElementById("pause-message");
      if (pauseMessage) {
        pauseMessage.classList.remove("hidden");
      }

      // Pause music
      if (Assets.stopMusic) {
        Assets.stopMusic();
      }
    } else {
      // Hide pause message
      const pauseMessage = document.getElementById("pause-message");
      if (pauseMessage) {
        pauseMessage.classList.add("hidden");
      }

      // Resume music
      if (Assets.playMusic) {
        Assets.playMusic("main");
      }

      // Resume game loop
      this.lastFrameTime = performance.now();
      this.accumulatedTime = 0;
    }
  }

  /**
   * Show instructions and pause the game
   */
  showInstructions() {
    if (this.state.isRunning && !this.state.isPaused) {
      this.state.isPaused = true;
    }

    // Show instructions screen
    this.ui.showScreen("instructions");
  }

  /**
   * End the game
   */
  endGame() {
    if (this.state.isGameOver) return;

    this.state.isRunning = false;
    this.state.isGameOver = true;

    // Check for high score
    const isNewHighScore = Utils.setHighScore(this.state.score);

    // Show game over screen
    this.ui.showGameOver(
      this.state.score,
      Utils.getHighScore(),
      isNewHighScore
    );

    // Show restart hint for keyboard users
    this.ui.showRestartHint();

    // Play game over sound
    if (Assets.playSfx) {
      Assets.playSfx("gameOver");
    }

    // Stop background music
    if (Assets.stopMusic) {
      Assets.stopMusic();
    }

    // Add confetti effect for new high score
    if (isNewHighScore) {
      this.ui.addEffect("confetti", 3000);
    }
  }

  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  gameLoop(timestamp) {
    // Calculate time since last frame
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Accumulate time for fixed time step
    this.accumulatedTime += deltaTime;

    // Update game state at fixed intervals
    while (this.accumulatedTime >= this.timeStep) {
      if (!this.state.isPaused) {
        this.update(this.timeStep);
      }
      this.accumulatedTime -= this.timeStep;
    }

    // Render game
    this.render();

    // Continue game loop if game is running
    if (this.state.isRunning) {
      this.animationFrameId = requestAnimationFrame((timestamp) =>
        this.gameLoop(timestamp)
      );
    }
  }

  /**
   * Update game state
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    if (!this.player || !this.level) return;

    // Update player
    this.player.update(deltaTime);

    // Update level and check if deadline caught up
    const isDeadlineCaught = this.level.update(deltaTime, this.player);

    // Check if player is still active
    if (!this.player.isActive || isDeadlineCaught) {
      this.endGame();
      return;
    }

    // Update score based on distance traveled
    this.state.score = Math.floor(this.level.distance) + this.player.score;

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Update UI
    this.updateUI();
  }

  /**
   * Update power-up states
   * @param {number} deltaTime - Time since last update in ms
   */
  updatePowerUps(deltaTime) {
    // Update coffee boost
    if (this.player.state.hasSpeedBoost) {
      this.state.coffeeBoost = (this.player.speedBoostDuration / 5000) * 100;
      this.state.powerUps.coffee = this.player.speedBoostDuration;
    } else {
      this.state.coffeeBoost = 0;
      this.state.powerUps.coffee = 0;
    }

    // Update invincibility
    if (this.player.invincible) {
      this.state.powerUps.invincibility = this.player.invincibilityDuration;
    } else {
      this.state.powerUps.invincibility = 0;
    }

    // Update git commits
    this.state.powerUps.gitCommits = this.player.gitCommits;

    // Update deadline proximity
    this.state.deadlineProximity = this.level.getDeadlineProximity();
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update HUD
    this.ui.updateHUD({
      score: this.state.score,
      coffeeBoost: this.state.coffeeBoost,
      deadlineProximity: this.state.deadlineProximity,
      powerUps: this.state.powerUps,
    });

    // Add warning effect when deadline is close
    if (this.level.isDeadlineWarning()) {
      this.ui.addEffect("flash", 500);
    }
  }

  /**
   * Render game
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render level
    if (this.level) {
      this.level.draw(this.ctx);
    }

    // Render player
    if (this.player) {
      this.player.draw(this.ctx);
    }

    // Draw debug info if debug mode is enabled
    if (window.DEBUG_MODE) {
      this.drawDebugInfo();
    }
  }

  /**
   * Draw debug information
   */
  drawDebugInfo() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(10, 10, 300, 120);
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "12px monospace";

    const debugInfo = [
      `FPS: ${Math.round(1000 / (performance.now() - this.lastFrameTime))}`,
      `Player State: ${Object.entries(this.player.state)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
        .join(", ")}`,
      `Player Position: (${Math.round(this.player.x)}, ${Math.round(
        this.player.y
      )})`,
      `Player Velocity: (${Math.round(this.player.velocityX)}, ${Math.round(
        this.player.velocityY
      )})`,
      `Distance: ${Math.round(this.level.distance)}`,
      `Difficulty: ${this.level.difficulty.toFixed(2)}`,
      `Deadline: ${this.state.deadlineProximity.toFixed(2)}%`,
    ];

    debugInfo.forEach((text, index) => {
      this.ctx.fillText(text, 20, 30 + index * 15);
    });
  }

  /**
   * Resize canvas to fit window
   */
  resizeCanvas() {
    // Get container dimensions
    const container = document.getElementById("game-container");
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Set canvas size
    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;

    // Update ground position if level exists
    if (this.level) {
      this.level.groundY = this.canvas.height - 50;
    }

    // Update player position if player exists
    if (this.player) {
      this.player.groundY = this.canvas.height - 50;

      // If player is on the ground, update Y position
      if (!this.player.state.isJumping) {
        this.player.y = this.player.groundY - this.player.height;
      }
    }
  }

  /**
   * Handle power-up collision
   * @param {string} powerUpType - Type of power-up collected
   */
  handlePowerUpCollision(powerUp) {
    if (!this.player) return;

    switch (powerUp.type) {
      case "coffee":
        this.player.collectCoffee();
        this.ui.addEffect("flash", 300);
        break;

      case "stackOverflow":
        this.player.collectStackOverflow();
        this.ui.addEffect("flash", 300);
        break;

      case "gitCommit":
        this.player.collectGitCommit();
        this.ui.addEffect("flash", 300);
        break;

      case "codeSnippet":
        this.player.collectCodeSnippet();
        break;
    }
  }

  /**
   * Use a git commit to save the player
   */
  useGitCommit() {
    if (this.player && this.player.gitCommits > 0) {
      this.player.gitCommits--;
      this.player.invincible = true;
      this.player.invincibilityDuration = 2000; // 2 seconds of invincibility

      if (Assets.playSfx) {
        Assets.playSfx("powerup");
      }

      return true;
    }
    return false;
  }
}
