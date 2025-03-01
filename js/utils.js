/**
 * Utility functions
 */

class Utils {
  /**
   * Retrieves the stored high score from local storage
   * @returns {number} The current high score or 0 if none exists
   */
  static getHighScore() {
    const highScore = localStorage.getItem("MacDevHighScore");
    return highScore ? parseInt(highScore, 10) : 0;
  }

  /**
   * Updates the high score in local storage if the new score is higher
   * @param {number} score - The score to compare with the current high score
   * @returns {boolean} True if a new high score was set, false otherwise
   */
  static setHighScore(score) {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem("MacDevHighScore", score.toString());
      return true;
    }
    return false;
  }

  /**
   * Adds thousands separators to numbers for better readability
   * @param {number} num - Number to format
   * @returns {string} Formatted number with commas
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Determines if two rectangles overlap for collision detection
   * @param {Object} rect1 - First rectangle
   * @param {number} rect1.x - X coordinate of first rectangle
   * @param {number} rect1.y - Y coordinate of first rectangle
   * @param {number} rect1.width - Width of first rectangle
   * @param {number} rect1.height - Height of first rectangle
   * @param {Object} rect2 - Second rectangle
   * @param {number} rect2.x - X coordinate of second rectangle
   * @param {number} rect2.y - Y coordinate of second rectangle
   * @param {number} rect2.width - Width of second rectangle
   * @param {number} rect2.height - Height of second rectangle
   * @returns {boolean} True if rectangles overlap
   */
  static checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Calculates the Euclidean distance between two points
   * @param {number} x1 - X coordinate of first point
   * @param {number} y1 - Y coordinate of first point
   * @param {number} x2 - X coordinate of second point
   * @param {number} y2 - Y coordinate of second point
   * @returns {number} Distance between points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Generates a random integer within a specified range
   * @param {number} min - Minimum value (inclusive)
   * @param {number} max - Maximum value (inclusive)
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Checks if the user is on a mobile device based on user agent
   * @returns {boolean} True if on a mobile device
   */
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Determines if the device has touch capabilities
   * @returns {boolean} True if touch is supported
   */
  static isTouchScreen() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Loads multiple images in advance to prevent rendering delays
   * @param {string[]} urls - Array of image URLs to preload
   * @returns {Promise} Promise that resolves when all images are loaded
   */
  static preloadImages(urls) {
    const promises = urls.map((url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(`Failed to load image: ${url}`);
        img.src = url;
      });
    });
    return Promise.all(promises);
  }

  /**
   * Provides a smooth transition curve for animations
   * @param {number} t - Current time/progress (0-1)
   * @returns {number} Eased value for smoother animation
   */
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Restricts a value to be within a specified range
   * @param {number} value - Value to constrain
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @returns {number} Value constrained between min and max
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}
