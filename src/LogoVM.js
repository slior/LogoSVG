
const { SVG } = require('@svgdotjs/svg.js')
const {assertNonNegativeNum,assertNotNull} = require("./util")
const {Forward,Right, Loop, SetPenColor, PenActive} = require("./IR")

var COMMAND_MAP = null;

function commandMap(processor)
{
    if (!COMMAND_MAP)
    {
        let commands = {}
        commands[Forward.action] = (st,vms) => { return processor.forward(st.howMuch,vms); }
        commands[Right.action] = (st,vms) => { return processor.right(st.howMuch,vms); }
        commands[Loop.action] = (st,vms) => { return processor.loop(st.iterCount,st.statements,vms); }
        commands[SetPenColor.action] = (st,vms) => { return processor.setPenColor(st.penColor, vms); }
        commands[PenActive.action] = (st,vms) => { return processor.setPenActive(st.isActive, vms); }
        COMMAND_MAP = commands;
    }
    return COMMAND_MAP
}

const createSVGImpl = (drawingElement) => SVG().addTo(drawingElement).addClass("drawingSVG")

class LogoVM
{
    /**
     * 
     * @param {Object} drawingElement The containing element in which to draw the result
     * @param {Function} vmUnderlyingImpl A builder function that creates the underlying implementation. Allows injecting mock implementations. Defaults to an internal SVG implementation
     */
    constructor(drawingElement, vmUnderlyingImpl = undefined)
    {
        assertNotNull(drawingElement);
        this.draw = vmUnderlyingImpl === undefined ? createSVGImpl(drawingElement) : vmUnderlyingImpl(drawingElement)
    }

    get drawingObj() {
        return this.draw
    }

    clearDrawing()
    {
        this.drawingObj.clear();
    }

    processStatement(st, vmState)
    {
        let commands = commandMap(this);
        let cmd = commands[st.action];
        if (cmd)
        {
            // console.log(`Executing: ${st.action}, ${JSON.stringify(st)}`)
            return cmd.apply(this,[st,vmState])
        }
        else
        {
            console.log(`command ${st.action} not recognized`);
            return vmState;
        }
    }

    forward(len,vmState)
    {
        let x2 = vmState.lastX + len * Math.cos(vmState.radianAngle())
        let y2 = vmState.lastY + len * Math.sin(vmState.radianAngle())
        if (vmState.penActive)
            this.drawingObj.line(vmState.lastX, vmState.lastY, x2, y2).stroke({ color: vmState.penColor,width: 1 }) 
        return vmState.withLastPoint(x2,y2);
    }

    right(angle,vmState)
    {
        return vmState.withAngle(vmState.angle + angle)
    }

    loop(iterCount,statements,vmState)
    {
        assertNonNegativeNum(iterCount)
        var iters = iterCount
        var stateForIteration = vmState
        while (iters > 0)
        {
            stateForIteration = statements.reduce((lastState,st) => this.processStatement(st,lastState), stateForIteration)
            iters--;
        }
        return stateForIteration; //this is the result of executing the last iteration
    }

    setPenColor(color,vmState)
    {
        return vmState.withPenColor(color)
    }

    setPenActive(isActive,vmState)
    {
        return vmState.withPenActive(isActive)
    }
}


module.exports = {
    LogoVM
}