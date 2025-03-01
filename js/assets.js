/**
 * Asset management for Mac the Developer game
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
      this.createPlaceholderSprites();

      // Initialize audio placeholders
      this.initAudioPlaceholders();

      console.log("All assets loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading assets:", error);
      // Even if there's an error, create emergency placeholders to prevent game from breaking
      this.createEmergencyPlaceholders();
      return true; // Return true anyway to allow game to start
    }
  },

  /**
   * Create emergency placeholder sprites if normal loading fails
   */
  createEmergencyPlaceholders: function () {
    // Create player character

    // Laptop character
    this.images.player.run = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#00aaff",
      50,
      50
    );
    this.images.player.jump = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#0088cc",
      50,
      50
    );
    this.images.player.slide = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#006699",
      50,
      30
    );
    this.images.player.crash = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#ff3333",
      50,
      50
    );

    // Create basic colored rectangles for other assets
    const canvas = document.createElement("canvas");
    canvas.width = 50;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(0, 0, 50, 50);

    // Assign to obstacle image slots
    this.images.obstacles.bug = canvas;
    this.images.obstacles.mergeConflict = canvas;
    this.images.obstacles.meeting = canvas;
    this.images.obstacles.technicalDebt = canvas;

    // Assign to collectible image slots
    this.images.collectibles.coffee = canvas;
    this.images.collectibles.stackOverflow = canvas;
    this.images.collectibles.gitCommit = canvas;
    this.images.collectibles.codeSnippet = canvas;

    // Assign to background image slots
    this.images.backgrounds.legacy = canvas;
    this.images.backgrounds.startup = canvas;
    this.images.backgrounds.enterprise = canvas;
  },

  /**
   * Initialize audio placeholders
   */
  initAudioPlaceholders: function () {
    // Create dummy audio play function
    this.playSfx = function (sfxName) {
      console.log(`Playing sound effect: ${sfxName}`);
    };

    this.playMusic = function (musicName) {
      console.log(`Playing music: ${musicName}`);
    };

    this.stopMusic = function () {
      console.log("Stopping music");
    };
  },

  /**
   * Create a laptop-shaped sprite for the player character
   * @param {string} baseColor - Base color for the laptop
   * @param {string} screenColor - Color for the laptop screen
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the laptop sprite
   */
  createLaptopSprite: function (baseColor, screenColor, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Add shadow effect
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Check if this is a sliding state (closed laptop)
    const isSliding = height <= 35;

    if (isSliding) {
      // SLIDING STATE - CLOSED

      // Laptop dimensions - make it more sleek
      const laptopWidth = width * 0.85;
      const laptopHeight = height * 0.5; // Thinner profile
      const cornerRadius = 6;

      // Center the laptop horizontally and vertically
      const offsetX = (width - laptopWidth) / 2;
      const offsetY = (height - laptopHeight) / 2 + height * 0.1; // Slightly lower position

      // Draw the closed laptop body with rounded corners - sleek aluminum look
      ctx.fillStyle = baseColor;
      this.roundedRect(
        ctx,
        offsetX,
        offsetY,
        laptopWidth,
        laptopHeight,
        cornerRadius
      );

      // Add a subtle line to represent the closed seam
      ctx.strokeStyle = "#888888";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(offsetX + 5, offsetY + laptopHeight / 2);
      ctx.lineTo(offsetX + laptopWidth - 5, offsetY + laptopHeight / 2);
      ctx.stroke();

      // Add subtle shading to give 3D effect
      const topGradient = ctx.createLinearGradient(
        0,
        offsetY,
        0,
        offsetY + laptopHeight / 2
      );
      topGradient.addColorStop(0, "#dddddd"); // Lighter top
      topGradient.addColorStop(1, baseColor);

      ctx.fillStyle = topGradient;
      this.roundedRectTop(
        ctx,
        offsetX,
        offsetY,
        laptopWidth,
        laptopHeight / 2,
        cornerRadius
      );
      ctx.fill();

      // Add logo in the center (simplified)
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      const logoX = width / 2;
      const logoY = offsetY + laptopHeight / 2;
      const logoSize = width * 0.12;

      ctx.beginPath();
      ctx.arc(logoX, logoY, logoSize / 2, 0, Math.PI * 2);
      ctx.fill();

      // Add motion blur lines behind the laptop for sliding effect
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;

      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(offsetX - i * 6, offsetY + laptopHeight * 0.3);
        ctx.lineTo(offsetX - i * 12, offsetY + laptopHeight * 0.7);
        ctx.stroke();
      }

      // No shadow beneath the laptop - removing the table-like appearance
    } else {
      // OPEN LAPTOP STATES (running, jumping, crashed)

      // Better proportions - thinner and more elegant
      const laptopWidth = width * 0.9;
      const screenThickness = 2;
      const screenWidth = laptopWidth - 8;
      const hinge = height * 0.65; // Position where screen meets base
      const cornerRadius = 8;
      const baseHeight = height * 0.25; // Thinner base (less table-like)
      const screenHeight = hinge - 8;

      // Center the laptop horizontally
      const offsetX = (width - laptopWidth) / 2;

      // Reset shadow for base drawing
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;

      // Draw laptop base (bottom part) - sleeker aluminum finish
      ctx.fillStyle = baseColor;
      this.roundedRect(
        ctx,
        offsetX,
        hinge,
        laptopWidth,
        baseHeight,
        cornerRadius
      );

      // Add gradient to base for 3D effect
      const baseGradient = ctx.createLinearGradient(
        0,
        hinge,
        0,
        hinge + baseHeight
      );
      baseGradient.addColorStop(0, "#cccccc"); // Lighter top edge
      baseGradient.addColorStop(0.5, baseColor);
      baseGradient.addColorStop(1, "#999999");

      ctx.fillStyle = baseGradient;
      this.roundedRect(
        ctx,
        offsetX,
        hinge,
        laptopWidth,
        baseHeight,
        cornerRadius
      );

      // Reset shadow for cleaner lines
      ctx.shadowColor = "transparent";

      // Draw laptop screen (top part) - very thin profile like premium laptops
      ctx.fillStyle = "#888888"; // Darker for the back of the screen
      this.roundedRect(
        ctx,
        offsetX + 4,
        8,
        screenWidth,
        screenThickness,
        cornerRadius / 2
      );

      // Draw the screen sides/edges
      ctx.fillStyle = "#777777";
      // Left edge
      ctx.fillRect(offsetX + 4, 8, screenThickness, screenHeight);
      // Right edge
      ctx.fillRect(
        offsetX + 4 + screenWidth - screenThickness,
        8,
        screenThickness,
        screenHeight
      );
      // Bottom edge (connects to hinge)
      ctx.fillRect(
        offsetX + 4,
        8 + screenHeight - screenThickness,
        screenWidth,
        screenThickness
      );

      // Draw the screen back panel (aluminum)
      const screenBackGradient = ctx.createLinearGradient(
        0,
        8,
        0,
        8 + screenHeight
      );
      screenBackGradient.addColorStop(0, "#bbbbbb"); // Lighter top
      screenBackGradient.addColorStop(1, "#999999");

      ctx.fillStyle = screenBackGradient;
      this.roundedRect(
        ctx,
        offsetX + 4 + screenThickness,
        8 + screenThickness,
        screenWidth - screenThickness * 2,
        screenHeight - screenThickness * 2,
        cornerRadius / 2
      );

      // Draw hinge detail - more realistic modern laptop hinge
      const hingeGradient = ctx.createLinearGradient(
        0,
        hinge - 4,
        0,
        hinge + 2
      );
      hingeGradient.addColorStop(0, "#888888");
      hingeGradient.addColorStop(0.5, "#666666");
      hingeGradient.addColorStop(1, "#888888");

      ctx.fillStyle = hingeGradient;
      ctx.beginPath();
      ctx.rect(offsetX + 10, hinge - 4, laptopWidth - 20, 6);
      ctx.fill();

      // Draw screen display with rounded corners - make it more screen-like with proper inset
      const screenInset = 6; // Thinner bezel like modern premium laptops
      const bezelColor = "#111111"; // Black bezel around screen

      // Draw the bezel first
      ctx.fillStyle = bezelColor;

      // Screen coordinates with bezel
      const bezelLeft = offsetX + 4 + screenThickness;
      const bezelRight = offsetX + 4 + screenWidth - screenThickness;
      const bezelTop = 8 + screenThickness;
      const bezelBottom = 8 + screenHeight - screenThickness;

      this.roundedRect(
        ctx,
        bezelLeft,
        bezelTop,
        bezelRight - bezelLeft,
        bezelBottom - bezelTop,
        cornerRadius / 2
      );

      // Now draw the actual screen (inset from bezel)
      const screenLeft = bezelLeft + screenInset;
      const screenRight = bezelRight - screenInset;
      const screenTop = bezelTop + screenInset;
      const screenBottom = bezelBottom - screenInset;

      ctx.fillStyle = screenColor;
      this.roundedRect(
        ctx,
        screenLeft,
        screenTop,
        screenRight - screenLeft,
        screenBottom - screenTop,
        4 // More rounded corners for the screen
      );

      // Add screen glare/reflection - more pronounced for glass-like effect
      const gradient = ctx.createLinearGradient(
        screenLeft,
        screenTop,
        screenRight,
        screenBottom
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

      ctx.fillStyle = gradient;
      this.roundedRectTop(
        ctx,
        screenLeft,
        screenTop,
        screenRight - screenLeft,
        (screenBottom - screenTop) * 0.4,
        4
      );
      ctx.fill();

      // Add camera at the top center of the bezel - smaller like modern laptop cameras
      ctx.fillStyle = "#333333";
      ctx.beginPath();
      ctx.arc((bezelLeft + bezelRight) / 2, bezelTop + 3, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw keyboard with better detail - make it look more like a premium laptop keyboard
      const keyboardTop = hinge + 6;
      const keyboardBottom = hinge + baseHeight - 5;
      const keyboardLeft = offsetX + 8;
      const keyboardRight = offsetX + laptopWidth - 8;
      const keyboardWidth = keyboardRight - keyboardLeft;
      const keyboardHeight = keyboardBottom - keyboardTop;

      // Keyboard base (recessed area)
      const kbGradient = ctx.createLinearGradient(
        0,
        keyboardTop,
        0,
        keyboardBottom
      );
      kbGradient.addColorStop(0, "#1a1a1a");
      kbGradient.addColorStop(1, "#111111");

      ctx.fillStyle = kbGradient;
      this.roundedRect(
        ctx,
        keyboardLeft,
        keyboardTop,
        keyboardWidth,
        keyboardHeight,
        4
      );

      // Simplified keyboard - just a few key rows to match the thinner base
      const keyRows = 2;
      const keyCols = 10;
      const keySpacingX = keyboardWidth / keyCols;
      const keySpacingY = keyboardHeight / keyRows;
      const keySize = Math.min(keySpacingX, keySpacingY) * 0.8;
      const keyRadius = 2;

      for (let row = 0; row < keyRows; row++) {
        for (let col = 0; col < keyCols; col++) {
          const keyX =
            keyboardLeft + col * keySpacingX + (keySpacingX - keySize) / 2;
          const keyY =
            keyboardTop + row * keySpacingY + (keySpacingY - keySize) / 2;

          // Draw key with 3D effect and rounded corners - flatter like premium laptops
          const keyGradient = ctx.createLinearGradient(
            keyX,
            keyY,
            keyX,
            keyY + keySize
          );
          keyGradient.addColorStop(0, "#444444");
          keyGradient.addColorStop(1, "#333333");

          ctx.fillStyle = keyGradient;
          this.roundedRect(ctx, keyX, keyY, keySize, keySize, keyRadius);
        }
      }

      // Draw screen content based on state
      this.drawScreenContent(
        ctx,
        screenLeft,
        screenTop,
        screenRight - screenLeft,
        screenBottom - screenTop,
        screenColor === "#00aaff"
          ? "run"
          : screenColor === "#0088cc"
          ? "jump"
          : screenColor === "#006699"
          ? "slide"
          : screenColor === "#ff3333"
          ? "crash"
          : "run"
      );
    }

    return canvas;
  },

  /**
   * Helper function to draw a rounded rectangle
   */
  roundedRect: function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  },

  /**
   * Helper function to draw just the top part of a rounded rectangle with rounded top corners
   */
  roundedRectTop: function (ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  /**
   * Draw screen content for the laptop based on state
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - Screen X position
   * @param {number} y - Screen Y position
   * @param {number} width - Screen width
   * @param {number} height - Screen height
   * @param {string} state - Player state (run, jump, slide, crash)
   */
  drawScreenContent: function (ctx, x, y, width, height, state) {
    // Draw different content based on state
    if (state === "run") {
      // Code editor with clean text editor-like lines

      // Draw editor background
      ctx.fillStyle = "#1e1e1e"; // VS Code dark theme color
      ctx.fillRect(x, y, width, height);

      // Draw top menu bar (minimal style)
      const menuBarHeight = height * 0.08;
      ctx.fillStyle = "#2d2d2d";
      ctx.fillRect(x, y, width, menuBarHeight);

      // Line numbers column
      ctx.fillStyle = "#252526";
      ctx.fillRect(x, y + menuBarHeight, width * 0.1, height - menuBarHeight);

      // Draw consistent text editor lines
      const lineCount = 10; // Number of lines
      const lineHeight = (height - menuBarHeight) / lineCount;

      // Line numbers
      ctx.fillStyle = "#6e6e6e";
      for (let i = 0; i < lineCount; i++) {
        const lineY = y + menuBarHeight + i * lineHeight + lineHeight / 2;
        ctx.fillRect(x + width * 0.05, lineY, width * 0.03, 1);
      }

      // Code lines - all full width for consistency
      const codeColors = [
        "#569cd6",
        "#ce9178",
        "#4ec9b0",
        "#dcdcaa",
        "#9cdcfe",
      ];

      for (let i = 0; i < lineCount; i++) {
        const lineY = y + menuBarHeight + i * lineHeight + lineHeight / 2;

        // Alternate between full lines and shorter lines
        const lineWidth =
          i % 3 === 0
            ? width * 0.8 // Full line
            : width * 0.5 + Math.random() * 0.2 * width; // Shorter line

        ctx.fillStyle = codeColors[i % codeColors.length];
        ctx.fillRect(x + width * 0.12, lineY, lineWidth, 1);
      }

      // Draw cursor
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        x + width * 0.2,
        y + menuBarHeight + lineHeight * 1.5,
        1,
        lineHeight * 0.7
      );
    } else if (state === "jump") {
      // Terminal with clean text lines

      // Terminal background
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(x, y, width, height);

      // Terminal header (minimal style)
      const headerHeight = height * 0.08;
      ctx.fillStyle = "#2d2d2d";
      ctx.fillRect(x, y, width, headerHeight);

      // Draw terminal lines - clean and consistent
      const lineCount = 8;
      const lineHeight = (height - headerHeight) / lineCount;

      // Draw lines with consistent spacing
      for (let i = 0; i < lineCount; i++) {
        const lineY = y + headerHeight + i * lineHeight + lineHeight / 2;

        if (i % 2 === 0) {
          // Prompt line
          ctx.fillStyle = "#4ec9b0"; // Prompt color
          ctx.fillRect(x + 10, lineY, width * 0.05, 1);

          // Command text
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(
            x + 10 + width * 0.06,
            lineY,
            width * (0.3 + Math.random() * 0.2),
            1
          );
        } else {
          // Output line
          ctx.fillStyle = "#cccccc";
          ctx.fillRect(x + 10, lineY, width * (0.5 + Math.random() * 0.3), 1);
        }
      }

      // Cursor on the last line
      const lastLineY = y + headerHeight + (lineCount - 0.5) * lineHeight;
      ctx.fillStyle = "#4ec9b0";
      ctx.fillRect(x + 10, lastLineY, width * 0.05, 1);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 10 + width * 0.06, lastLineY, 4, 1);
    } else if (state === "crash") {
      // Error screen with clean text lines

      // Background - dark with slight gradient
      const crashGradient = ctx.createLinearGradient(x, y, x, y + height);
      crashGradient.addColorStop(0, "#000000");
      crashGradient.addColorStop(1, "#111111");

      ctx.fillStyle = crashGradient;
      ctx.fillRect(x, y, width, height);

      // Draw consistent error message lines
      const lineCount = 8;
      const lineHeight = height / lineCount;

      // Error title (red)
      ctx.fillStyle = "#ff3333";
      ctx.fillRect(x + width * 0.1, y + lineHeight, width * 0.8, 2);

      // Error details (white lines of consistent spacing)
      ctx.fillStyle = "#ffffff";
      for (let i = 2; i < lineCount - 1; i++) {
        const lineY = y + i * lineHeight;
        // Vary line lengths slightly but keep them consistent
        const lineWidth = width * (0.7 - (i % 3) * 0.1);
        ctx.fillRect(x + width * 0.1, lineY, lineWidth, 1);
      }

      // Restart message (green)
      ctx.fillStyle = "#4ec9b0";
      ctx.fillRect(
        x + width * 0.2,
        y + (lineCount - 1) * lineHeight,
        width * 0.6,
        1.5
      );
    }
  },

  /**
   * Create a developer character sprite
   * @param {string} bodyColor - Color for the body
   * @param {string} headColor - Color for the head
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the developer sprite
   */
  createDeveloperSprite: function (bodyColor, headColor, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Draw body
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.4);
    ctx.lineTo(width * 0.7, height * 0.4);
    ctx.lineTo(width * 0.65, height - 5);
    ctx.lineTo(width * 0.35, height - 5);
    ctx.closePath();
    ctx.fill();

    // Draw head
    ctx.fillStyle = headColor;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.25, width * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Draw arms
    ctx.fillStyle = bodyColor;
    // Left arm
    ctx.beginPath();
    ctx.moveTo(width * 0.3, height * 0.45);
    ctx.lineTo(width * 0.15, height * 0.6);
    ctx.lineTo(width * 0.2, height * 0.65);
    ctx.lineTo(width * 0.35, height * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(width * 0.7, height * 0.45);
    ctx.lineTo(width * 0.85, height * 0.6);
    ctx.lineTo(width * 0.8, height * 0.65);
    ctx.lineTo(width * 0.65, height * 0.5);
    ctx.closePath();
    ctx.fill();

    // Draw glasses for running state
    if (bodyColor === "#0066cc") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.4, height * 0.25);
      ctx.lineTo(width * 0.6, height * 0.25);
      ctx.stroke();

      // Draw eyes behind glasses
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(width * 0.43, height * 0.25, 2, 0, Math.PI * 2);
      ctx.arc(width * 0.57, height * 0.25, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  },

  /**
   * Create a desktop computer sprite
   * @param {string} caseColor - Color for the computer case
   * @param {string} screenColor - Color for the screen
   * @param {number} width - Sprite width
   * @param {number} height - Sprite height
   * @returns {HTMLCanvasElement} - Canvas element with the computer sprite
   */
  createComputerSprite: function (caseColor, screenColor, width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // Draw computer case (tower)
    ctx.fillStyle = caseColor;
    ctx.fillRect(width * 0.15, height * 0.3, width * 0.3, height * 0.65);

    // Draw power button
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(width * 0.3, height * 0.4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw disk drive
    ctx.fillStyle = "#444444";
    ctx.fillRect(width * 0.2, height * 0.5, width * 0.2, height * 0.05);

    // Draw monitor
    ctx.fillStyle = caseColor;
    ctx.fillRect(width * 0.5, height * 0.35, width * 0.35, height * 0.3);

    // Draw screen
    ctx.fillStyle = screenColor;
    ctx.fillRect(width * 0.55, height * 0.4, width * 0.25, height * 0.2);

    // Draw monitor stand
    ctx.fillStyle = caseColor;
    ctx.beginPath();
    ctx.moveTo(width * 0.65, height * 0.65);
    ctx.lineTo(width * 0.75, height * 0.65);
    ctx.lineTo(width * 0.8, height * 0.95);
    ctx.lineTo(width * 0.6, height * 0.95);
    ctx.closePath();
    ctx.fill();

    // Draw code on screen for running state
    if (screenColor === "#00aaff") {
      ctx.fillStyle = "#ffffff";
      // Draw code lines
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(width * 0.57, height * (0.42 + i * 0.04), width * 0.2, 1);
      }
    }

    return canvas;
  },

  /**
   * Create placeholder sprites for MVP
   * This allows us to start development without waiting for actual art assets
   */
  createPlaceholderSprites: function () {
    // Create canvas elements for each sprite

    // Laptop character - using silver aluminum color
    this.images.player.run = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color instead of dark gray
      "#00aaff",
      50,
      50
    );
    this.images.player.jump = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#0088cc",
      50,
      50
    );
    this.images.player.slide = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#006699",
      50,
      30
    );
    this.images.player.crash = this.createLaptopSprite(
      "#aaaaaa", // Silver aluminum color
      "#ff3333",
      50,
      50
    );

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
