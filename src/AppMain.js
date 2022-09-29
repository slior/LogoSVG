
const { VMState } = require("./VMState.js")
const { createParser } = require("./Lang")
const { ProgramRunner } = require("./ProgramRunner")


function initApp(drawingContainer,startingX,startingY,startingAngle)
{
    let context = new VMState(startingX,startingY,startingAngle);
    return new ProgramRunner(context,drawingContainer);
}

function parseCode(programCode)
{
    let parser = createParser()

    let program = parser(programCode);
    return program;
}

module.exports = {
    initApp,
    parseCode
}
