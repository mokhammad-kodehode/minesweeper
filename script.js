const rows = 10;
const cols = 10;
const mineCount = 10;

let board = [];
let cells = [];
let gameOver = false;

// Инициализация игрового поля
function initializeBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  board = Array.from({ length: rows }, () => Array(cols).fill(0));
  cells = [];

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

  if (board[row][col] === "M") {
    revealAllMines();
    cell.classList.add("revealed", "mine");
    cell.textContent = "💣";
    gameOver = true;
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
  }
}

// Запускаем игру
initializeBoard();
