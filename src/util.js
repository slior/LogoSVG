
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

module.exports = {
    assertInRange,
    assertIsNum,
    assertNotNull,
    assertNonNegativeNum
}