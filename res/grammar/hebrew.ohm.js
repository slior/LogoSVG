//Grammar as a js file, so it will work in browser (w/ webpack)

const grammar = String.raw`
LogoSVGHeb <: BaseGrammar { //overrides the keywords to hebrew keywords, and allows hebrew identifiers

        fd :=  "\u05E7\u05D3" //קד
        bk := "\u05D0\u05D7" //אח
        rt := "\u05D9\u05DE" //ימ
        lt := "\u05E9\u05DE"  //שמ
        pc := "\u05E6\u05D1\u05E2" //צבע
        pu := "\u05D4\u05E8\u05DD" //הרם
        pd := "\u05D4\u05D5\u05E8\u05D3" //הורד
        repeat := "\u05D7\u05D6\u05D5\u05E8" //חזור
        block_end := "\u05E1\u05D5\u05E3" //סוף
        let := "\u05D9\u05D4\u05D0" //יהא
        if := "\u05D0\u05DD"  //אם
        then := "\u05D0\u05D6"  //אז
        else := "\u05D0\u05D7\u05E8\u05EA" //אחרת
        while := "\u05DB\u05DC\u05E2\u05D5\u05D3" //כלעוד
        procedure := "\u05E9\u05D2\u05E8\u05D4" //שגרה
        call := "\u05D4\u05E4\u05E2\u05DC" //הפעל
        with := "\u05E2\u05DD" // עם
        say := "\u05D0\u05DE\u05D5\u05E8" //אמור

        /// support hebrew identifiers
        identStart := ... | "\u05D0".."\u05EA"
        identChar := ... | "\u05D0".."\u05EA"

    }
    `
module.exports = grammar