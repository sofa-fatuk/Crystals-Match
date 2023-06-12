import chalk from "chalk";

import prompt from "prompt-async";

let Field = [];

const Letters = ["A", "B", "C", "D", "E", "F"];
// const Letters = ['A', 'B']
const ColorsMap = {
  A: "yellow",
  B: "green",
  C: "red",
  D: "blue",
  E: "magenta",
  F: "grey",
};

const FieldXLength = 10;
const FieldYLength = 10;

let lastMove = [];

function drawLetter(letter) {
  return chalk[ColorsMap[letter]](letter);
}

function init() {
  for (let x = 0; x < FieldXLength; x += 1) {
    Field.push([]);
    for (let y = 0; y < FieldYLength; y += 1) {
      Field[x].push(Letters[getRandomNumber()]);
    }
  }
}

function mix() {
  let mixed = false;

  while (!mixed) {
    // Clone the original Field array to perform the mixing
    const mixedField = JSON.parse(JSON.stringify(Field));
    mixed = true;

    // Mix the Field array
    for (let x = 0; x < FieldXLength; x += 1) {
      for (let y = 0; y < FieldYLength; y += 1) {
        // Check for horizontal three-in-a-row match
        if (
          y >= 2 &&
          mixedField[x][y] === mixedField[x][y - 1] &&
          mixedField[x][y] === mixedField[x][y - 2]
        ) {
          const validLetters = Letters.filter(
            (letter) => letter !== mixedField[x][y]
          );
          mixedField[x][y] =
            validLetters[getRandomNumber(0, validLetters.length - 1)];
          mixed = false;
        }

        // Check for vertical three-in-a-column match
        if (
          x >= 2 &&
          mixedField[x][y] === mixedField[x - 1][y] &&
          mixedField[x][y] === mixedField[x - 2][y]
        ) {
          const validLetters = Letters.filter(
            (letter) => letter !== mixedField[x][y]
          );
          mixedField[x][y] =
            validLetters[getRandomNumber(0, validLetters.length - 1)];
          mixed = false;
        }
      }
    }
    // Copy the mixedField back to Field
    Field = mixedField;
  }
}

function dump() {
  // console.clear()
  console.log("\n\n");
  Field.forEach((row) => {
    console.log(row.map((l) => (l ? drawLetter(l) : "o")).join(" "));
  });
}

function move(from, to) {
  const [fX, fY] = from;
  const [tX, tY] = to;

  const oldElement = Field[fX][fY];

  Field[fX][fY] = Field[tX][tY];
  Field[tX][tY] = oldElement;

  lastMove.push(fX, fY, tX, tY);
}

function undoLastMove() {
  if (lastMove.length) {
    const [fX, fY, tX, tY] = lastMove;
    const oldElement = Field[fX][fY];

    Field[fX][fY] = Field[tX][tY];
    Field[tX][tY] = oldElement;
  }

  lastMove = [];
}

function handleUserInput(input = "") {
  let [action, x, y, direction] = input.split(" ");
  x = Number(x);
  y = Number(y);

  // TODO: add validation
  try {
    if (direction === "r") {
      const point = [x, y + 1];
      move([x, y], point);
    }
    if (direction === "l") {
      const point = [x, y - 1];
      move([x, y], point);
    }
    if (direction === "u") {
      const point = [x - 1, y];
      move([x, y], point);
    }
    if (direction === "d") {
      const point = [x + 1, y];
      move([x, y], point);
    }
  } catch (error) {
    console.log("error >>", error);
  }
}

function removeMatches(matches) {
  matches.forEach(([x, y]) => {
    Field[x][y] = null;
  });
}

function addItems() {
  const x = 0;
  for (let y = 0; y < FieldYLength; y++) {
    if (Field[x][y] === null) {
      Field[x][y] = Letters[getRandomNumber()];
    }
  }
}

function moveItemsDown() {
  const MovedField = JSON.parse(JSON.stringify(Field));

  for (let x = 1; x < FieldXLength; x++) {
    for (let y = 0; y < FieldYLength; y++) {
      if (Field[x][y] === null) {
        // item above
        if (Field[x - 1][y]) {
          MovedField[x][y] = MovedField[x - 1][y];
          MovedField[x - 1][y] = null;
        }
      }
    }
  }

  Field = MovedField;
}

function checkAnimationRequired() {
  let animationRequired = false;

  for (let x = 0; x < FieldXLength; x++) {
    for (let y = 0; y < FieldYLength; y++) {
      if (Field[x][y] === null) {
        animationRequired = true;
        break;
      }
    }
  }

  return animationRequired;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function countPossibleMoves(board) {
  const rows = board.length;
  const columns = board[0].length;
  let count = 0;

  // Check for horizontal moves
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns - 1; col++) {
      // Create a deep copy of the board
      const boardCopy = JSON.parse(JSON.stringify(board));

      // Swap adjacent letters
      [boardCopy[row][col], boardCopy[row][col + 1]] = [
        boardCopy[row][col + 1],
        boardCopy[row][col],
      ];

      // Check if the move creates a match
      if (checkMatches(boardCopy).length > 0) {
        count++;
      } else {
        // Undo the move
        [boardCopy[row][col], boardCopy[row][col + 1]] = [
          boardCopy[row][col + 1],
          boardCopy[row][col],
        ];
      }
    }
  }

  // Check for vertical moves
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows - 1; row++) {
      // Create a deep copy of the board
      const boardCopy = JSON.parse(JSON.stringify(board));

      // Swap adjacent letters
      [boardCopy[row][col], boardCopy[row + 1][col]] = [
        boardCopy[row + 1][col],
        boardCopy[row][col],
      ];

      // Check if the move creates a match
      if (checkMatches(boardCopy).length > 0) {
        count++;
      } else {
        // Undo the move
        [boardCopy[row][col], boardCopy[row + 1][col]] = [
          boardCopy[row + 1][col],
          boardCopy[row][col],
        ];
      }
    }
  }

  return count;
}

// Helper function to check if a match of three is present in the Field
function checkMatches(board = Field, matchCount = 3) {
  const matches = [];

  // Check for horizontal matches
  for (let y = 0; y < FieldYLength; y++) {
    let count = 1;
    for (let x = 1; x < FieldXLength; x++) {
      if (board[x][y] === board[x - 1][y]) {
        count++;
      } else {
        if (count >= matchCount) {
          for (let i = x - count; i < x; i++) {
            matches.push([i, y]);
          }
        }
        count = 1;
      }
    }
    if (count >= matchCount) {
      for (let i = FieldXLength - count; i < FieldXLength; i++) {
        matches.push([i, y]);
      }
    }
  }

  // Check for vertical matches
  for (let x = 0; x < FieldXLength; x++) {
    let count = 1;
    for (let y = 1; y < FieldYLength; y++) {
      if (board[x][y] === board[x][y - 1]) {
        count++;
      } else {
        if (count >= matchCount) {
          for (let i = y - count; i < y; i++) {
            matches.push([x, i]);
          }
        }
        count = 1;
      }
    }
    if (count >= matchCount) {
      for (let i = FieldYLength - count; i < FieldYLength; i++) {
        matches.push([x, i]);
      }
    }
  }

  return matches;
}

async function animation() {
  const matches = checkMatches();
  if (matches.length > 0) {
    removeMatches(matches);
  } else {
    dump();
    await delay(700);
    undoLastMove();
    dump();
    await delay(700);
  }

  while (checkAnimationRequired()) {
    dump();
    await delay(700);
    moveItemsDown();
    addItems();
    dump();
    await delay(700);
  }

  if (checkMatches().length > 0) {
    animation();
  }
}

async function loop() {
  const { userInput } = await prompt.get("userInput");
  if (!userInput) {
    console.log("Game is over");
    return;
  }

  if (userInput.startsWith("q")) {
    return;
  }
  handleUserInput(userInput);

  await animation();
  const moves = countPossibleMoves(Field);
  if (moves === 0) {
    init();
    mix();
    dump();
    await delay(700);
  }
  loop();
}

// Helpers
function getRandomNumber(min = 0, max = Letters.length - 1) {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
}

init();
mix();
dump();
loop();
