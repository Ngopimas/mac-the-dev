/**
 * Main entry point for Mac the Developer game
 */

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Create and initialize game
  const game = new Game();

  // Add CSS effects for visual feedback
  addCssEffects();
});

/**
 * Add CSS effects for visual feedback
 */
function addCssEffects() {
  // Create a style element
  const style = document.createElement("style");

  // Add CSS rules
  style.textContent = `
        /* Flash effect */
        @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .flash {
            animation: flash 0.3s ease-in-out;
        }
        
        /* Shake effect */
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .shake {
            animation: shake 0.5s ease-in-out;
        }
        
        /* Slow motion effect */
        @keyframes slowmo {
            0%, 100% { filter: blur(0); }
            50% { filter: blur(2px); }
        }
        
        .slowmo {
            animation: slowmo 1s ease-in-out;
        }
    `;

  // Add style element to document head
  document.head.appendChild(style);
}
