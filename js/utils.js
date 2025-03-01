/**
 * Utility functions for Sonic the Developer game
 */

class Utils {
  /**
   * Get high score from local storage
   * @returns {number} High score
   */
  static getHighScore() {
    const highScore = localStorage.getItem("sonicDevHighScore");
    return highScore ? parseInt(highScore, 10) : 0;
  }

  /**
   * Set high score in local storage
   * @param {number} score - Score to save
   */
  static setHighScore(score) {
    const currentHighScore = this.getHighScore();
    if (score > currentHighScore) {
      localStorage.setItem("sonicDevHighScore", score.toString());
      return true;
    }
    return false;
  }

  /**
   * Format number with commas for display
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  /**
   * Check if two rectangles overlap (collision detection)
   * @param {Object} rect1 - First rectangle {x, y, width, height}
   * @param {Object} rect2 - Second rectangle {x, y, width, height}
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
   * Calculate distance between two points
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
   * Get random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Detect mobile device
   * @returns {boolean} True if mobile device
   */
  static isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Detect touch screen
   * @returns {boolean} True if touch screen
   */
  static isTouchScreen() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Preload images
   * @param {string[]} urls - Array of image URLs
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
   * Ease in out function for smooth animations
   * @param {number} t - Current time (0-1)
   * @returns {number} Eased value
   */
  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
}
