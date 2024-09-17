let rows = 9; // Количество строк по умолчанию для уровня новичка
let cols = 9; // Количество колонок по умолчанию для уровня новичка
let mineCount = 10; // Количество мин по умолчанию для уровня новичка

let board = [];
let cells = [];
let gameOver = false;
let firstClick = false;
let timerInterval;
let time = 0;

const bombsCountDisplay = document.getElementById("bombsCount");
const timerDisplay = document.getElementById("timer");
const restartButton = document.getElementById("restartButton");
const boardElement = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const panelElement = document.querySelector(".panel");

// Установка размера поля и количества мин в зависимости от выбранной сложности
difficultySelect.addEventListener("change", (e) => {
  const difficulty = e.target.value;
  switch (difficulty) {
    case "beginner":
      rows = 9;
      cols = 9;
      mineCount = 10;
      break;
    case "intermediate":
      rows = 16;
      cols = 16;
      mineCount = 40;
      break;
    case "expert":
      rows = 16;
      cols = 30;
      mineCount = 99;
      break;
  }
  initializeBoard();
});

// Инициализация игрового поля
function initializeBoard() {
  clearTimeout(timerInterval);
  timerDisplay.textContent = "Time: 0s";
  time = 0;
  firstClick = false;
  gameOver = false;
  boardElement.innerHTML = "";
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  cells = [];

  // Динамическое изменение CSS grid в зависимости от размера поля
  boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
  boardElement.style.gridTemplateRows = `repeat(${rows}, 30px)`;

  // Изменяем ширину панели в зависимости от ширины игрового поля
  const panelWidth = cols * 30 + (cols - 1) * 2; // Ширина поля = ширина ячеек + зазоры
  panelElement.style.width = `${panelWidth}px`;

  bombsCountDisplay.textContent = `Bombs: ${mineCount}`;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      cell.addEventListener("contextmenu", handleCellRightClick);
      boardElement.appendChild(cell);
      cells.push(cell);
    }
  }

  placeMines();
  calculateNumbers();
}

// Расставить мины на поле
function placeMines() {
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (board[row][col] !== "M") {
      board[row][col] = "M";
      minesPlaced++;
    }
  }
}

// Подсчитать количество мин вокруг каждой клетки
function calculateNumbers() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === "M") continue;
      let count = 0;
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r >= 0 && r < rows && c >= 0 && c < cols && board[r][c] === "M") {
            count++;
          }
        }
      }
      board[row][col] = count;
    }
  }
}

// Обработчик клика по ячейке
function handleCellClick(event) {
  if (gameOver) return;

  const cell = event.target;
  const row = parseInt(cell.dataset.row, 10);
  const col = parseInt(cell.dataset.col, 10);

  if (cell.classList.contains("revealed") || cell.classList.contains("flag"))
    return;

  if (!firstClick) {
    startTimer();
    firstClick = true;
  }

  if (board[row][col] === "M") {
    revealAllMines();
    cell.classList.add("revealed", "mine");
    cell.textContent = "💣";
    gameOver = true;
    clearInterval(timerInterval);
    alert("Game Over!");
  } else {
    revealCell(row, col);
    checkWin();
  }
}

// Обработчик правого клика (пометка флага)
function handleCellRightClick(event) {
  event.preventDefault();
  if (gameOver) return;

  const cell = event.target;
  if (cell.classList.contains("revealed")) return;

  if (cell.classList.contains("flag")) {
    cell.classList.remove("flag");
    cell.textContent = "";
  } else {
    cell.classList.add("flag");
    cell.textContent = "🚩";
  }
}

// Раскрытие клетки и соседних клеток
function revealCell(row, col) {
  const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  if (!cell || cell.classList.contains("revealed")) return;

  cell.classList.add("revealed");
  const value = board[row][col];
  if (value > 0) {
    cell.textContent = value;
  } else {
    // Рекурсивное раскрытие соседних клеток
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (
          r >= 0 &&
          r < rows &&
          c >= 0 &&
          c < cols &&
          (r !== row || c !== col)
        ) {
          revealCell(r, c);
        }
      }
    }
  }
}

// Раскрытие всех мин
function revealAllMines() {
  cells.forEach((cell) => {
    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    if (board[row][col] === "M") {
      cell.classList.add("revealed", "mine");
      cell.textContent = "💣";
    }
  });
}

// Проверка выигрыша
function checkWin() {
  const revealedCells = cells.filter((cell) =>
    cell.classList.contains("revealed")
  ).length;
  const totalCells = rows * cols;
  const remainingCells = totalCells - revealedCells - mineCount;

  if (remainingCells === 0) {
    alert("You Win!");
    gameOver = true;
    clearInterval(timerInterval);
  }
}

// Функция для старта таймера
function startTimer() {
  timerInterval = setInterval(() => {
    time++;
    timerDisplay.textContent = `Time: ${time}s`;
  }, 1000);
}

// Обработчик клика по кнопке рестарта
restartButton.addEventListener("click", () => {
  initializeBoard();
});

// Инициализация игры при загрузке страницы
initializeBoard();
