//Grammar as a js file, so it will work in browser (w/ webpack)

const grammar = String.raw`
LogoSVG {
        Program = ProgramElements
        
        SingleStatement = Statement ";"
        ProgramElement = SingleStatement | comment
        ProgramElements = (ProgramElement )? (~";" ProgramElement)*

        reserved_word = fd | bk | rt | lt | pc | pu
                        | pd | repeat | block_end
                        | let | if | then | else
                        | while | procedure | call
                        | with
        fd = "fd"
        bk = "bk"
        rt = "rt"
        lt = "lt"
        pc = "pc"
        pu = "pu"
        pd = "pd"
        repeat = "repeat"
        block_end = "end"
        let = "let"
        if = "if"
        then = "then"
        else = "else"
        while = "while"
        procedure = "procedure"
        call = "call"
        with = "with"
        say = "say"

        ///---------- Statements
        Statement = Forward | Right | Left | Loop 
                    | Pen_color | Pen_up | Pen_down
                    | Back | VarDecl | VarAssign 
                    | Branch | WhileLoop | ProcDef
                    | ProcCall | Say

        Forward = fd Expr
        Back = bk Expr
        Right = rt Expr
        Left = lt Expr
        Pen_color = pc color_name
        Pen_up = pu
        Pen_down = pd
        Loop = repeat Expr ProgramElements block_end
        WhileLoop = while ComparisonExpr ProgramElements block_end
        VarDecl = let ident "=" Expr
        VarAssign = ident "=" Expr
        Branch = if ComparisonExpr then ProgramElements block_end --then
             |   if ComparisonExpr then ProgramElements else ProgramElements block_end --else
        
        ParamList =  (ident)? ("," ident)*
        ProcDef = procedure ident "(" ParamList ")" ":" ProgramElements block_end
        
        ArgList =  (VarAssign)? ("," VarAssign)*
        ProcCall = call ident with ArgList --withArgs
        | call ident --noArgs

        textCharacter = alnum | space
        TextLiteral = textCharacter*
        Say = say "'" TextLiteral "'" //only literal text

        ///------------- Comparsion Operators
        ComparisonOp = "<" | ">" | "<=" | ">="
                       | "==" | "=/="
        ComparisonExpr = Expr ComparisonOp Expr
        
        ///------------- Arithmetic Expressions
        Expr = AddOrSubExpr //Note: this is the lowest precedence, so it derives other higher precedence operations
        
        //A fraction or integer
        int = digit+
        positiveFractionLiteral = int? "." int
        positiveNumberLiteral = positiveFractionLiteral | int

        //To build precedence into the grammar, each higher precedence operator derives a lower precedence operator

        AddOrSubExpr = AddOrSubExpr "+" MultOrDivExpr --add
        | AddOrSubExpr "-" MultOrDivExpr --sub
        | MultOrDivExpr

        MultOrDivExpr = MultOrDivExpr "*" ExponentExpr --mult
        | MultOrDivExpr "/" ExponentExpr --div
        | MultOrDivExpr "%" ExponentExpr --mod
        | ExponentExpr
        
        ExponentExpr = ParentExpr "^" ExponentExpr --exp
        | ParentExpr

        ParentExpr = "(" Expr ")" --parenthesis
        | "-" ParentExpr --negative
        | ident --var
        | positiveNumberLiteral
        

        ///----------- Other complementary definitions
        identStart = "_" | letter
        identChar = "_" | alnum
        full_ident = identStart identChar*

        ident = ~reserved_word full_ident
        color_name = alnum+ //should be any color allowed in the SVG styling
        
        comment = "//" (~"\n" any)*

    }
    `
module.exports = grammar