
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const {Forward,Right, Program, Loop, SetPenColor, PenActive, Comment} = require("./IR")

const g = String.raw`
    LogoSVG {
        Program = ProgramElements
        
        ProgramElement = Command | comment
        ProgramElements = ProgramElement*

        Command = forward | right | left | Loop | pen_color | pen_up | pen_down | back
        CommandList = Command? (~";" Command)*
          
        forward = "fd" spaces int
        back = "bk" spaces int
        right = "rt" spaces int
        left = "lt" spaces int
        pen_color = "pc" spaces color_name
        pen_up = "pu"
        pen_down = "pd"
        color_name = alnum+ //should be any color allowed in the SVG styling
        int = digit+

        Loop = "repeat" spaces int ProgramElements "end"

        comment = "//" (~"\n" any)* "\n"
        
    }
`


const lang = ohm.grammar(g);


function createPrettyPrinter()
{
    const semantics = lang.createSemantics();
    semantics.addOperation("code()",{
        forward(_, __, howMuch) { 
            return `Forward ${howMuch.sourceString}`
        },
    
        right(_, __, howMuch) { return `Right ${howMuch.sourceString}`}, 
    
        int(i) { return `${i.sourceString}`}, 
    
        Command(c) {
            return c.code();
        },
    
        Program(firstCommand, commands) {
            let first = firstCommand.code();
            let restOfCode = commands.children.map(c => c.code()).join("\n")
            return first + "\n" + restOfCode;
        }, 
    
        _iter(...commands) {
            return commands.map(c => c.code()).join("\n");
        }
    })
}

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
                new Right(180),
                new Forward(howMuch.asIR()[0]),
                new Right(180)
            ]
        },

        right(_, __, howMuch) { 
            return [new Right(howMuch.asIR()[0])]
        }, 

        left(_,__,howMuch) {
            //note: rewriting left as a right statement
            let angle = howMuch.asIR()[0];
            return [new Right(360 - angle)]
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
    
        int(i) { return [parseInt(i.sourceString)] }, 
    
        Command(c) {
            return c.asIR();
        },
    
        CommandList( firstCommand,commands) {
            let first = firstCommand.children.length > 0 ? firstCommand.children[0].asIR() : [] //it's optional, so token may not exist
            let restOfCode = commands.children.flatMap(c=>c.asIR())
            return first.concat(restOfCode)
        }, 

        ProgramElement(prgEl) {
            return prgEl.asIR();
        },

        Program(programElements) {
            return [new Program(programElements.asIR())]
        },
    
        comment(_,text,nl) {
            return [new Comment(text.sourceString)]
        },
    
        _iter(...commands) {
            return commands.flatMap(c => c.asIR())
        },

        _terminal() {
            return [this.sourceString]
        }

        , Loop(_, __, iters,commandList,___) {
            return new Loop(iters.asIR()[0],commandList.asIR())

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