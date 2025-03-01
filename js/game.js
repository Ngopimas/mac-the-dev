/**
 * Main game logic for the developer-themed endless runner game
 */

class Game {
  /**
   * Creates and initializes a new game instance with all required components
   */
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.resizeCanvas();

    // Game state tracking
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

    this.initialize();
  }

  /**
   * Initializes game assets, event listeners, and UI
   */
  async initialize() {
    try {
      await Assets.loadAll();

      this.setupEventListeners();

      this.ui.setupButtons({
        onStart: () => this.startGame(),
        onRestart: () => this.restartGame(),
      });

      window.addEventListener("resize", () => this.resizeCanvas());

      window.DEBUG_MODE = false;

      console.log("Game initialized successfully");
    } catch (error) {
      console.error("Error initializing game:", error);
      alert(
        "There was an error loading the game. Please refresh the page and try again."
      );
    }
  }

  /**
   * Sets up event listeners for keyboard, mouse, and touch inputs
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

      const rect = this.canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // If click is in bottom third of screen, slide; otherwise jump
      if (y > this.canvas.height * 0.7) {
        this.input.isSlidePressed = true;
        if (this.player) this.player.slide();
      } else {
        this.handleJump();
      }
    });

    this.canvas.addEventListener("mouseup", (e) => {
      if (!this.state.isRunning || this.state.isPaused) return;
      e.preventDefault(); // Prevent default behavior

      // End slide if sliding
      if (this.input.isSlidePressed) {
        this.input.isSlidePressed = false;
        if (this.player) this.player.endSlide();
      }
    });

    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.state.isRunning || this.state.isPaused) return;
      if (e.buttons !== 1) return; // Only process if mouse button is pressed

      const rect = this.canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;

      // If mouse is in bottom third of screen and not already sliding, start sliding
      if (y > this.canvas.height * 0.7 && !this.input.isSlidePressed) {
        this.input.isSlidePressed = true;
        if (this.player) this.player.slide();
      }
      // If mouse is not in bottom third and is sliding, end sliding
      else if (y <= this.canvas.height * 0.7 && this.input.isSlidePressed) {
        this.input.isSlidePressed = false;
        if (this.player) this.player.endSlide();
      }
    });

    this.canvas.addEventListener(
      "touchstart",
      (e) => {
        if (!this.state.isRunning || this.state.isPaused) return;
        e.preventDefault(); // Prevent default behavior

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

    const helpButton = document.getElementById("help-button");
    if (helpButton) {
      helpButton.addEventListener("click", () => {
        this.showInstructions();
      });
    }

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

    const pauseButton = document.getElementById("pause-button");
    if (pauseButton) {
      pauseButton.addEventListener("click", () => {
        this.togglePause();
      });
    }
  }

  /**
   * Handles jump input with double jump detection
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
   * Starts a new game by initializing player, level, and game state
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

    // Make sure high score is up to date
    this.state.highScore = Utils.getHighScore();

    // Add playing class to game container for mouse zone indicators
    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.classList.add("playing");
    }

    this.player = new Player({
      groundY: this.canvas.height - 50,
    });

    this.level = new Level({
      theme: "startup",
      width: this.canvas.width,
      height: this.canvas.height,
    });

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

    if (Assets.playMusic) {
      Assets.playMusic("main");
    }
  }

  /**
   * Restarts the game after game over
   */
  restartGame() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.startGame();
  }

  /**
   * Toggles the pause state of the game
   */
  togglePause() {
    if (!this.state.isRunning || this.state.isGameOver) return;

    this.state.isPaused = !this.state.isPaused;

    if (this.state.isPaused) {
      const pauseMessage = document.getElementById("pause-message");
      if (pauseMessage) {
        pauseMessage.classList.remove("hidden");
      }

      if (Assets.stopMusic) {
        Assets.stopMusic();
      }
    } else {
      const pauseMessage = document.getElementById("pause-message");
      if (pauseMessage) {
        pauseMessage.classList.add("hidden");
      }

      if (Assets.playMusic) {
        Assets.playMusic("main");
      }

      // Resume game loop
      this.lastFrameTime = performance.now();
      this.accumulatedTime = 0;
    }
  }

  /**
   * Shows instructions screen and pauses the game
   */
  showInstructions() {
    if (this.state.isRunning && !this.state.isPaused) {
      this.state.isPaused = true;
    }

    this.ui.showScreen("instructions");
  }

  /**
   * Ends the game and shows game over screen
   */
  endGame() {
    if (this.state.isGameOver) return;

    this.state.isRunning = false;
    this.state.isGameOver = true;

    const gameContainer = document.getElementById("game-container");
    if (gameContainer) {
      gameContainer.classList.remove("playing");
    }

    const isNewHighScore = Utils.setHighScore(this.state.score);

    this.state.highScore = Utils.getHighScore();

    this.ui.showGameOver(
      this.state.score,
      this.state.highScore,
      isNewHighScore
    );

    this.ui.showRestartHint();

    if (Assets.playSfx) {
      Assets.playSfx("gameOver");
    }

    if (Assets.stopMusic) {
      Assets.stopMusic();
    }

    if (isNewHighScore) {
      this.ui.addEffect("confetti", 3000);
    }
  }

  /**
   * Main game loop that handles timing and rendering
   * @param {number} timestamp - Current timestamp from requestAnimationFrame
   */
  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    this.accumulatedTime += deltaTime;

    while (this.accumulatedTime >= this.timeStep) {
      if (!this.state.isPaused) {
        this.update(this.timeStep);
      }
      this.accumulatedTime -= this.timeStep;
    }

    this.render();

    if (this.state.isRunning) {
      this.animationFrameId = requestAnimationFrame((timestamp) =>
        this.gameLoop(timestamp)
      );
    }
  }

  /**
   * Updates game state, player, level, and power-ups
   * @param {number} deltaTime - Time since last update in ms
   */
  update(deltaTime) {
    if (!this.player || !this.level) return;

    this.player.update(deltaTime);

    const isDeadlineCaught = this.level.update(deltaTime, this.player);

    if (!this.player.isActive || isDeadlineCaught) {
      this.endGame();
      return;
    }

    this.state.score = Math.floor(this.level.distance) + this.player.score;

    this.updatePowerUps(deltaTime);

    this.updateUI();
  }

  /**
   * Updates power-up states and durations
   * @param {number} deltaTime - Time since last update in ms
   */
  updatePowerUps(deltaTime) {
    if (this.player.state.hasSpeedBoost) {
      this.state.coffeeBoost = (this.player.speedBoostDuration / 12000) * 100;
      this.state.powerUps.coffee = this.player.speedBoostDuration;
    } else {
      this.state.coffeeBoost = 0;
      this.state.powerUps.coffee = 0;
    }

    if (this.player.invincible) {
      this.state.powerUps.invincibility = this.player.invincibilityDuration;
    } else {
      this.state.powerUps.invincibility = 0;
    }

    this.state.powerUps.gitCommits = this.player.gitCommits;

    this.state.deadlineProximity = this.level.getDeadlineProximity();
  }

  /**
   * Updates UI elements with current game state
   */
  updateUI() {
    this.ui.updateHUD({
      score: this.state.score,
      coffeeBoost: this.state.coffeeBoost,
      deadlineProximity: this.state.deadlineProximity,
      powerUps: this.state.powerUps,
    });

    if (this.level.isDeadlineWarning()) {
      this.ui.addEffect("flash", 500);
    }
  }

  /**
   * Renders the game by drawing level and player
   */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.level) {
      this.level.draw(this.ctx);
    }

    if (this.player) {
      this.player.draw(this.ctx);
    }

    if (window.DEBUG_MODE) {
      this.drawDebugInfo();
    }
  }

  /**
   * Draws debug information when DEBUG_MODE is enabled
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
   * Resizes canvas to fit window and updates ground positions
   */
  resizeCanvas() {
    const container = document.getElementById("game-container");
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.canvas.width = containerWidth;
    this.canvas.height = containerHeight;

    if (this.level) {
      this.level.groundY = this.canvas.height - 50;
    }

    if (this.player) {
      this.player.groundY = this.canvas.height - 50;

      if (!this.player.state.isJumping) {
        this.player.y = this.player.groundY - this.player.height;
      }
    }
  }

  /**
   * Handles power-up collision effects
   * @param {Object} powerUp - The power-up object that was collected
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
   * Uses a git commit to provide temporary invincibility
   * @returns {boolean} Whether a git commit was successfully used
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
