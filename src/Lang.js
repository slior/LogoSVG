
import ohm from 'ohm-js'


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


export function createPrettyPrinter()
{
    const semantics = lang.createSemantics();
    semantics.addOperation("code()",{
        forward(keyword, spaces, howMuch) { 
            return `Forward ${howMuch.sourceString}`
        },
    
        right(keyword, spaces, howMuch) { return `Right ${howMuch.sourceString}`}, 
    
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

export function createParser(commandsActions)
{
    let logoSemantics = lang.createSemantics();
    logoSemantics.addOperation("toLogo()",{
        forward(keyword, spaces, howMuch) { 
            return commandsActions.createForward(howMuch.toLogo())
        },
    
        right(keyword, spaces, howMuch) { 
            return commandsActions.createRight(howMuch.toLogo())
        }, 
    
        int(i) { return parseInt(i.sourceString)}, 
    
        Command(c) {
            return c.toLogo();
        },
    
        Program( firstCommand,commands) {
            let first = firstCommand.children.length > 0 ? firstCommand.children[0].toLogo() : {}
            let restOfCode = commands.children.map(c => c.toLogo())
            return [first, ...restOfCode];
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
