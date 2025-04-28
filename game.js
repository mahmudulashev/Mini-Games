const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let platform = {
  x: 150,
  y: 550,
  width: 100,
  height: 20,
  speed: 15
};

let ball = {
  x: Math.random() * 360,
  y: 0,
  radius: 15,
  speed: 2.5, // Boshida sekinroq
  color: "normal"
};

let clouds = [
  { x: 50, y: 50 },
  { x: 250, y: 150 },
  { x: 100, y: 300 }
];

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let gameOver = false;

let lives = 3; // O'yinchi yuraklari

function drawLives() {
  ctx.fillStyle = 'red';
  for (let i = 0; i < lives; i++) {
    ctx.beginPath();
    ctx.arc(20 + i * 30, 50, 10, 0, Math.PI * 2); // Yuraklarni chizish
    ctx.fill();
    ctx.closePath();
  }
}

const catchSound = document.getElementById('catchSound');
const gameOverSound = document.getElementById('gameOverSound');

function drawCloud(cloud) {
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
  ctx.arc(cloud.x + 25, cloud.y + 10, 20, 0, Math.PI * 2);
  ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  clouds.forEach(drawCloud);

  ctx.fillStyle = "#4CAF50";
  ctx.beginPath();
  ctx.roundRect(platform.x, platform.y, platform.width, platform.height, 10);
  ctx.fill();
  ctx.closePath();

  if (ball.color === "gold") {
    ctx.fillStyle = "gold";
  } else {
    let gradient = ctx.createRadialGradient(ball.x, ball.y, 5, ball.x, ball.y, ball.radius);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#ff0000");
    ctx.fillStyle = gradient;
  }
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 30);

  drawLives(); // Yuraklarni chizish
}

function update() {
  if (gameOver) return;

  ball.y += ball.speed;

  clouds.forEach(cloud => {
    cloud.x -= 0.3;
    if (cloud.x < -60) {
      cloud.x = canvas.width + Math.random() * 50;
      cloud.y = Math.random() * canvas.height / 2;
    }
  });

  if (ball.y + ball.radius > platform.y &&
      ball.x > platform.x &&
      ball.x < platform.x + platform.width) {
    ball.y = 0;
    ball.x = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;

    if (ball.color === "gold") {
      score += 3;
    } else {
      score++;
    }

    ball.color = Math.random() < 0.1 ? "gold" : "normal";

    if (score % 5 === 0 && ball.speed < 8) {
      ball.speed += 0.2;
    }

    if (score % 10 === 0 && platform.width > 50) {
      platform.width *= 0.98;
    }

    catchSound.play();
  }

  if (ball.y > canvas.height) {
    lives--; // Yurakni kamaytirish
    if (lives <= 0) {
      endGame();
    } else {
      ball.y = 0;
      ball.x = Math.random() * (canvas.width - ball.radius * 2) + ball.radius;
    }
  }
}

function endGame() {
  gameOver = true;
  gameOverSound.play();
  document.getElementById('finalScore').textContent = score;
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  
  document.getElementById('highScore').textContent = highScore;
  document.getElementById('gameOverScreen').classList.remove('hidden');
}

function restartGame() {
  score = 0;
  ball.y = 0;
  ball.speed = 2.5; // Qaytishda sekin
  ball.color = "normal";
  platform.x = 150;
  platform.width = 100;
  lives = 3; // Yuraklarni tiklash
  gameOver = false;
  document.getElementById('gameOverScreen').classList.add('hidden');
  gameLoop();
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft' && platform.x > 0) {
    platform.x -= platform.speed;
  } else if (e.key === 'ArrowRight' && platform.x + platform.width < canvas.width) {
    platform.x += platform.speed;
  }
});

let touchStartX = 0;

canvas.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', function(e) {
  const touchX = e.touches[0].clientX;
  const deltaX = touchX - touchStartX;

  if (deltaX < 0 && platform.x > 0) {
    platform.x += deltaX; // Chapga harakat
  } else if (deltaX > 0 && platform.x + platform.width < canvas.width) {
    platform.x += deltaX; // O'ngga harakat
  }

  touchStartX = touchX; // Yangi boshlang'ich nuqtani yangilash
});

canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left; // Sichqoncha koordinatasini olish
  platform.x = mouseX - platform.width / 2; // Platformani sichqoncha bilan bog'lash

  // Platformani o'yin maydonidan chiqib ketmasligini ta'minlash
  if (platform.x < 0) platform.x = 0;
  if (platform.x + platform.width > canvas.width) platform.x = canvas.width - platform.width;
});

CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  if (width < 2 * radius) radius = width / 2;
  if (height < 2 * radius) radius = height / 2;
  this.beginPath();
  this.moveTo(x + radius, y);
  this.arcTo(x + width, y, x + width, y + height, radius);
  this.arcTo(x + width, y + height, x, y + height, radius);
  this.arcTo(x, y + height, x, y, radius);
  this.arcTo(x, y, x + width, y, radius);
  this.closePath();
  return this;
};




function gameLoop() {
  draw();
  update();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop();
