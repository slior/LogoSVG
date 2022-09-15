
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const {Forward,Right, Program} = require("./IR")

const g = String.raw`
    LogoSVG {
        Program = CommandList
        
        Command = forward | right
        CommandList = Command? (~";" Command)*
          
        forward = "fd" spaces int
        right = "rt" spaces int
        int = digit+

        //loop = "repeat" spaces int CommandList "end"
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
    irBuilder.addOperation("asIR()",{
        forward(_, __, howMuch) { 
            return new Forward(howMuch.asIR())
        },
    
        right(_, __, howMuch) { 
            return new Right(howMuch.asIR())
        }, 
    
        int(i) { return parseInt(i.sourceString)}, 
    
        Command(c) {
            return c.asIR();
        },
    
        CommandList( firstCommand,commands) {
            let first = firstCommand.children.length > 0 ? firstCommand.children[0].asIR() : {}
            let restOfCode = commands.children.map(c => c.asIR())
            return [first, ...restOfCode];
        }, 

        Program(commandList) {
            return new Program(commandList.asIR())
        },
    
        _iter(...commands) {
            return commands.map(c => c.asIR())
        }
    })
    
    return (programText) => {
        let m = lang.match(programText);
        if (m.succeeded())
            return irBuilder(m).asIR();
        else
            throw new Error(`Failed to parse program: ${m.message}`)
    }
}

module.exports = {
    createParser
}