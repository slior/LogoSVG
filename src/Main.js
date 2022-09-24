
const { LogoProcessor } = require("./LogoProcessor.js")
const { DrawingContext } = require("./DrawingContext.js")
const { createParser } = require("./Lang")
const { Painter } = require("./Painter")


function newPainter(drawingContainer,startingX,startingY,startingAngle)
{
    let context = new DrawingContext(startingX,startingY,startingAngle,drawingContainer);
    let p = new LogoProcessor();
    return new Painter(p,context);
}

function parseCode(programCode)
{
    let parser = createParser()

    let program = parser(programCode);
    // console.log(`Parsed program: ${JSON.stringify(program)}`)
    return program;
}

module.exports = {
    newPainter,
    parseCode
}
