
const assert = require('assert')
const { SVG } = require('@svgdotjs/svg.js')
const {assertNonNegativeNum,assertNotNull} = require("./util")
const {Forward,Right, Loop, SetPenColor, PenActive, NumberLiteral, BinaryOp, VarDecl,VarEvaluation} = require("./IR")

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
        commands[VarDecl.action] = (st,vms) => processor.declareVar(st,vms)
        COMMAND_MAP = commands;
    }
    return COMMAND_MAP
}

const createSVGImpl = (drawingElement) => SVG().addTo(drawingElement).addClass("drawingSVG")

class ExprEval
{
    constructor() 
    { 
        this.handlersByType = {}
        this.handlersByType[NumberLiteral.name] = (e,vmState) => this.evalNumberLiteral(e,vmState)
        this.handlersByType[BinaryOp.name] = (e,vmState) => this.evalBinOp(e,vmState)
        this.handlersByType[VarEvaluation.name] = (e,vmState) => this.evalVar(e,vmState)
    }

    eval(expr,vmState) 
    {
        return this.findEvalFuncFor(expr).apply(this,[expr,vmState])
    }

    findEvalFuncFor(expr)
    {
        let handler = this.handlersByType[expr.constructor.name]
        if (handler)
            return handler
        else
            throw new Error("Can't find handler for expression")
    }

    evalNumberLiteral(numExp,_)
    {
        assert(numExp instanceof NumberLiteral,"expression must be number literal")
        return numExp.number;
    }

    evalBinOp(binOpExp,vmState)
    {
        assert(binOpExp instanceof BinaryOp,"expression must be a binary operation")
        let arg1 = this.eval(binOpExp.operand1,vmState)
        let arg2 = this.eval(binOpExp.operand2,vmState)
        switch (binOpExp.operator)
        {
            case '+' : return arg1 + arg2;
            case '-' : return arg1 - arg2;
            case '*' : return arg1 * arg2;
            case '/' : return arg1 / arg2;
            case '^' : return Math.pow(arg1,arg2);
            default : throw new Error(`Unknown binary operator ${binOpExp.operator}`)
        }
    }

    evalVar(varExpr,vmState)
    {
        assert(varExpr instanceof VarEvaluation,"Expected var evaluation")
        return vmState.valueOf(varExpr.varName)
    }
}

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
        this.exprEvaluator = new ExprEval()
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

    declareVar(varDecl,vmState)
    {
        let initialValue = this.exprEvaluator.eval(varDecl.initializer,vmState)
        return vmState.withNewVar(varDecl.varName,initialValue)
    }

    forward(len,vmState)
    {
        let howMuch = this.exprEvaluator.eval(len,vmState)
        assertNonNegativeNum(howMuch,`Forward can only accept non-negative values. Got ${howMuch}; (maybe as result of expression evaluation?)`)
        let x2 = vmState.lastX + howMuch * Math.cos(vmState.radianAngle())
        let y2 = vmState.lastY + howMuch * Math.sin(vmState.radianAngle())
        if (vmState.penActive)
            this.drawingObj.line(vmState.lastX, vmState.lastY, x2, y2).stroke({ color: vmState.penColor,width: 1 }) 
        return vmState.withLastPoint(x2,y2);
    }

    right(angle,vmState)
    {
        let actualAngle = this.exprEvaluator.eval(angle,vmState)
        assertNonNegativeNum(actualAngle,`Angle must be non-negative. Got ${actualAngle}; (maybe as result of expression evaluation?)`)
        return vmState.withAngle(vmState.angle + actualAngle)
    }

    loop(_iterCount,statements,vmState)
    {
        let iterCount = this.exprEvaluator.eval(_iterCount,vmState)
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