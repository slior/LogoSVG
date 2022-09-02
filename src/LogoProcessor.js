
class LogoProcessor
{
    processStatement(st, drawingContext)
    {
        let commands = {
            "fd" : (st) => { 
                let len = st.params[0]
                let x2 = drawingContext.lastX + len * Math.cos(drawingContext.radianAngle())
                let y2 = drawingContext.lastY + len * Math.sin(drawingContext.radianAngle())
                drawingContext.drawingObj().line(drawingContext.lastX, drawingContext.lastY, x2, y2).stroke({ color: "black",width: 1 }) 
                drawingContext.lastPointIs(x2,y2);
                return drawingContext;
            },
            "rt" : (st) => {
                let a = st.params[0]
                drawingContext.setAngle(drawingContext.angle + a)
            },
            "loop" : (st) => {
                var iters = st.iterations;
                while (iters > 0)
                {
                    st.statements.forEach(st => this.processStatement(st,drawingContext))
                    iters--;
                }
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
}


module.exports = {
    LogoProcessor
}