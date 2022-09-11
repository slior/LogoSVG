
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const {Forward,Right, Program} = require("./IR")

const g = String.raw`
    LogoSVG {
        Program = Command? (~";" Command)*
        
        Command = forward | right
          
  
        forward = "fd" spaces int
        right = "rt" spaces int
        int = digit+
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
    let logoSemantics = lang.createSemantics();
    logoSemantics.addOperation("toLogo()",{
        forward(_, __, howMuch) { 
            return new Forward(howMuch.toLogo())
        },
    
        right(_, __, howMuch) { 
            return new Right(howMuch.toLogo())
        }, 
    
        int(i) { return parseInt(i.sourceString)}, 
    
        Command(c) {
            return c.toLogo();
        },
    
        Program( firstCommand,commands) {
            let first = firstCommand.children.length > 0 ? firstCommand.children[0].toLogo() : {}
            let restOfCode = commands.children.map(c => c.toLogo())
            return new Program([first, ...restOfCode]);
        }, 
    
        _iter(...commands) {
            return commands.map(c => c.toLogo())
        }
    })
    
    return (programText) => {
        let m = lang.match(programText);
        if (m.succeeded())
            return logoSemantics(m).toLogo();
        else
            throw new Error(`Failed to parse program: ${m.message}`)
    }
}

module.exports = {
    createParser
}