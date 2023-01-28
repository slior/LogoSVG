//Grammar as a js file, so it will work in browser (w/ webpack)

const grammar = String.raw`
LogoSVGLong <: BaseGrammar { //overrides the keywords in english_terse variant
        
        fd := "forward"
        bk := "back"
        rt := "right"
        lt := "left"
        pc := "pen_color"
        pu := "pen_up"
        pd := "pen_down"
        repeat := "repeat"
        block_end := "end"
        let := "let"
        if := "if"
        then := "then"
        else := "else"
        while := "while"
        procedure := "procedure"
        call := "call"
        with := "with"
        say := "say"

    }
    `

module.exports = grammar