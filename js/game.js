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
    };

    // Game loop variables
    this.lastFrameTime = 0;
    this.animationFrameId = null;

    // Initialize game
    this.initialize();
  }

  /**
   * Initialize game
   */
  async initialize() {
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
      if (!this.state.isRunning) return;
      e.preventDefault(); // Prevent default behavior
      this.handleJump();
    });

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (!this.state.isRunning) return;
        e.preventDefault(); // Prevent default behavior

        // Get touch position
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const y = touch.clientY - rect.top;

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
      "touchend",
      (e) => {
        if (!this.state.isRunning) return;
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
    document.getElementById("help-button").addEventListener("click", () => {
      this.showInstructions();
    });

    // Add back button event listener to return from instructions to game
    document.getElementById("back-button").addEventListener("click", () => {
      if (this.state.isRunning) {
        this.ui.showGameUI();
        // Don't unpause automatically - let the player decide when to resume
      } else {
        this.ui.showScreen("start");
      }
    });
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
    }

    this.input.lastJumpTime = now;

    // Trigger jump
    this.player.jump();
  }

  /**
   * Start a new game
   */
  startGame() {
    // Reset game state
    this.state = {
      isRunning: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
    };

    // Create player
    this.player = new Player({
      groundY: this.canvas.height - 50,
    });

    // Create level
    this.level = new Level({
      theme: "legacy", // Start with legacy theme
      width: this.canvas.width,
      height: this.canvas.height,
    });

    // Reset input state
    this.input = {
      isJumpPressed: false,
      isSlidePressed: false,
      jumpTimer: 0,
      lastJumpTime: 0,
    };

    // Hide start screen and show game UI
    this.ui.showGameUI();

    // Start game loop
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Restart the game after game over
   */
  restartGame() {
    // Hide game over screen
    this.ui.hideGameOver();

    // Start a new game
    this.startGame();
  }

  /**
   * Toggle game pause state
   */
  togglePause() {
    this.state.isPaused = !this.state.isPaused;

    if (!this.state.isPaused) {
      // Resume game loop
      this.lastFrameTime = performance.now();
      this.gameLoop(this.lastFrameTime);
    }
  }

  /**
   * Show instructions and pause the game
   */
  showInstructions() {
    if (this.state.isRunning && !this.state.isPaused) {
      this.togglePause(); // Pause the game
    }
    this.ui.showScreen("instructions");
  }

  /**
   * End the game
   */
  endGame() {
    this.state.isRunning = false;
    this.state.isGameOver = true;

    // Save high score
    Utils.saveHighScore(this.state.score);

    // Show game over screen
    this.ui.showGameOver(this.state.score);

    // Show restart hint
    this.ui.showRestartHint();

    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main game loop
   * @param {number} timestamp - Current timestamp
   */
  gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Skip update if paused
    if (!this.state.isPaused) {
      this.update(deltaTime);
    }

    // Render game
    this.render();

    // Continue game loop if game is running
    if (this.state.isRunning) {
      this.animationFrameId = requestAnimationFrame((time) =>
        this.gameLoop(time)
      );
    }
  }

  /**
   * Update game state
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    // Cap delta time to prevent large jumps
    const cappedDeltaTime = Math.min(deltaTime, 100);

    // Update player
    if (this.player && this.player.isActive) {
      this.player.update(cappedDeltaTime);

      // Update score based on distance
      this.state.score = Math.floor(
        this.player.score + this.level.distance / 10
      );
    }

    // Update level
    if (this.level) {
      this.level.update(cappedDeltaTime, this.player);

      // Check if deadline caught up with player
      if (this.level.isDeadlineCaught() && !this.state.isGameOver) {
        this.player.crash();
        this.ui.addEffect("flash", 500);
      }
    }

    // Check for game over conditions
    if (
      (this.player && !this.player.isActive) ||
      (this.level && this.level.isDeadlineCaught())
    ) {
      this.endGame();
    }

    // Update HUD
    this.updateHUD();
  }

  /**
   * Update HUD elements
   */
  updateHUD() {
    if (!this.player || !this.level) return;

    // Calculate coffee boost percentage
    const coffeeBoost = this.player.state.hasSpeedBoost
      ? (this.player.speedBoostDuration / 5000) * 100
      : 0;

    // Update UI
    this.ui.updateHUD({
      score: this.state.score,
      coffeeBoost: coffeeBoost,
      deadlineProximity: this.level.getDeadlineProximity(),
    });
  }

  /**
   * Render game
   */
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw level
    if (this.level) {
      this.level.draw(this.ctx);
    }

    // Draw player
    if (this.player) {
      this.player.draw(this.ctx);
    }

    // Draw debug info
    if (window.DEBUG_MODE) {
      this.drawDebugInfo();
    }
  }

  /**
   * Draw debug information
   */
  drawDebugInfo() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    this.ctx.fillRect(10, 10, 200, 100);

    this.ctx.fillStyle = "white";
    this.ctx.font = "12px monospace";

    this.ctx.fillText(
      `FPS: ${Math.round(1000 / (performance.now() - this.lastFrameTime))}`,
      20,
      30
    );
    this.ctx.fillText(
      `Objects: ${
        this.level.obstacles.length + this.level.collectibles.length
      }`,
      20,
      50
    );
    this.ctx.fillText(`Speed: ${Math.round(this.level.speed)}`, 20, 70);
    this.ctx.fillText(
      `Difficulty: ${this.level.difficulty.toFixed(2)}`,
      20,
      90
    );
  }

  /**
   * Resize canvas to fit container
   */
  resizeCanvas() {
    const container = document.getElementById("game-container");

    // Set canvas size to match container
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;

    // Update level and player if they exist
    if (this.level) {
      this.level.width = this.canvas.width;
      this.level.height = this.canvas.height;
      this.level.groundY = this.canvas.height - 50;
    }

    if (this.player) {
      this.player.groundY = this.canvas.height - 50;
    }
  }
}
