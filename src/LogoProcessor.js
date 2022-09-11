
const {assertNonNegativeNum} = require("./util")
const {Forward,Right} = require("./IR")

class LogoProcessor
{
    processStatement(st, drawingContext)
    {
        let commands = {
            "fd" : (st) => { 
                this.forward(st.howMuch,drawingContext);
            },
            "rt" : (st) => {
                this.right(st.howMuch,drawingContext);
            },
            "loop" : (st) => {
                this.loop(st.iterations,st.statements,drawingContext);

            }
        }

        let cmd = commands[st.action];
        if (cmd)
        {
            // console.log(`Executing: ${st.action}, ${JSON.stringify(st)}`)
            cmd.apply(this,[st])
        }
        else
        {
            console.log(`command ${st.action} not recognized`);
        }
    }

    forward(len,drawingContext)
    {
        let x2 = drawingContext.lastX + len * Math.cos(drawingContext.radianAngle())
        let y2 = drawingContext.lastY + len * Math.sin(drawingContext.radianAngle())
        drawingContext.drawingObj().line(drawingContext.lastX, drawingContext.lastY, x2, y2).stroke({ color: "black",width: 1 }) 
        drawingContext.lastPointIs(x2,y2);
    }

    right(angle,drawingContext)
    {
        drawingContext.setAngle(drawingContext.angle + angle)
    }

    loop(iterCount,statements,drawingContext)
    {
        assertNonNegativeNum(iterCount)
        var iters = iterCount
        while (iters > 0)
        {
            statements.forEach(st => this.processStatement(st,drawingContext))
            iters--;
        }
    }
}


module.exports = {
    LogoProcessor
}