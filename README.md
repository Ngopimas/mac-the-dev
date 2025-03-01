# Sonic the Developer

A browser-based endless runner game that reimagines the classic Sonic gameplay within a software development theme. Players control a developer character racing against deadlines while collecting coffee cups for speed boosts and avoiding bugs and technical obstacles.

## Play the Game

1. Clone this repository
2. Open `index.html` in your browser
3. Click "START GAME" to begin
4. Race against the deadline and collect resources!

## Game Controls

- **Jump**: Click, tap, Space bar, or Up arrow
- **Double Jump**: Double-click, double-tap, or press Space/Up twice quickly
- **Slide**: Press Down arrow or tap the bottom part of the screen on mobile
- **Pause**: Press P or Escape key
- **Help**: Click the "?" button in the top-right corner or press H key
- **Restart**: Press Space or Enter key when game over, or click the "TRY AGAIN" button

## Features

- Endless runner gameplay with increasing difficulty
- Software development themed obstacles and collectibles
- Speed boosts from coffee
- Invincibility from Stack Overflow answers
- Checkpoints from Git commits
- Points from code snippets
- Deadline mechanic that approaches if you slow down
- Always-available help button that pauses the game
- Quick restart with keyboard after game over
- Beginner-friendly first 10 seconds with reduced difficulty
- Visual distinction between collectibles (circles) and obstacles (rectangles)

## Game Elements

### Collectibles (Collect These - Circular Shapes)

- **Coffee Cups** (Brown Circle): Provide speed boost for 5 seconds
- **Stack Overflow Answers** (Orange Circle): Grant temporary invincibility
- **Git Commits** (Green Circle): Serve as checkpoints if player dies
- **Code Snippets** (White Circle): Basic scoring item

### Obstacles (Avoid These - Rectangular Shapes)

- **Bugs** (Red Rectangle): Moving enemies that crash your character
- **Merge Conflicts** (Orange-Red Rectangle): Larger obstacles that crash your character
- **Meetings** (Dark Red Rectangle): Slow the player down if hit
- **Technical Debt** (Dark Red Rectangle): Grows larger over time and crashes your character

## Gameplay Tips

- The game starts with a 10-second grace period where obstacles are fewer and the deadline moves very slowly
- After the initial grace period, difficulty gradually increases
- Circular objects are always beneficial - collect them!
- Rectangular objects with warning stripes are harmful - avoid them!

## Technical Details

- Built with vanilla JavaScript, HTML5 Canvas, and CSS
- No external libraries or frameworks required
- Responsive design works on both desktop and mobile devices
- Local storage for saving high scores

## Development

This game was built as an MVP based on the product requirements document. Future enhancements could include:

- Additional character customization
- More environment themes
- Sound effects and music
- Online leaderboards
- Progressive Web App implementation

## License

This project is open source and available under the MIT License.

## Credits

Created by [Your Name] as a fun project for developers who need a quick break from coding!
