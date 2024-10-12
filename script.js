let origBoard;
const huPlayer = "O";
const aiPlayer = "X";
const winCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [6, 4, 2],
];

const cells = document.querySelectorAll(".cell");
const aiModeBtn = document.getElementById("ai-mode");
const friendModeBtn = document.getElementById("friend-mode");
const replayBtn = document.getElementById("replay");
const cancelRestartBtn = document.getElementById("cancel-restart");
const opponentSpan = document.getElementById("opponent");
const countdownEl = document.getElementById("countdown");

let currentPlayer = huPlayer;
let gameMode = "ai"; // Default game mode
let restartTimer;

aiModeBtn.addEventListener("click", () => {
  gameMode = "ai";
  opponentSpan.textContent = "AI";
  startGame();
});

friendModeBtn.addEventListener("click", () => {
  gameMode = "friend";
  opponentSpan.textContent = "Friend";
  startGame();
});

replayBtn.addEventListener("click", startGame);
cancelRestartBtn.addEventListener("click", cancelRestart);

function startGame() {
  clearTimeout(restartTimer);
  document.querySelector(".endgame").style.display = "none";
  origBoard = Array.from(Array(9).keys());
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = "";
    cells[i].style.removeProperty("background-color");
    cells[i].addEventListener("click", turnClick, false);
  }
  currentPlayer = huPlayer;
}

function turnClick(square) {
  if (typeof origBoard[square.target.id] == "number") {
    turn(square.target.id, currentPlayer);
    if (!checkWin(origBoard, currentPlayer) && !checkTie()) {
      if (gameMode === "ai" && currentPlayer === huPlayer) {
        disableBoard();
        setTimeout(() => {
          turn(bestSpot(), aiPlayer);
          enableBoard();
        }, 750);
      } else if (gameMode === "friend") {
        currentPlayer = currentPlayer === huPlayer ? aiPlayer : huPlayer;
      }
    }
  }
}

function disableBoard() {
  cells.forEach((cell) => {
    cell.removeEventListener("click", turnClick, false);
    cell.style.cursor = "not-allowed";
  });
}

function enableBoard() {
  cells.forEach((cell) => {
    if (typeof origBoard[cell.id] == "number") {
      cell.addEventListener("click", turnClick, false);
      cell.style.cursor = "pointer";
    }
  });
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.getElementById(squareId).innerText = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => (e === player ? a.concat(i) : a), []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every((elem) => plays.indexOf(elem) > -1)) {
      gameWon = { index: index, player: player };
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor =
      gameWon.player == huPlayer ? "#4CAF50" : "#f44336";
  }
  for (var i = 0; i < cells.length; i++) {
    cells[i].removeEventListener("click", turnClick, false);
  }
  declareWinner(
    gameWon.player == huPlayer ? "Player O wins!" : "Player X wins!"
  );
  startAutoRestart();
}

function declareWinner(who) {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
  return origBoard.filter((s) => typeof s == "number");
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function checkTie() {
  if (emptySquares().length == 0) {
    for (var i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = "#2196F3";
      cells[i].removeEventListener("click", turnClick, false);
    }
    declareWinner("Tie Game!");
    startAutoRestart();
    return true;
  }
  return false;
}

function minimax(newBoard, player) {
  var availSpots = emptySquares();

  if (checkWin(newBoard, huPlayer)) {
    return { score: -10 };
  } else if (checkWin(newBoard, aiPlayer)) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }
  var moves = [];
  for (var i = 0; i < availSpots.length; i++) {
    var move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player == aiPlayer) {
      var result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      var result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availSpots[i]] = move.index;

    moves.push(move);
  }

  var bestMove;
  if (player === aiPlayer) {
    var bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    var bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function startAutoRestart() {
  let timeLeft = 5;
  countdownEl.innerText = `Restarting in ${timeLeft} seconds...`;

  function countdown() {
    timeLeft--;
    if (timeLeft > 0) {
      countdownEl.innerText = `Restarting in ${timeLeft} seconds...`;
      restartTimer = setTimeout(countdown, 1000);
    } else {
      startGame();
    }
  }

  restartTimer = setTimeout(countdown, 1000);
}

function cancelRestart() {
  clearTimeout(restartTimer);
  countdownEl.innerText = "Restart cancelled";
}

startGame();
