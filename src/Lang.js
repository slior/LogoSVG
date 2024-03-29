
const _ohm = require('ohm-js')
const ohm = _ohm.default || _ohm; //workaround to allow importing using common js in node (for testing), and packing w/ webpack.

const { Forward,Right, Program, Loop, SetPenColor,
        PenActive, Comment, BinaryOp, 
        NumberLiteral,VarEvaluation,VarDecl,
        VarAssign,Branch,WhileLoop,
        ProcedureDef,ProcedureCall,
        Output,TextLiteral } = require("./IR")

const BASE_GRAMMAR_VARIANT = "english_terse"

function createGrammarNS()
{
    return ohm.createNamespace({BaseGrammar : ohm.grammar(loadGrammarSource(BASE_GRAMMAR_VARIANT))})
}

function loadGrammarSource(name)
{
    let grammarText = require(`../res/grammar/${name}.ohm.js`).grammar
    return grammarText;
}

function resolveGrammar(name)
{
    let ns = createGrammarNS()
    if (name == BASE_GRAMMAR_VARIANT)
        return ns.BaseGrammar
    else
        return ohm.grammar(loadGrammarSource(name),ns)
}

function getLanguageKeywords(name)
{
    let ret = require(`../res/grammar/${name}.ohm.js`).keywords
    return ret;
}

function createParser(variant)
{
    const lang = resolveGrammar(variant)
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
            let colorLiteral = color.asIR()[0]
            return [colorLiteral.text]
        },
    
        Statement(c) {
            return c.asIR();
        },

        SingleStatement(c,_)
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
            //TODO: consider re-writing as WhileLoop
            return [new Loop(iters.asIR()[0],commandList.asIR())]
        }

        , WhileLoop(_,condExpr,statements,__) {
            return [new WhileLoop(condExpr.asIR()[0],statements.asIR())]
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

        MultOrDivExpr_mod(arg1,_,arg2) {
            return binOpIR('%',arg1,arg2)
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
        
        VarAssign(_varName,_,_rhs) {
            let varName = _varName.asIR()[0]
            let rhs = _rhs.asIR()[0]
            return [new VarAssign(varName,rhs)]
        }, 

        full_ident(firstChar,restOfChars) {
            let identifier = firstChar.sourceString + restOfChars.sourceString
            return [identifier]
        },

        ComparisonExpr(arg1,op,arg2) {
            let op1 = arg1.asIR()[0]
            let op2 = arg2.asIR()[0]
            let operand = op.sourceString
            let expr = new BinaryOp(operand,op1,op2)
            return [expr]
        },

        Branch_then(_,compExpr,__,thenStmts,___) {
            return [new Branch(compExpr.asIR()[0],thenStmts.asIR())]
        },

        Branch_else(_,compExpr,__,thenStmts,___,elseStmts,____) {
            return [new Branch(compExpr.asIR()[0],thenStmts.asIR(),elseStmts.asIR())]
        },

        ParamList(firstParam,_,restOfParams) {
            let firstIdent = firstParam.children.flatMap(p => p.asIR());
            let rest = restOfParams.children.flatMap(p => p.asIR())
            return firstIdent.concat(rest);
        },

        ProcDef(_,name,__,paramList,___,_____,statements,______) {
            let params = paramList.asIR()
            let stmts = statements.asIR()
            return [new ProcedureDef(name.asIR()[0],params,stmts)]
        },

        ArgList(firstArg,_,restOfArgs) {
            let firstArgument = firstArg.children.flatMap(a => a.asIR());
            let rest = restOfArgs.children.flatMap(a => a.asIR());
            return firstArgument.concat(rest);
        },

        ProcCall_withArgs(_,procName,__,args) {
            let procedure = procName.asIR()[0]
            let arguments = args.asIR()
            return [new ProcedureCall(procedure,arguments)]
        },

        ProcCall_noArgs(_,procName) {
            let procedure = procName.asIR()[0]
            return [new ProcedureCall(procedure,[])]
        },

        textLiteral(_,prefixSpace,s,suffixSpace,__) {
            let prefix = prefixSpace.sourceString
            let suffix = suffixSpace.sourceString
            return [new TextLiteral(prefix + s.sourceString + suffix)]
        },

        TextExpr_concat(t1,_,t2) {
            let txtExpr1 = t1.asIR()[0]
            let txtExpr2 = t2.asIR()[0]
            return [new BinaryOp('++',txtExpr1,txtExpr2)]
        },

        TextExpr_concat_expr(t1,_,t2) {
            let txtExpr = t1.asIR()[0]
            let numericExpr = t2.asIR()[0]
            return [new BinaryOp('++',txtExpr,numericExpr)]
        },

        TextExpr_expr_concat(t1,_,t2) {
            let numericExpr = t1.asIR()[0]
            let txtExpr = t2.asIR()[0]
            return [new BinaryOp('++',numericExpr,txtExpr)]
        },

        Say(_,_msg) {
            let msg = _msg.asIR()[0]
            return [new Output(msg)]
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
    createParser,
    getLanguageKeywords
}