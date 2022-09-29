
// const { LogoProcessor } = require("./LogoProcessor.js")
const { DrawingContext } = require("./DrawingContext.js")
const { createParser } = require("./Lang")
const { ProgramRunner } = require("./ProgramRunner")


function initApp(drawingContainer,startingX,startingY,startingAngle)
{
    let context = new DrawingContext(startingX,startingY,startingAngle,drawingContainer);
    return new ProgramRunner(context);
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
