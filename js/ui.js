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

    // HUD elements
    this.scoreElement = document.getElementById("score");
    this.finalScoreElement = document.getElementById("final-score");
    this.coffeeLevel = document.getElementById("coffee-level");
    this.deadlineBar = document.getElementById("deadline-bar");
    this.restartHintElement = document.getElementById("restart-hint");

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
  }

  /**
   * Set up button event listeners
   * @param {Object} callbacks - Callback functions
   * @param {Function} callbacks.onStart - Called when start button is clicked
   * @param {Function} callbacks.onRestart - Called when restart button is clicked
   */
  setupButtons(callbacks) {
    // Start button
    this.startButton.addEventListener("click", () => {
      callbacks.onStart();
    });

    // Restart button
    this.restartButton.addEventListener("click", () => {
      callbacks.onRestart();
    });

    // Instructions button
    this.instructionsButton.addEventListener("click", () => {
      this.showScreen("instructions");
    });

    // Back button
    this.backButton.addEventListener("click", () => {
      this.showScreen("start");
    });
  }

  /**
   * Show a specific screen
   * @param {string} screenName - Screen to show ('start', 'game', 'gameOver', 'instructions')
   */
  showScreen(screenName) {
    // Hide all screens
    this.startScreen.classList.add("hidden");
    this.gameOverScreen.classList.add("hidden");
    this.instructionsScreen.classList.add("hidden");
    this.hud.classList.add("hidden");

    // Show requested screen
    switch (screenName) {
      case "start":
        this.startScreen.classList.remove("hidden");
        this.helpButton.classList.add("hidden"); // Hide help button on start screen
        break;

      case "game":
        this.hud.classList.remove("hidden");
        this.helpButton.classList.remove("hidden"); // Show help button during game
        break;

      case "gameOver":
        this.gameOverScreen.classList.remove("hidden");
        this.helpButton.classList.add("hidden"); // Hide help button on game over
        break;

      case "instructions":
        this.instructionsScreen.classList.remove("hidden");
        this.helpButton.classList.add("hidden"); // Hide help button on instructions
        break;
    }
  }

  /**
   * Update HUD elements
   * @param {Object} gameState - Current game state
   * @param {number} gameState.score - Player score
   * @param {number} gameState.coffeeBoost - Coffee boost percentage (0-100)
   * @param {number} gameState.deadlineProximity - Deadline proximity percentage (0-100)
   */
  updateHUD(gameState) {
    // Update score
    this.scoreElement.textContent = Utils.formatNumber(gameState.score);

    // Update coffee meter
    this.coffeeLevel.style.width = `${gameState.coffeeBoost}%`;

    // Update deadline indicator
    this.deadlineBar.style.width = `${gameState.deadlineProximity}%`;
  }

  /**
   * Show game over screen with final score
   * @param {number} score - Final score
   */
  showGameOver(score) {
    // Update final score
    this.finalScoreElement.textContent = Utils.formatNumber(score);

    // Show game over screen
    this.showScreen("gameOver");
  }

  /**
   * Add a visual effect to the screen
   * @param {string} effectType - Type of effect ('flash', 'shake', 'slowmo')
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
