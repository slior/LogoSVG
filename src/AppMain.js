
const { VMState } = require("./VMState.js")
const { createParser } = require("./Lang")
const { ProgramRunner } = require("./ProgramRunner")

var initialCursorCoords = { x : 0, y : 0, angle : 0}
var programRunner = null;

function initApp(drawingContainer,startingX,startingY,startingAngle)
{
    let context = new VMState(startingX,startingY,startingAngle);
    initialCursorCoords = { x: startingX, y: startingY, angle : startingAngle}
    programRunner = new ProgramRunner(context,drawingContainer);
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

function parseCode(programCode)
{
    let parser = createParser()

    let program = parser(programCode);
    return program;
}

module.exports = {
    initApp,
    parseCode,
    resetState
}
