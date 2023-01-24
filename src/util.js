
function assertIsNum(val,msg)
{
    assertNotNull(val);
    if (isNaN(val))
        throw new Error(msg ? msg : `${val} is not a number`);
}

function assertInRange(val,low,high,msg)
{

    assertIsNum(val);
    assertIsNum(low);
    assertIsNum(high);

    if (val < low || val > high)
        throw new Error(msg ? msg : `${val} is out of bound [${low},${high}]`)
}

function assertNotNull(val,msg)
{
    if (val === null)
        throw new Error(msg ? msg : `value is null`)
}

function assertNonNegativeNum(val,msg)
{
    assertIsNum(val);
    if (val < 0)
        throw new Error(msg ? msg : `${val} is negative`)
}

/**
 * Returns the first argument, unless it's undefined in which case it evaluates to the 2nd argument
 * @param {any} v The argument to test and retrieve if defined
 * @param {any} def The default value to return if the 1st is undefined
 */
const ifUndefined = (v,def) => v === undefined ? def : v
/**
 * Tests if the given value is undefined, and if not, executes the given block
 * @param {any} v The value to test
 * @param {function} block The block to execute if the value is undefined
 */
const ifNotUndefinedDo = (v,block) => { if (v !== undefined) block() }

/**
 * Tests if the given string is non-empty. If it is - throws an error
 * If it's not empty - returns the string
 * @param {String} s The string to test
 * @param {String} msg An error message to show, optional.
 */
function assertNonEmpty(s,msg = undefined)
{
    assertNotNull(s)
    if (s === '')
        throw new Error(msg ? msg : `String is empty`)
    return s;
}

module.exports = {
    assertInRange,
    assertIsNum,
    assertNotNull,
    assertNonNegativeNum,
    ifUndefined,
    ifNotUndefinedDo,
    assertNonEmpty
}