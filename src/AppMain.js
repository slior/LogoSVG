
const { VMState } = require("./VMState.js")
const { createParser,getLanguageKeywords } = require("./Lang")
const { ProgramRunner } = require("./ProgramRunner")
const {assertIsNum } = require("./util")

var initialCursorCoords = { x : 0, y : 0, angle : 0}
var programRunner = null;

function initApp(drawingContainer,startingX,startingY,startingAngle,msgCallback)
{
    assertIsNum(startingX);
    assertIsNum(startingY);
    assertIsNum(startingAngle);
    //Javascript... making sure we're dealing w/ numbers
    startingAngle *=1;
    startingX *=1;
    startingY *=1;
    let context = new VMState(startingX,startingY,startingAngle);
    initialCursorCoords = { x: startingX, y: startingY, angle : startingAngle}
    programRunner = new ProgramRunner(context,drawingContainer,msgCallback);
    return programRunner
}

function resetState()
{
    if (programRunner)
    {
        let newState = new VMState(initialCursorCoords.x,initialCursorCoords.y,initialCursorCoords.angle)
        programRunner.resetTo(newState);
    }
    else
    {
        console.error("ERROR: application not initialized")
    }
}

function parseCode(programCode,variant)
{
    if (!variant) throw new Error("Unspecified language variant")

    let parser = createParser(variant)
    let program = parser(programCode);
    return program;
}

module.exports = {
    initApp,
    parseCode,
    resetState,
    getLanguageKeywords
}
