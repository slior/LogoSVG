
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const {Forward,Right, Program, Loop, SetPenColor, PenActive, Comment, BinaryOp, NumberLiteral,VarEvaluation,VarDecl} = require("./IR")

const g = String.raw`
    LogoSVG {
        Program = ProgramElements
        
        SingleCommand = Command ";"
        ProgramElement = SingleCommand | comment
        ProgramElements = (ProgramElement )? (~";" ProgramElement)*

        Command = Forward | Right | Left | Loop | Pen_color | Pen_up | Pen_down | Back | VarDecl
        
        Forward = "fd" Expr
        Back = "bk" Expr
        Right = "rt" Expr
        Left = "lt" Expr
        Pen_color = "pc" color_name
        Pen_up = "pu"
        Pen_down = "pd"
        color_name = alnum+ //should be any color allowed in the SVG styling
        int = digit+

        Loop = "repeat" Expr ProgramElements "end"
        comment = "//" (~"\n" any)*

        ///Arithmetic Expressions
        Expr = AddOrSubExpr //Note: this is the lowest precedence, so it derives other higher precedence operations
        
        //A fraction or integer
        positiveFractionLiteral = int? "." int
        positiveNumberLiteral = positiveFractionLiteral | int

        //To build precedence into the grammar, each higher precedence operator derives a lower precedence operator

        AddOrSubExpr = AddOrSubExpr "+" MultOrDivExpr --add
        | AddOrSubExpr "-" MultOrDivExpr --sub
        | MultOrDivExpr

        MultOrDivExpr = MultOrDivExpr "*" ExponentExpr --mult
        | MultOrDivExpr "/" ExponentExpr --div
        | ExponentExpr
        
        ExponentExpr = ParentExpr "^" ExponentExpr --exp
        | ParentExpr

        ParentExpr = "(" Expr ")" --parenthesis
        | "-" ParentExpr --negative
        | ident --var
        | positiveNumberLiteral
        
        identStart = "_" | letter
        identChar = "_" | alnum

        ident = identStart identChar*

        VarDecl = "let" ident "=" Expr
    }
`


const lang = ohm.grammar(g);



function createParser()
{
    let irBuilder = lang.createSemantics();

    const binOpIR = (op,arg1Node,arg2Node) => {
        let op1 = arg1Node.asIR()[0]
        let op2 = arg2Node.asIR()[0]
        return [new BinaryOp(op,op1,op2)]
    }
    /**
     * As IR turns the tokens into the intermediate reprsentation.
     * It's defined, for each rule, as 
     *   asIR: list of tokens => list of IR elements
     */
    irBuilder.addOperation("asIR()",{
        
        Forward(_, howMuch) { 
            return [new Forward(howMuch.asIR()[0])]
        },
    
        Back(_,howMuch) {
            //rewriting to right(180)-forward(howMuch)-right(180)
            return [
                new Right(new NumberLiteral(180)),
                new Forward(howMuch.asIR()[0]),
                new Right(new NumberLiteral(180))
            ]
        },

        Right(_, howMuch) { 
            return [new Right(howMuch.asIR()[0])]
        }, 

        Left(_,howMuch) {
            //note: rewriting left as a right statement
            let angle = howMuch.asIR()[0];
            return [new Right(new BinaryOp("-",new NumberLiteral(360),angle))]
        },
        Pen_color(_,color) {
            return [new SetPenColor(color.asIR()[0])]
        },
        Pen_up(_) {
            return [new PenActive(false)];
        },
        Pen_down(_) {
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

        , Loop(_, iters,commandList,___) {
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
        , AddOrSubExpr_add(arg1,_,arg2) {
            return binOpIR('+',arg1,arg2)
        }
        , AddOrSubExpr_sub (arg1,_,arg2) {
            return binOpIR('-',arg1,arg2)
        }
        , MultOrDivExpr_mult(arg1,_,arg2) {
            return binOpIR('*',arg1,arg2)
        },

        MultOrDivExpr_div(arg1,_,arg2) {
            return binOpIR('/',arg1,arg2)
        },

        ExponentExpr_exp(arg1,__,arg2) {
            return binOpIR('^',arg1,arg2)
        },

        ParentExpr_parenthesis(_,exp,__) {
            return exp.asIR();
        },

        ParentExpr_negative(_,expr) {
            //rewriting negation for an expression as a multiplication by -1
            let subExprIR = expr.asIR()[0]
            return [new BinaryOp("*",new NumberLiteral(-1),subExprIR)]
        },

        ParentExpr_var(varEval) {
            return [new VarEvaluation(varEval.asIR()[0])]
        },

        VarDecl(_,_varName,__,initializerExpr) {
            let varName = _varName.asIR()[0]
            let initExpr = initializerExpr.asIR()[0]
            return [new VarDecl(varName,initExpr)]
        },

        ident(firstChar,restOfChars) {
            let identifier = firstChar.sourceString + restOfChars.sourceString
            return [identifier]
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