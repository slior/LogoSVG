# LogoSVG Language

The language is inspired by the original [Logo language](https://en.wikipedia.org/wiki/Logo_(programming_language)). But, as it currently stands, it's a very slimmed down and rudimentary version of it.

The language compiler parses the code and transforms it into an SVG that is then output to the canvas in the [the application](./App.md).

The application maintains a virtual machine that implements the language commands. It maintains also a current VM state at each point of execution.
The state includes:
- The current cursor location
- Where the cursor is facing (0-360 degrees)
- Current pen color and whether the pen is active (down) or not active (up).
- Variable values
- Procedure definitions

Execution is single-threaded and follows the control structure of the given statements.

Below is an informal description of the language, for your convenience.

## Identifiers

Identifiers use a series of alphanumeric characters (upper or lower case), and underscore (`_`).  
Identifiers can't start with a number.


## Expressions and Types

All expressions are number-typed (integer or floats).  
Conditional expressions are boolean-typed, but cannot be assigned to variables.

Unless otherwise noted, whenever a number value is accepted, an expression is accepted and will be evaluted given the current state of variable in the state.
Number values are denoted using a series of number, with a possible decimal point.  
A negative number is specified by preceding the number with a minus (`-`) sign.

Text (string) is possible with the `say` statement.  
Text literals are enclosed in single quotes. For example: `'hello world'`.

### Mathematical Operators

Supported operators are: `+`, `-`, `/`, `*`, `%`

Use can use parenthesis - `(`, `)` - to force precedence.

### Comparison Operators
Supported comparison operators are: `==`, `=/=`, `>`, `<`, `>=`, `<=`

### Text Operators
Text concatenation is possible with the `++` operator.  
For example:
```
say 'hello' ++ ' ' ++ 'world';
```
should output: `hello world`.
## Statements

The language is imperative. All commands are statements that are executed in the order they are written.  
Every statement must end with a semicolon. Block statements generally end with the `end` keyword, also followed by a semicolon.

Current language statements are:


| Command | Paramters | Description |
|---------|--------------------|-------------|
| `fd` _howMuch_    | `howMuch` : Number | Move forward by `howMuch` steps |
| `bk` _howMuch_   | `howMuch` : Number | Move backward by `howMuch` steps |
| `rt` _howMuch_   | `howMuch` : Number | Turn right by `howMuch` degrees |
| `lt` _howMuch_   | `howMuch` : Number | Turn left by `howMuch` degrees |
| `pc` _color_   | `color` : String | Change pen color. Current acceptable values are acceptable values in CSS |
| `pu`    |  | Lift up the pen (make it inactive). Subsequent moves of the pen (`fd`, `bk`) will _not_ draw lines |
| `pd`    |  | Put the pen down (make it active). Subsequent moves of the pen (`fd`, `bk`) _will_ draw lines |
| `repeat` _iterations_ ...`end;` | `iterations` : Number | Repeat the embedded block (up to `end;`) number of iterations indicated by `iterations` |
| `while` _condition_ ...`end;`  | boolean condition | Repeat the embedded block, until the condition fails to hold |
| `if` _condition_ ... `then` ... `else` ... `end;` | boolean condition | Standard branching statement - evaluates the condition and executes the corresponding block - `then` if condition holds, `else` block otherwise. |
| `let` _name_ `=` _value_ `;` | Variable name and `value` : Expression | Defines a variable with the given value (can be an expression) to initialize it |
| `procedure` _name_ `(` _parameters_ `):` ... `end;` | | Defines a procedure with the given name and parameters. |
| `call` _name_ `with` _param1_ `=` _value1_ `,` ... _paramN_ `=` _valueN_ `;` | | Call (execute) the given procedure, identified by name, with the given parameter values. |
| `say` _what_ | `what` : Text Expression | Output the given text, currently only to console.


## Variants

As an experiment, the language also has syntax variants. These usually boil down to different keywords used, but can also have other changes.
The default variant (called `english_terse`) is what's described above.

Current other variables are English-Long (`english_long`) and Hebrew (`hebrew`).

### English Long Variant

This variant of the language changes only the keywords to more verbose english words. The language syntax is otherwise unchanged.  

Only a few keywords are changed:

| Default keyword | Corresponding keywords in English Long Variant |
|-----------------|------------------------------------------------|
| `fd` | `forward` |
| `bk` | `back` |
| `rt` | `right` |
| `lt` | `left` |
| `pc` | `pen_color` |
| `pu` | `pen_up` |
| `pd` | `pen_down` |

### Hebrew Variant

This variant of the language replaces all keywords, and also adds the option to define identifiers (variables and procedures) using hebrew characters.

The keywords are:
| Default keyword | Corresponding keywords in Hebrew |
|-----------------|------------------------------------------------|
| `fd` | `קד` |
| `bk` | `אח` |
| `rt` | `ימ` |
| `lt` | `שמ` |
| `pc` | `צבע` |
| `pu` | `הרם` |
| `pd` | `הורד` |
| `repeat` | `חזור` |
| `end` |`סוף` |
| `let` | `יהא` |
| `if` | `אם` |
| `then` | `אז` |
| `else`| `אחרת` |
| `while` | `כלעוד` |
| `procedure` | `שגרה` |
| `call` | `הפעל` |
| `with` | `עם` |
| `say` | `אמור` |
