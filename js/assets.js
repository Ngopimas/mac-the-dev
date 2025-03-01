/**
 * Asset management for Sonic the Developer game
 */

const Assets = {
  // Image assets
  images: {
    // Player sprites
    player: {
      run: null,
      jump: null,
      slide: null,
      crash: null,
    },

    // Obstacles
    obstacles: {
      bug: null,
      mergeConflict: null,
      meeting: null,
      technicalDebt: null,
    },

    // Collectibles
    collectibles: {
      coffee: null,
      stackOverflow: null,
      gitCommit: null,
      codeSnippet: null,
    },

    // Backgrounds
    backgrounds: {
      legacy: null,
      startup: null,
      enterprise: null,
    },
  },

  // Audio assets
  audio: {
    // Sound effects
    sfx: {
      jump: null,
      collect: null,
      crash: null,
      powerup: null,
      deadline: null,
      gameOver: null,
    },

    // Music
    music: {
      main: null,
      gameOver: null,
    },
  },

  /**
   * Load all game assets
   * @returns {Promise} - Promise that resolves when all assets are loaded
   */
  loadAll: async function () {
    try {
      // Create placeholder sprites for MVP
      // In a real implementation, we would load actual image files
      this.createPlaceholderSprites();

      // Load audio (commented out for MVP)
      // await this.loadAudio();

      console.log("All assets loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading assets:", error);
      return false;
    }
  },

  /**
   * Create placeholder sprites for MVP
   * This allows us to start development without waiting for actual art assets
   */
  createPlaceholderSprites: function () {
    // Create canvas elements for each sprite

    // Player sprites
    this.images.player.run = this.createColorSprite("#00aaff", 50, 50);
    this.images.player.jump = this.createColorSprite("#0088cc", 50, 50);
    this.images.player.slide = this.createColorSprite("#006699", 50, 30);
    this.images.player.crash = this.createColorSprite("#ff3333", 50, 50);

    // Obstacle sprites (rectangular shapes)
    this.images.obstacles.bug = this.createRectangleSprite("#ff0000", 40, 40);
    this.images.obstacles.mergeConflict = this.createRectangleSprite(
      "#ff6600",
      60,
      60
    );
    this.images.obstacles.meeting = this.createRectangleSprite(
      "#cc3300",
      80,
      40
    );
    this.images.obstacles.technicalDebt = this.createRectangleSprite(
      "#990000",
      50,
      70
    );

    // Collectible sprites (circular shapes)
    this.images.collectibles.coffee = this.createCircleSprite("#8b4513", 30);
    this.images.collectibles.stackOverflow = this.createCircleSprite(
      "#f48024",
      30
    );
    this.images.collectibles.gitCommit = this.createCircleSprite("#6cc644", 30);
    this.images.collectibles.codeSnippet = this.createCircleSprite(
      "#ffffff",
      20
    );

    // Background sprites (small versions for testing)
    this.images.backgrounds.legacy = this.createGradientSprite(
      "#000033",
      "#330033",
      100,
      100
    );
    this.images.backgrounds.startup = this.createGradientSprite(
      "#003366",
      "#0099cc",
      100,
      100
    );
    this.images.backgrounds.enterprise = this.createGradientSprite(
      "#333333",
      "#666666",
      100,
      100
    );
  },

  /**
   * Create a solid color sprite
   * @param {string} color - CSS color
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the sprite
   */
  createColorSprite: function (color, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    return canvas;
  },

  /**
   * Create a rectangular sprite with rounded corners
   * @param {string} color - CSS color
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the sprite
   */
  createRectangleSprite: function (color, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = color;

    // Draw rectangle with slightly rounded corners
    const radius = 5;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(width - radius, 0);
    ctx.quadraticCurveTo(width, 0, width, radius);
    ctx.lineTo(width, height - radius);
    ctx.quadraticCurveTo(width, height, width - radius, height);
    ctx.lineTo(radius, height);
    ctx.quadraticCurveTo(0, height, 0, height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();

    // Add a warning pattern (diagonal stripes)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
    ctx.lineWidth = 3;

    for (let i = -width; i < width * 2; i += 10) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + height, height);
      ctx.stroke();
    }

    return canvas;
  },

  /**
   * Create a circular sprite
   * @param {string} color - CSS color
   * @param {number} diameter - Circle diameter
   * @returns {HTMLCanvasElement} - Canvas element with the sprite
   */
  createCircleSprite: function (color, diameter) {
    const canvas = document.createElement("canvas");
    canvas.width = diameter;
    canvas.height = diameter;

    const ctx = canvas.getContext("2d");

    // Draw outer glow
    const gradient = ctx.createRadialGradient(
      diameter / 2,
      diameter / 2,
      (diameter / 2) * 0.7,
      diameter / 2,
      diameter / 2,
      diameter / 2
    );
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.3)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(diameter / 2, diameter / 2, diameter / 2, 0, Math.PI * 2);
    ctx.fill();

    // Add highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.beginPath();
    ctx.arc(diameter / 3, diameter / 3, diameter / 6, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  },

  /**
   * Create a gradient sprite
   * @param {string} color1 - Start color
   * @param {string} color2 - End color
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the sprite
   */
  createGradientSprite: function (color1, color2, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    return canvas;
  },

  /**
   * Load audio assets
   * @returns {Promise} - Promise that resolves when all audio is loaded
   */
  loadAudio: async function () {
    // In a real implementation, we would load actual audio files
    // For MVP, we'll just create empty Audio objects

    // Sound effects
    this.audio.sfx.jump = new Audio();
    this.audio.sfx.collect = new Audio();
    this.audio.sfx.crash = new Audio();
    this.audio.sfx.powerup = new Audio();
    this.audio.sfx.deadline = new Audio();
    this.audio.sfx.gameOver = new Audio();

    // Music
    this.audio.music.main = new Audio();
    this.audio.music.gameOver = new Audio();

    return true;
  },

  /**
   * Play a sound effect
   * @param {string} sfxName - Name of the sound effect to play
   */
  playSfx: function (sfxName) {
    if (this.audio.sfx[sfxName]) {
      this.audio.sfx[sfxName].currentTime = 0;
      this.audio.sfx[sfxName].play().catch((e) => {
        // Ignore autoplay errors
        console.log("Audio autoplay prevented:", e);
      });
    }
  },

  /**
   * Play background music
   * @param {string} musicName - Name of the music track to play
   */
  playMusic: function (musicName) {
    if (this.audio.music[musicName]) {
      this.audio.music[musicName].loop = true;
      this.audio.music[musicName].play().catch((e) => {
        // Ignore autoplay errors
        console.log("Audio autoplay prevented:", e);
      });
    }
  },

  /**
   * Stop background music
   * @param {string} musicName - Name of the music track to stop
   */
  stopMusic: function (musicName) {
    if (this.audio.music[musicName]) {
      this.audio.music[musicName].pause();
      this.audio.music[musicName].currentTime = 0;
    }
  },
};
