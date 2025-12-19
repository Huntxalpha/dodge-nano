// Dodge Nano – logique du jeu

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Joueur
let playerWidth = 50;
const playerHeight = 15;
let playerX = (WIDTH - playerWidth) / 2;
const playerY = HEIGHT - playerHeight - 10;
const playerSpeed = 7;

// Obstacles
let obstacles = [];
let obstacleSpeed = 2;
let spawnInterval = 1200; // en millisecondes
let lastSpawn = 0;

// État du jeu
let score = 0;
let lives = 3;
let level = 1;
let state = 'start';

// Éléments du DOM
const startOverlay = document.getElementById('start-overlay');
const endOverlay = document.getElementById('end-overlay');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const shareButton = document.getElementById('share-button');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const finalScoreSpan = document.getElementById('final-score');

// Démarre une nouvelle partie
function startGame() {
  obstacles = [];
  obstacleSpeed = 2;
  spawnInterval = 1200;
  lastSpawn = 0;
  score = 0;
  lives = 3;
  level = 1;
  playerWidth = 50;
  playerX = (WIDTH - playerWidth) / 2;
  scoreSpan.textContent = '0';
  livesSpan.textContent = '3';
  state = 'playing';
  hideOverlay(startOverlay);
  hideOverlay(endOverlay);
  lastTime = null;
  requestAnimationFrame(gameLoop);
}

// Fin de partie
function endGame() {
  state = 'gameover';
  finalScoreSpan.textContent = Math.floor(score).toString();
  showOverlay(endOverlay);
}

// Génère un obstacle aléatoire
function spawnObstacle() {
  const width = 40;
  const height = 15;
  const x = Math.random() * (WIDTH - width);
  obstacles.push({ x, y: -height, width, height });
}

// Met à jour les obstacles
function updateObstacles(dt) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const obs = obstacles[i];
    obs.y += obstacleSpeed * dt;
    // Sortie du canvas
    if (obs.y > HEIGHT) {
      obstacles.splice(i, 1);
      score += 5;
      scoreSpan.textContent = Math.floor(score).toString();
    } else {
      // Collision avec le joueur
      if (
        obs.y + obs.height >= playerY &&
        obs.x < playerX + playerWidth &&
        obs.x + obs.width > playerX
      ) {
        obstacles.splice(i, 1);
        lives--;
        livesSpan.textContent = lives.toString();
        if (lives <= 0) {
          endGame();
        }
      }
    }
  }
}

// Ajuste la difficulté selon le score
function updateDifficulty() {
  const newLevel = Math.floor(score / 100) + 1;
  if (newLevel > level) {
    level = newLevel;
    obstacleSpeed += 0.5;
    if (spawnInterval > 400) {
      spawnInterval -= 100;
    }
    if (playerWidth > 30) {
      playerWidth -= 5;
    }
  }
}

let lastTime = null;
function gameLoop(timestamp) {
  if (state !== 'playing') return;
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 16; // normalise pour ~60 fps
  lastTime = timestamp;

  // Apparition des obstacles
  if (timestamp - lastSpawn > spawnInterval) {
    spawnObstacle();
    lastSpawn = timestamp;
  }

  // Mise à jour
  updateObstacles(dt);
  updateDifficulty();
  // Mise à jour des entrées clavier
  updatePlayerFromKeys();
  // Dessin
  draw();

  requestAnimationFrame(gameLoop);
}

// Dessine le jeu
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // Obstacles
  ctx.fillStyle = '#e74c3c';
  obstacles.forEach(obs => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
  // Joueur
  ctx.fillStyle = '#1dd1a1';
  ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
}

// Gère l'affichage des overlays
function showOverlay(el) {
  el.style.display = 'flex';
}
function hideOverlay(el) {
  el.style.display = 'none';
}

// Gestion des touches
let leftPressed = false;
let rightPressed = false;
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    leftPressed = true;
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    rightPressed = true;
  }
});
document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    leftPressed = false;
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    rightPressed = false;
  }
});

// Met à jour la position du joueur selon les touches pressées
function updatePlayerFromKeys() {
  if (leftPressed) {
    playerX -= playerSpeed;
  }
  if (rightPressed) {
    playerX += playerSpeed;
  }
  if (playerX < 0) playerX = 0;
  if (playerX + playerWidth > WIDTH) playerX = WIDTH - playerWidth;
}

// Gère les mouvements de pointeur (souris)
function handlePointerMove(clientX) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  playerX = x - playerWidth / 2;
  if (playerX < 0) playerX = 0;
  if (playerX + playerWidth > WIDTH) playerX = WIDTH - playerWidth;
}

// Événements souris
canvas.addEventListener('mousemove', e => {
  handlePointerMove(e.clientX);
});

// Événements tactiles
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  handlePointerMove(e.touches[0].clientX);
}, { passive: false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  handlePointerMove(e.touches[0].clientX);
}, { passive: false });

// Actions des boutons
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
shareButton.addEventListener('click', () => {
  const url = window.location.href;
  const tweet = `J'ai obtenu un score de ${Math.floor(score)} à Dodge Nano ! Essayez‑vous à votre tour ici : ${url}`;
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
  window.open(shareUrl, '_blank');
});

// Affichage initial
showOverlay(startOverlay);
