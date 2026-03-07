/**
 * Sudoku Tiles Game - Business Logic
 * Sudoku with colored tiles instead of numbers
 */

const SudokuTiles = (function () {
  'use strict';

  const SIZE = 9;
  const BOX_SIZE = 3;

  // Colors for tiles 1-9 (matching the image)
  const COLORS = [
    '#f0f0f0', // 1: Light gray/white
    '#1e3a5f', // 2: Dark blue
    '#5dade2', // 3: Light blue/cyan
    '#27ae60', // 4: Green
    '#f4d03f', // 5: Yellow
    '#e67e22', // 6: Orange
    '#e74c3c', // 7: Red
    '#8e44ad', // 8: Purple
    '#f1948a', // 9: Pink
  ];

  // A valid solved Sudoku grid (for solution)
  const SOLUTION = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ];

  // Puzzle: 0 = empty, 1-9 = given (pre-filled)
  const PUZZLE = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  let grid = [];
  let lockedColors = new Set();
  let givenCells = new Set();

  function initGrid() {
    grid = PUZZLE.map((row) => row.slice());
    lockedColors = new Set();
    givenCells = new Set();
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (PUZZLE[r][c] !== 0) {
          givenCells.add(r * SIZE + c);
        }
      }
    }
  }

  function getBoxIndex(row, col) {
    return Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE);
  }

  function isGiven(row, col) {
    return givenCells.has(row * SIZE + col);
  }

  function isColorLocked(value) {
    return lockedColors.has(value);
  }

  function checkColorComplete(value) {
    const positions = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === value) positions.push([r, c]);
      }
    }
    if (positions.length !== 9) return false;
    return positions.every(([r, c]) => SOLUTION[r][c] === value);
  }

  function updateLockedColors() {
    for (let v = 1; v <= 9; v++) {
      if (checkColorComplete(v)) {
        lockedColors.add(v);
      }
    }
  }

  return {
    getColors() {
      return COLORS.slice();
    },

    getColor(value) {
      return value >= 1 && value <= 9 ? COLORS[value - 1] : null;
    },

    init() {
      initGrid();
      updateLockedColors();
    },

    getGrid() {
      return grid.map((row) => row.slice());
    },

    getSolution() {
      return SOLUTION.map((row) => row.slice());
    },

    isGiven(row, col) {
      return isGiven(row, col);
    },

    isLocked(row, col) {
      const val = grid[row][col];
      return val !== 0 && isColorLocked(val);
    },

    getLockedColors() {
      return new Set(lockedColors);
    },

    canEdit(row, col) {
      return !isGiven(row, col) && !this.isLocked(row, col);
    },

    placeTile(row, col, value) {
      if (!this.canEdit(row, col)) return false;
      if (value < 1 || value > 9) return false;
      grid[row][col] = value;
      updateLockedColors();
      return true;
    },

    removeTile(row, col) {
      if (!this.canEdit(row, col)) return false;
      grid[row][col] = 0;
      updateLockedColors();
      return true;
    },

    isComplete() {
      return lockedColors.size === 9;
    },
  };
})();
