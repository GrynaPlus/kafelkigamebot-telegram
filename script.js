// script.js

document.addEventListener('DOMContentLoaded', () => {
  // Sprawdzamy, czy w localStorage istnieje zapisana nazwa użytkownika
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    username = savedUsername;
    const savedLevel = localStorage.getItem('level');
    if (savedLevel) level = parseInt(savedLevel);
    const savedMoves = localStorage.getItem('moves');
    if (savedMoves) moves = parseInt(savedMoves);
    document.getElementById('userModal').style.display = 'none';
    updateHeader();
    initGame();
  } else {
    document.getElementById('startButton').addEventListener('click', startGame);
  }

  // Obsługa przycisków modali: reklamy i pominięcia poziomu
  document.getElementById('adButton').addEventListener('click', rewardMoves);
  document.getElementById('skipYesButton').addEventListener('click', skipLevel);
  document.getElementById('skipNoButton').addEventListener('click', () => {
    document.getElementById('skipModal').style.display = 'none';
  });

  // Obsługa guzika do zmiany gradientu puzzla
  document.getElementById('changeGradientButton').addEventListener('click', updateGradient);
});

let username = "";
let level = 1;
let moves = 100;      // Na starcie gracz ma 100 ruchów
let movesUsed = 0;    // Ruchy wykonane w bieżącym poziomie
let skipModalShown = false;
let selectedTile = null;
let tiles = [];

/* Funkcja konwertująca SVG do base64 */
function svgToBase64(svg) {
  return window.btoa(unescape(encodeURIComponent(svg)));
}

/* Funkcja generująca losowy kolor */
function getRandomColor() {
  return `hsl(${Math.floor(Math.random() * 360)}, 100%, 50%)`;
}

/* Funkcja zwracająca zawartość na podstawie poziomu */
function getLevelContent(lvl) {
  const letters = ["A", "Ą", "B", "C", "Ć", "D", "E", "Ę", "F", "G", "H", "I", "J", "K", "L", "Ł", "M", "N", "O", "Ó", "P", "R", "S", "Ś", "T", "U", "W", "Y", "Z", "Ż", "Ź"];
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const lettersCount = letters.length;
  const digitsCount = digits.length;
  if (lvl <= lettersCount) return letters[lvl - 1];
  else if (lvl <= lettersCount + digitsCount) return digits[lvl - lettersCount - 1];
  else if (lvl <= lettersCount + digitsCount + lettersCount * digitsCount) {
    let index = lvl - lettersCount - digitsCount - 1;
    let letterIndex = Math.floor(index / digitsCount);
    let digitIndex = index % digitsCount;
    return letters[letterIndex] + digits[digitIndex];
  } else {
    let index = lvl - (lettersCount + digitsCount + lettersCount * digitsCount) - 1;
    let letterIndex = Math.floor(index / (digitsCount * digitsCount)) % lettersCount;
    let firstDigit = Math.floor(index / digitsCount) % digitsCount;
    let secondDigit = index % digitsCount;
    return letters[letterIndex] + digits[firstDigit] + digits[secondDigit];
  }
}

/* Funkcja zwracająca losowy kolor obramowania */
function getRandomBorderColor() {
  const colors = ['#FF5722', '#FFC107', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63'];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* Funkcja ustawiająca nazwę użytkownika i uruchamiająca grę */
function startGame() {
  const input = document.getElementById('usernameInput');
  username = input.value.trim();
  if (!username) {
    alert("Proszę podać nazwę użytkownika.");
    return;
  }
  localStorage.setItem('username', username);
  document.getElementById('userModal').style.display = 'none';
  const savedLevel = localStorage.getItem('level');
  if (savedLevel) level = parseInt(savedLevel);
  const savedMoves = localStorage.getItem('moves');
  if (savedMoves) {
    moves = parseInt(savedMoves);
  } else {
    moves = 100;
    localStorage.setItem('moves', moves);
  }
  updateHeader();
  initGame();
}

/* Aktualizacja nagłówka */
function updateHeader() {
  const header = document.getElementById('headerInfo');
  header.textContent = `Witaj, ${username}! Poziom: ${level} | Ruchy: ${moves}`;
}

/* Odejmowanie ruchu i zwiększanie licznika wykonanych ruchów */
function subtractMove() {
  moves--;
  movesUsed++;
  localStorage.setItem('moves', moves);
  updateHeader();
  // Jeśli ruchy się skończą, wyświetlamy modal z reklamą nagradzaną
  if (moves <= 0) {
    document.getElementById('adModal').style.display = 'flex';
  }
  // Po wykonaniu 20 (lub więcej) ruchów wyświetlamy modal umożliwiający pominięcie poziomu
  if (movesUsed >= 20 && !skipModalShown) {
    document.getElementById('skipModal').style.display = 'flex';
    skipModalShown = true;
  }
}

/* Funkcja nagradzająca – wywołanie rewarded interstitial ad dla dodatkowych ruchów */
function rewardMoves() {
  // Wywołanie rewarded interstitial
  show_9081118().then(() => {
    alert('Reklama obejrzana, otrzymujesz 50 ruchów!');
    moves += 50;
    localStorage.setItem('moves', moves);
    updateHeader();
    document.getElementById('adModal').style.display = 'none';
  }).catch((error) => {
    console.error('Error displaying ad:', error);
  });
}

/* Funkcja pomijająca poziom – najpierw wywołuje reklamę, a następnie pomija poziom */
function skipLevel() {
  // Wywołanie rewarded interstitial dla pominięcia poziomu
  show_9081118().then(() => {
    alert('Reklama obejrzana, poziom został pominięty!');
    level++;
    localStorage.setItem('level', level);
    movesUsed = 0;
    skipModalShown = false;
    initGame();
    updateHeader();
    document.getElementById('skipModal').style.display = 'none';
  }).catch((error) => {
    console.error('Error displaying ad:', error);
  });
}

/* Inicjalizacja gry – tworzenie planszy 3x3 */
function initGame() {
  movesUsed = 0;
  skipModalShown = false;
  const gridSize = 3;
  const boardSize = 300;
  const tileSize = boardSize / gridSize;
  const board = document.getElementById('gameBoard');
  board.innerHTML = "";
  board.style.width = boardSize + 'px';
  board.style.height = boardSize + 'px';
  board.style.gridTemplateRows = `repeat(${gridSize}, ${tileSize}px)`;
  board.style.gridTemplateColumns = `repeat(${gridSize}, ${tileSize}px)`;
  
  const content = getLevelContent(level);
  const bgColor1 = getRandomColor();
  const bgColor2 = getRandomColor();
  const bgColor3 = getRandomColor();
  const textColor1 = getRandomColor();
  const textColor2 = getRandomColor();
  
  const letterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${boardSize}" height="${boardSize}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor1}; stop-opacity:1" />
      <stop offset="50%" style="stop-color:${bgColor2}; stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bgColor3}; stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${textColor1}; stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${textColor2}; stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="${boardSize}" height="${boardSize}" fill="url(#bgGradient)"/>
  <text x="50%" y="50%" font-size="${boardSize * 0.8}" text-anchor="middle" dominant-baseline="middle" fill="url(#textGradient)">
    ${content}
  </text>
</svg>
  `.trim();
  
  const svgBase64 = svgToBase64(letterSvg);
  const img = new Image();
  img.onload = function() {
    setupTiles(gridSize, tileSize, board, img);
  };
  img.src = 'data:image/svg+xml;base64,' + svgBase64;
}

/* Tworzenie kafelków */
function setupTiles(gridSize, tileSize, board, img) {
  tiles = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const tile = document.createElement('div');
      tile.classList.add('tile');
      tile.style.width = tileSize + 'px';
      tile.style.height = tileSize + 'px';
      tile.style.borderColor = getRandomBorderColor();
      tile.style.backgroundImage = `url(${img.src})`;
      tile.style.backgroundSize = `${board.clientWidth}px ${board.clientHeight}px`;
      tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
      tile.style.backgroundRepeat = 'no-repeat';
      tiles.push({
        element: tile,
        correctRow: row,
        correctCol: col,
        currentRow: row,
        currentCol: col,
        rotation: 0
      });
    }
  }
  shuffleTiles(tiles);
  for (let i = 0; i < tiles.length; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;
    tiles[i].currentRow = row;
    tiles[i].currentCol = col;
    tiles[i].element.style.gridRowStart = row + 1;
    tiles[i].element.style.gridColumnStart = col + 1;
  }
  tiles.forEach(tileObj => {
    const rotations = [0, 90, 180, 270];
    tileObj.rotation = rotations[Math.floor(Math.random() * rotations.length)];
    tileObj.element.style.transform = `rotate(${tileObj.rotation}deg)`;
  });
  tiles.forEach(tileObj => {
    tileObj.element.addEventListener('click', () => handleTileClick(tileObj));
    tileObj.element.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      rotateTile(tileObj);
    });
    board.appendChild(tileObj.element);
  });
  document.getElementById('message').innerHTML = "";
}

/* Algorytm tasowania (Fisher-Yates) */
function shuffleTiles(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* Obsługa kliknięcia kafelka */
function handleTileClick(tileObj) {
  if (moves <= 0) {
    document.getElementById('adModal').style.display = 'flex';
    return;
  }
  if (selectedTile === tileObj) {
    tileObj.element.classList.remove('selected');
    selectedTile = null;
    return;
  }
  if (!selectedTile) {
    selectedTile = tileObj;
    tileObj.element.classList.add('selected');
  } else {
    swapTiles(selectedTile, tileObj);
    selectedTile.element.classList.remove('selected');
    selectedTile = null;
    subtractMove();
    checkWin();
  }
}

/* Zamiana kafelków */
function swapTiles(tileA, tileB) {
  let tempRow = tileA.currentRow;
  let tempCol = tileA.currentCol;
  tileA.currentRow = tileB.currentRow;
  tileA.currentCol = tileB.currentCol;
  tileB.currentRow = tempRow;
  tileB.currentCol = tempCol;
  tileA.element.style.gridRowStart = tileA.currentRow + 1;
  tileA.element.style.gridColumnStart = tileA.currentCol + 1;
  tileB.element.style.gridRowStart = tileB.currentRow + 1;
  tileB.element.style.gridColumnStart = tileB.currentCol + 1;
}

/* Obrót kafelka */
function rotateTile(tileObj) {
  if (moves <= 0) {
    document.getElementById('adModal').style.display = 'flex';
    return;
  }
  tileObj.rotation = (tileObj.rotation + 90) % 360;
  tileObj.element.style.transform = `rotate(${tileObj.rotation}deg)`;
  subtractMove();
  checkWin();
}

/* Sprawdzanie, czy puzzle są ułożone poprawnie */
function checkWin() {
  const win = tiles.every(tileObj => {
    return tileObj.currentRow === tileObj.correctRow &&
           tileObj.currentCol === tileObj.correctCol &&
           tileObj.rotation % 360 === 0;
  });
  const messageDiv = document.getElementById('message');
  if (win) {
    messageDiv.innerHTML = `Gratulacje, ukończyłeś poziom ${level}!<br>`;
    const nextLevelBtn = document.createElement('button');
    nextLevelBtn.textContent = "Następny poziom";
    nextLevelBtn.classList.add('next-level');
    nextLevelBtn.addEventListener('click', () => {
      level++;
      localStorage.setItem('level', level);
      initGame();
      updateHeader();
    });
    messageDiv.appendChild(nextLevelBtn);
  } else {
    messageDiv.textContent = "";
  }
}

/* Funkcja zmieniająca gradient puzzla – aktualizacja tła każdego kafelka */
function updateGradient() {
  const board = document.getElementById('gameBoard');
  const boardSize = board.clientWidth;
  const bgColor1 = getRandomColor();
  const bgColor2 = getRandomColor();
  const bgColor3 = getRandomColor();
  const textColor1 = getRandomColor();
  const textColor2 = getRandomColor();
  const content = getLevelContent(level);
  const letterSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${boardSize}" height="${boardSize}">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor1}; stop-opacity:1" />
      <stop offset="50%" style="stop-color:${bgColor2}; stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bgColor3}; stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${textColor1}; stop-opacity:1"/>
      <stop offset="100%" style="stop-color:${textColor2}; stop-opacity:1"/>
    </linearGradient>
  </defs>
  <rect width="${boardSize}" height="${boardSize}" fill="url(#bgGradient)"/>
  <text x="50%" y="50%" font-size="${boardSize * 0.8}" text-anchor="middle" dominant-baseline="middle" fill="url(#textGradient)">
    ${content}
  </text>
</svg>
  `.trim();
  const svgBase64 = svgToBase64(letterSvg);
  const newSrc = 'data:image/svg+xml;base64,' + svgBase64;
  tiles.forEach(tileObj => {
    tileObj.element.style.backgroundImage = `url(${newSrc})`;
  });
}
