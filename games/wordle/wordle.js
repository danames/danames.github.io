/**
 * Wordle Game - Business Logic
 * Implements the core game mechanics for the Wordle word puzzle.
 */

const WordleGame = (function () {
  'use strict';

  // Game state
  let targetWord = '';
  let guesses = [];
  let currentGuess = '';
  let gameOver = false;
  let won = false;
  let wordLists = { answers: [], guesses: [] };

  const WORD_LENGTH = 5;
  const MAX_GUESSES = 6;

  /**
   * Evaluates a guess against the target word.
   * Returns array of: 'correct' | 'present' | 'absent'
   */
  function evaluateGuess(guess, target) {
    const result = new Array(WORD_LENGTH).fill('absent');
    const targetCounts = {};
    const guessCounts = {};

    // First pass: mark correct (green)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
      } else {
        targetCounts[target[i]] = (targetCounts[target[i]] || 0) + 1;
      }
    }

    // Second pass: mark present (yellow) - only if letter exists and we haven't over-counted
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== 'correct') {
        const letter = guess[i];
        const targetCount = targetCounts[letter] || 0;
        const usedCount = guessCounts[letter] || 0;
        if (targetCount > usedCount) {
          result[i] = 'present';
          guessCounts[letter] = usedCount + 1;
        }
      }
    }

    return result;
  }

  /**
   * Picks a random word from the answers list.
   */
  function getRandomWord() {
    const idx = Math.floor(Math.random() * wordLists.answers.length);
    return wordLists.answers[idx];
  }

  return {
    /**
     * Initialize the game with word lists.
     * @param {Object} lists - { answers: string[], guesses: string[] }
     */
    init(lists) {
      if (!lists || !lists.answers?.length || !lists.guesses?.length) {
        throw new Error('Invalid word lists: need both answers and guesses arrays');
      }
      wordLists = lists;
    },

    /**
     * Start a new game. Optionally pass a specific target word for testing.
     */
    newGame(specificWord) {
      targetWord = (specificWord || getRandomWord()).toLowerCase();
      guesses = [];
      currentGuess = '';
      gameOver = false;
      won = false;
      return { targetWord: gameOver ? targetWord : undefined };
    },

    /**
     * Add a letter to the current guess.
     */
    addLetter(letter) {
      if (gameOver || currentGuess.length >= WORD_LENGTH) return false;
      currentGuess += letter.toLowerCase();
      return true;
    },

    /**
     * Remove the last letter from the current guess.
     */
    removeLetter() {
      if (currentGuess.length === 0) return false;
      currentGuess = currentGuess.slice(0, -1);
      return true;
    },

    /**
     * Submit the current guess.
     * @returns {Object} { valid, complete, evaluation, won, lost }
     */
    submitGuess() {
      if (gameOver) return { valid: false, complete: false };
      if (currentGuess.length !== WORD_LENGTH) {
        return { valid: false, complete: false, error: 'Not enough letters' };
      }

      const guess = currentGuess.toLowerCase();
      if (!wordLists.guesses.includes(guess)) {
        return { valid: false, complete: false, error: 'Not in word list' };
      }

      const evaluation = evaluateGuess(guess, targetWord);
      guesses.push({ word: guess, evaluation });

      const allCorrect = evaluation.every((e) => e === 'correct');
      won = allCorrect;
      gameOver = allCorrect || guesses.length >= MAX_GUESSES;

      currentGuess = '';

      return {
        valid: true,
        complete: true,
        evaluation,
        guess: guess,
        won,
        lost: gameOver && !won,
        guessesRemaining: MAX_GUESSES - guesses.length,
      };
    },

    /**
     * Get current game state (for UI).
     */
    getState() {
      return {
        guesses,
        currentGuess,
        gameOver,
        won,
        maxGuesses: MAX_GUESSES,
        wordLength: WORD_LENGTH,
      };
    },

    /**
     * Get the target word (only when game is over).
     */
    getTargetWord() {
      return gameOver ? targetWord : null;
    },

    /**
     * Get keyboard letter states based on all guesses.
     * Returns { letter: 'correct'|'present'|'absent' }
     */
    getKeyboardState() {
      const state = {};
      for (const { word, evaluation } of guesses) {
        for (let i = 0; i < WORD_LENGTH; i++) {
          const letter = word[i];
          const ev = evaluation[i];
          if (!state[letter] || ev === 'correct') {
            state[letter] = ev;
          } else if (ev === 'present' && state[letter] !== 'correct') {
            state[letter] = 'present';
          } else if (ev === 'absent' && !state[letter]) {
            state[letter] = 'absent';
          }
        }
      }
      return state;
    },
  };
})();
