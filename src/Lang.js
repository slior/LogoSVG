
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const {Forward,Right, Program, Loop, SetPenColor, PenActive, Comment, BinaryOp, NumberLiteral} = require("./IR")

const g = String.raw`
    LogoSVG {
        Program = ProgramElements
        
        SingleCommand = Command ";"
        ProgramElement = SingleCommand | comment
        ProgramElements = (ProgramElement )? (~";" ProgramElement)*

        Command = forward | right | left | Loop | pen_color | pen_up | pen_down | back
        
        forward = "fd" spaces expr
        back = "bk" spaces expr
        right = "rt" spaces expr
        left = "lt" spaces expr
        pen_color = "pc" spaces color_name
        pen_up = "pu"
        pen_down = "pd"
        color_name = alnum+ //should be any color allowed in the SVG styling
        int = digit+

        Loop = "repeat" spaces expr ProgramElements "end"
        comment = "//" (~"\n" any)*

        ///Arithmetic Expressions
        expr = addOrSubExpr //Note: this is the lowest precedence, so it derives other higher precedence operations
        
        //A fraction or integer
        positiveFractionLiteral = int? "." int
        positiveNumberLiteral = positiveFractionLiteral | int

        //To build precedence into the grammar, each higher precedence operator derives a lower precedence operator

        addOp = addOrSubExpr spaces "+" spaces multOrDivExpr
        subOp = addOrSubExpr spaces "-" spaces multOrDivExpr
        addOrSubExpr = addOp | subOp | multOrDivExpr

        multOrDivExpr = multOrDivExpr spaces "*" spaces exponentExpr --mult
        | multOrDivExpr spaces "/" spaces exponentExpr --div
        | exponentExpr
        
        exponentExpr = exponentExpr spaces "^" spaces positiveNumberLiteral --exp
        | positiveNumberLiteral
    }
`


const lang = ohm.grammar(g);



function createParser()
{
    let irBuilder = lang.createSemantics();

    /**
     * As IR turns the tokens into the intermediate reprsentation.
     * It's defined, for each rule, as 
     *   asIR: list of tokens => list of IR elements
     */
    irBuilder.addOperation("asIR()",{
        forward(_, __, howMuch) { 
            return [new Forward(howMuch.asIR()[0])]
        },
    
        back(_,__,howMuch) {
            //rewriting to right(180)-forward(howMuch)-right(180)
            return [
                new Right(new NumberLiteral(180)),
                new Forward(howMuch.asIR()[0]),
                new Right(new NumberLiteral(180))
            ]
        },

        right(_, __, howMuch) { 
            return [new Right(howMuch.asIR()[0])]
        }, 

        left(_,__,howMuch) {
            //note: rewriting left as a right statement
            let angle = howMuch.asIR()[0];
            return [new Right(new BinaryOp("-",new NumberLiteral(360),angle))]
        },
        pen_color(_,__,color) {
            return [new SetPenColor(color.asIR()[0])]
        },
        pen_up(_) {
            return [new PenActive(false)];
        },
        pen_down(_) {
            return [new PenActive(true)];
        },
        color_name(color)
        {
            return [color.sourceString]
        },
    
        Command(c) {
            return c.asIR();
        },

        SingleCommand(c,_)
        {
            return c.asIR();
        },

        ProgramElement(prgEl) {
            return prgEl.asIR();
        },

        ProgramElements (maybeFirstElement, restOfElements)
        {
            let first = maybeFirstElement.children.length > 0 ? maybeFirstElement.children[0].asIR() : []
            let otherElements = restOfElements.children.flatMap(e => e.asIR())
            return first.concat(otherElements)
        },

        Program(programElements) {
            return [new Program(programElements.asIR())]
        },
    
        comment(_,text) {
            return [new Comment(text.sourceString)]
        },
    
        _iter(...commands) {
            return commands.flatMap(c => c.asIR())
        },

        _terminal() {
            return [this.sourceString]
        }

        , Loop(_, __, iters,commandList,___) {
            return [new Loop(iters.asIR()[0],commandList.asIR())]
        }

        , int(i) { return new NumberLiteral(parseInt(i.sourceString)) }
        , positiveFractionLiteral(maybeInt,__,someFraction) {
            let intPart = maybeInt.children.length > 0 ? 
                                maybeInt.sourceString
                                : '0';
            let fractionPart = someFraction.sourceString;
            let num = parseFloat(intPart + "." + fractionPart)
            return new NumberLiteral(num)
        }
        , positiveNumberLiteral(someNum) {
            return [someNum.asIR()]
        }
        , addOp(arg1,_,__,___,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            return [new BinaryOp('+',op1,op2)]
        }
        ,subOp (arg1,_,__,___,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            return [new BinaryOp('-',op1,op2)]
        }
        , multOrDivExpr_mult(arg1,_,__,___,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            return [new BinaryOp('*',op1,op2)]
        },

        multOrDivExpr_div(arg1,_,__,___,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            return [new BinaryOp('/',op1,op2)]
        },

        exponentExpr_exp(arg1,_,__,___,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            return [new BinaryOp('^',op1,op2)]
        }
    })
    
    return (programText) => {
        let m = lang.match(programText);
        if (m.succeeded())
            return irBuilder(m).asIR()[0]; //the single element should be the Program
        else
            throw new Error(`Failed to parse program: ${m.message}`)
    }
}

module.exports = {
    createParser
}