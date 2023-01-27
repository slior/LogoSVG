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
        fd =  "\u05E7\u05D3" //קד
        bk = "\u05D0\u05D7" //אח
        rt = "\u05D9\u05DE" //ימ
        lt = "\u05E9\u05DE"  //שמ
        pc = "\u05E6\u05D1\u05E2" //צבע
        pu = "\u05D4\u05E8\u05DD" //הרם
        pd = "\u05D4\u05D5\u05E8\u05D3" //הורד
        repeat = "\u05D7\u05D6\u05D5\u05E8" //חזור
        block_end = "\u05E1\u05D5\u05E3" //סוף
        let = "\u05D9\u05D4\u05D0" //יהא
        if = "\u05D0\u05DD"  //אם
        then = "\u05D0\u05D6"  //אז
        else = "\u05D0\u05D7\u05E8\u05EA" //אחרת
        while = "\u05DB\u05DC\u05E2\u05D5\u05D3" //כלעוד
        procedure = "\u05E9\u05D2\u05E8\u05D4" //שגרה
        call = "\u05D4\u05E4\u05E2\u05DC" //הפעל
        with = "\u05E2\u05DD" // עם
        say = "\u05D0\u05DE\u05D5\u05E8" //אמור

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
        identStart = "_" | letter | "\u05D0".."\u05EA"
        identChar = "_" | alnum | "\u05D0".."\u05EA"
        full_ident = identStart identChar*

        ident = ~reserved_word full_ident
        color_name = alnum+ //should be any color allowed in the SVG styling
        
        comment = "//" (~"\n" any)*

    }
    `
module.exports = grammar