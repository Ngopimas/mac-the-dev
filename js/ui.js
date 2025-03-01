/**
 * UI management for Sonic the Developer game
 */

class UI {
  /**
   * Create a new UI manager
   */
  constructor() {
    // UI elements
    this.startScreen = document.getElementById("start-screen");
    this.gameOverScreen = document.getElementById("game-over-screen");
    this.instructionsScreen = document.getElementById("instructions-screen");
    this.hud = document.getElementById("hud");
    this.helpButton = document.getElementById("help-button");
    this.pauseButton = document.getElementById("pause-button");
    this.pauseMessage = document.getElementById("pause-message");

    // HUD elements
    this.scoreElement = document.getElementById("score");
    this.finalScoreElement = document.getElementById("final-score");
    this.highScoreElement = document.getElementById("high-score");
    this.coffeeLevel = document.getElementById("coffee-level");
    this.deadlineBar = document.getElementById("deadline-bar");
    this.restartHintElement = document.getElementById("restart-hint");

    // Power-up indicators container
    this.powerUpIndicatorsContainer = document.getElementById(
      "power-up-indicators"
    );

    // Power-up indicators
    this.powerUpIndicators = {
      coffee: null,
      stackoverflow: null,
      gitCommit: null,
    };

    // Buttons
    this.startButton = document.getElementById("start-button");
    this.restartButton = document.getElementById("restart-button");
    this.instructionsButton = document.getElementById("instructions-button");
    this.backButton = document.getElementById("back-button");

    // Initialize UI
    this.initialize();
  }

  /**
   * Initialize UI elements and event listeners
   */
  initialize() {
    // Show start screen
    this.showScreen("start");

    // Create power-up indicators
    this.createPowerUpIndicators();

    // Add high score element to start screen if it doesn't exist
    if (!this.highScoreElement) {
      const highScoreContainer = document.createElement("div");
      highScoreContainer.className = "high-score-container";

      this.highScoreElement = document.createElement("span");
      this.highScoreElement.id = "high-score";

      const highScoreText = document.createElement("p");
      highScoreText.textContent = "High Score: ";
      highScoreText.appendChild(this.highScoreElement);

      highScoreContainer.appendChild(highScoreText);
      this.startScreen.appendChild(highScoreContainer);

      // Update high score display
      this.updateHighScore(Utils.getHighScore());
    }

    // Add new high score message to game over screen
    if (!document.getElementById("new-high-score")) {
      const newHighScoreMsg = document.createElement("p");
      newHighScoreMsg.id = "new-high-score";
      newHighScoreMsg.className = "new-high-score hidden";
      newHighScoreMsg.textContent = "NEW HIGH SCORE!";

      // Insert after final score
      const finalScoreElement = document.getElementById("final-score");
      if (finalScoreElement && finalScoreElement.parentNode) {
        finalScoreElement.parentNode.parentNode.insertBefore(
          newHighScoreMsg,
          finalScoreElement.parentNode.nextSibling
        );
      }
    }
  }

  /**
   * Create power-up indicators in the HUD
   */
  createPowerUpIndicators() {
    // Check if power-up indicators container exists
    if (!this.powerUpIndicatorsContainer) {
      console.error("Power-up indicators container not found in the DOM");
      return;
    }

    // Create coffee indicator if it doesn't exist
    if (!this.powerUpIndicators.coffee) {
      const coffeeIndicator = document.createElement("div");
      coffeeIndicator.className = "power-up-indicator coffee hidden";
      coffeeIndicator.innerHTML =
        '<span class="icon">☕</span><span class="timer"></span>';
      this.powerUpIndicatorsContainer.appendChild(coffeeIndicator);
      this.powerUpIndicators.coffee = coffeeIndicator;
    }

    // Create Stack Overflow indicator if it doesn't exist
    if (!this.powerUpIndicators.stackoverflow) {
      const soIndicator = document.createElement("div");
      soIndicator.className = "power-up-indicator stackoverflow hidden";
      soIndicator.innerHTML =
        '<span class="icon">🛡️</span><span class="timer"></span>';
      this.powerUpIndicatorsContainer.appendChild(soIndicator);
      this.powerUpIndicators.stackoverflow = soIndicator;
    }

    // Create Git Commit indicator if it doesn't exist
    if (!this.powerUpIndicators.gitCommit) {
      const gitIndicator = document.createElement("div");
      gitIndicator.className = "power-up-indicator git-commit hidden";
      gitIndicator.innerHTML =
        '<span class="icon">📌</span><span class="count"></span>';
      this.powerUpIndicatorsContainer.appendChild(gitIndicator);
      this.powerUpIndicators.gitCommit = gitIndicator;
    }
  }

  /**
   * Set up button event listeners
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onStart - Called when start button is clicked
   * @param {Function} callbacks.onRestart - Called when restart button is clicked
   */
  setupButtons(callbacks) {
    // Start button
    if (this.startButton) {
      this.startButton.addEventListener("click", () => {
        callbacks.onStart();
      });
    }

    // Restart button
    if (this.restartButton) {
      this.restartButton.addEventListener("click", () => {
        callbacks.onRestart();
      });
    }

    // Instructions button
    if (this.instructionsButton) {
      this.instructionsButton.addEventListener("click", () => {
        this.showScreen("instructions");
      });
    }

    // Back button
    if (this.backButton) {
      this.backButton.addEventListener("click", () => {
        this.showScreen("start");
      });
    }
  }

  /**
   * Show a specific screen
   * @param {string} screenName - Screen to show ('start', 'game', 'gameOver', 'instructions')
   */
  showScreen(screenName) {
    // Hide all screens
    if (this.startScreen) this.startScreen.classList.add("hidden");
    if (this.gameOverScreen) this.gameOverScreen.classList.add("hidden");
    if (this.instructionsScreen)
      this.instructionsScreen.classList.add("hidden");
    if (this.hud) this.hud.classList.add("hidden");
    if (this.pauseMessage) this.pauseMessage.classList.add("hidden");

    // Hide control buttons by default
    if (this.helpButton) this.helpButton.classList.add("hidden");
    if (this.pauseButton) this.pauseButton.classList.add("hidden");

    // Show requested screen
    switch (screenName) {
      case "start":
        if (this.startScreen) this.startScreen.classList.remove("hidden");
        break;

      case "game":
        if (this.hud) this.hud.classList.remove("hidden");
        if (this.helpButton) this.helpButton.classList.remove("hidden");
        if (this.pauseButton) this.pauseButton.classList.remove("hidden");
        break;

      case "gameOver":
        if (this.gameOverScreen) this.gameOverScreen.classList.remove("hidden");
        break;

      case "instructions":
        if (this.instructionsScreen)
          this.instructionsScreen.classList.remove("hidden");
        break;
    }
  }

  /**
   * Update HUD elements
   * @param {Object} gameState - Current game state
   * @param {number} gameState.score - Player score
   * @param {number} gameState.coffeeBoost - Coffee boost percentage (0-100)
   * @param {number} gameState.deadlineProximity - Deadline proximity percentage (0-100)
   * @param {Object} [gameState.powerUps] - Power-up states
   */
  updateHUD(gameState) {
    // Update score
    if (this.scoreElement) {
      this.scoreElement.textContent = Utils.formatNumber(gameState.score);
    }

    // Update coffee meter
    if (this.coffeeLevel) {
      this.coffeeLevel.style.width = `${gameState.coffeeBoost}%`;
    }

    // Update coffee indicator
    if (
      gameState.powerUps &&
      gameState.powerUps.coffee > 0 &&
      this.powerUpIndicators.coffee
    ) {
      this.powerUpIndicators.coffee.classList.remove("hidden");
      const timerElement =
        this.powerUpIndicators.coffee.querySelector(".timer");
      if (timerElement) {
        timerElement.textContent =
          Math.ceil(gameState.powerUps.coffee / 1000) + "s";
      }
    } else if (this.powerUpIndicators.coffee) {
      this.powerUpIndicators.coffee.classList.add("hidden");
    }

    // Update Stack Overflow indicator
    if (
      gameState.powerUps &&
      gameState.powerUps.invincibility > 0 &&
      this.powerUpIndicators.stackoverflow
    ) {
      this.powerUpIndicators.stackoverflow.classList.remove("hidden");
      const timerElement =
        this.powerUpIndicators.stackoverflow.querySelector(".timer");
      if (timerElement) {
        timerElement.textContent =
          Math.ceil(gameState.powerUps.invincibility / 1000) + "s";
      }
    } else if (this.powerUpIndicators.stackoverflow) {
      this.powerUpIndicators.stackoverflow.classList.add("hidden");
    }

    // Update Git Commit indicator
    if (
      gameState.powerUps &&
      gameState.powerUps.gitCommits > 0 &&
      this.powerUpIndicators.gitCommit
    ) {
      this.powerUpIndicators.gitCommit.classList.remove("hidden");
      const countElement =
        this.powerUpIndicators.gitCommit.querySelector(".count");
      if (countElement) {
        countElement.textContent = "×" + gameState.powerUps.gitCommits;
      }
    } else if (this.powerUpIndicators.gitCommit) {
      this.powerUpIndicators.gitCommit.classList.add("hidden");
    }

    // Update deadline indicator
    if (this.deadlineBar) {
      this.deadlineBar.style.width = `${gameState.deadlineProximity}%`;

      // Add warning class to deadline bar when close to catching up
      if (gameState.deadlineProximity >= 70) {
        this.deadlineBar.classList.add("warning");
      } else {
        this.deadlineBar.classList.remove("warning");
      }
    }
  }

  /**
   * Update high score display
   * @param {number} highScore - High score to display
   */
  updateHighScore(highScore) {
    if (this.highScoreElement) {
      this.highScoreElement.textContent = Utils.formatNumber(highScore);
    }
  }

  /**
   * Show game over screen with final score
   * @param {number} score - Final score
   * @param {number} highScore - High score
   * @param {boolean} isNewHighScore - Whether this is a new high score
   */
  showGameOver(score, highScore, isNewHighScore) {
    // Update final score
    this.finalScoreElement.textContent = Utils.formatNumber(score);

    // Show new high score message if applicable
    const newHighScoreElement = document.getElementById("new-high-score");
    if (newHighScoreElement) {
      if (isNewHighScore) {
        newHighScoreElement.classList.remove("hidden");
        this.addEffect("celebration", 2000);
      } else {
        newHighScoreElement.classList.add("hidden");
      }
    }

    // Update high score
    this.updateHighScore(highScore);

    // Show game over screen
    this.showScreen("gameOver");
  }

  /**
   * Add a visual effect to the screen
   * @param {string} effectType - Type of effect ('flash', 'shake', 'slowmo', 'celebration')
   * @param {number} duration - Effect duration in ms
   */
  addEffect(effectType, duration) {
    const container = document.getElementById("game-container");

    switch (effectType) {
      case "flash":
        // Add flash class
        container.classList.add("flash");

        // Remove class after duration
        setTimeout(() => {
          container.classList.remove("flash");
        }, duration);
        break;

      case "shake":
        // Add shake class
        container.classList.add("shake");

        // Remove class after duration
        setTimeout(() => {
          container.classList.remove("shake");
        }, duration);
        break;

      case "slowmo":
        // Add slowmo class
        container.classList.add("slowmo");

        // Remove class after duration
        setTimeout(() => {
          container.classList.remove("slowmo");
        }, duration);
        break;

      case "celebration":
        // Create confetti effect for new high score
        this.createConfetti();
        break;
    }
  }

  /**
   * Create confetti effect for celebration
   */
  createConfetti() {
    const container = document.getElementById("game-container");

    // Create 50 confetti particles
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "confetti";

      // Random position, color, and animation delay
      const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      const left = Math.random() * 100;
      const animationDelay = Math.random() * 2;

      confetti.style.backgroundColor = color;
      confetti.style.left = `${left}%`;
      confetti.style.animationDelay = `${animationDelay}s`;

      container.appendChild(confetti);

      // Remove after animation
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }
  }

  /**
   * Show game UI and hide other screens
   */
  showGameUI() {
    this.showScreen("game");
  }

  /**
   * Hide game over screen
   */
  hideGameOver() {
    this.gameOverScreen.classList.add("hidden");

    // Hide new high score message
    const newHighScoreElement = document.getElementById("new-high-score");
    if (newHighScoreElement) {
      newHighScoreElement.classList.add("hidden");
    }
  }

  /**
   * Show restart hint on game over screen
   */
  showRestartHint() {
    if (this.restartHintElement) {
      this.restartHintElement.classList.remove("hidden");
    }
  }
}
