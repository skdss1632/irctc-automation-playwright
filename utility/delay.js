/**
 * @param {number} seconds - Number of seconds to sleep
 */
async function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}


/**
 * Sleep for specified milliseconds
 * @param {number} ms - Number of milliseconds to sleep
 */
async function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


/**
 * Random integer between min and max (inclusive) - like Python's random.randint
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randint(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Random float between min and max - like Python's random.uniform
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random float
 */

function uniform(min, max) {
  return Math.random() * (max - min) + min;
}


/**
 * Random delay in milliseconds
 * @param {number} min - Minimum milliseconds (default 500)
 * @param {number} max - Maximum milliseconds (default 1500)
 * @returns {number} Random milliseconds
 */
function randomDelay(min, max) {
  return randint(min, max);
}


/**
 * Random choice from array - like Python's random.choice
 * @param {Array} array - Array to choose from
 * @returns {*} Random element from array
 */
function choice(array) {
  return array[Math.floor(Math.random() * array.length)];
}


module.exports = {
  sleep,
  sleepMs,
  randint,
  uniform,
  randomDelay,
  choice,
};
