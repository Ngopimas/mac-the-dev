/**
 * Utility functions for Sonic the Developer game
 */

const Utils = {
  /**
   * Check if two rectangles are colliding
   * @param {Object} rect1 - First rectangle {x, y, width, height}
   * @param {Object} rect2 - Second rectangle {x, y, width, height}
   * @returns {boolean} - True if colliding, false otherwise
   */
  checkCollision: function (rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  },

  /**
   * Generate a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Random integer
   */
  randomInt: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Clamped value
   */
  clamp: function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  },

  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} - Interpolated value
   */
  lerp: function (start, end, t) {
    return start + (end - start) * t;
  },

  /**
   * Save high score to local storage
   * @param {number} score - Score to save
   */
  saveHighScore: function (score) {
    const currentHighScore = localStorage.getItem("sonicDevHighScore") || 0;
    if (score > currentHighScore) {
      localStorage.setItem("sonicDevHighScore", score);
    }
  },

  /**
   * Get high score from local storage
   * @returns {number} - High score
   */
  getHighScore: function () {
    return parseInt(localStorage.getItem("sonicDevHighScore") || 0);
  },

  /**
   * Preload an image
   * @param {string} src - Image source URL
   * @returns {Promise} - Promise that resolves when image is loaded
   */
  preloadImage: function (src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  },

  /**
   * Preload an audio file
   * @param {string} src - Audio source URL
   * @returns {Promise} - Promise that resolves when audio is loaded
   */
  preloadAudio: function (src) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => resolve(audio);
      audio.onerror = reject;
      audio.src = src;
    });
  },

  /**
   * Detect mobile device
   * @returns {boolean} - True if mobile device, false otherwise
   */
  isMobileDevice: function () {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * Format number with commas
   * @param {number} num - Number to format
   * @returns {string} - Formatted number
   */
  formatNumber: function (num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
};
