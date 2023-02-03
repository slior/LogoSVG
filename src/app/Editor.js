var editor = null;

function configLangInEditor(monaco)
{
    monaco.languages.register({ id: 'logojs' });
    monaco.languages.setMonarchTokensProvider('logojs',{
        // monaco.languages.setLanguageConfiguration('logojs',{
        // Set defaultToken to invalid to see what you do not tokenize yet
        // defaultToken: 'invalid',

        keywords: [
            'fd', 'rt', 'repeat', 'end', 'procedure', 'let', 'if', 'else', 'while', 'true', 'false',
            'bk','lt','pc','pd','pu','call','then', 'say','with'
        ],

        typeKeywords: [
            'number'
        ],

        operators: [
            '=', '>', '<', '==', '<=', '>=', '=/=',
            '+', '-', '*', '/', '%'
        ],

        // we include these common regular expressions
        symbols:  /[=><!~?:&|+\-*\/\^%]+/,

        // C# style strings
        escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

        // The main tokenizer for our languages
        tokenizer: {
            root: [
            // identifiers and keywords
            [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword',
                                        '@keywords': 'keyword',
                                        '@default': 'identifier' } }],
            [/[A-Z][\w\$]*/, 'type.identifier' ],  // to show class names nicely

            // whitespace
            { include: '@whitespace' },

            // delimiters and operators
            [/[{}()\[\]]/, '@brackets'],
            [/[<>](?!@symbols)/, '@brackets'],
            [/@symbols/, { cases: { '@operators': 'operator',
                                    '@default'  : '' } } ],

            
            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
            // [/0[xX][0-9a-fA-F]+/, 'number.hex'],
            [/\d+/, 'number'],

            // delimiter: after number because of .\d floats
            [/[;:]/, 'delimiter'],

            // strings
            [/"([^"\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
            [/'/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],

            // characters
            [/'[^\\']'/, 'string'],
            //   [/(')(@escapes)(')/, ['string','string.escape','string']],
            [/'/, 'string.invalid']
            ],

            comment: [
            [/[^\/*]+/, 'comment' ],
            [/\/\*/,    'comment', '@push' ],    // nested comment
            ["\\*/",    'comment', '@pop'  ],
            [/[\/*]/,   'comment' ]
            ],

            string: [
            [/[^\\']+/,  'string'],
            //   [/@escapes/, 'string.escape'],
            [/\\./,      'string.escape.invalid'],
            [/'/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
            ],

            whitespace: [
            [/[ \t\r\n]+/, 'white'],
            [/\/\*/,       'comment', '@comment' ],
            [/\/\/.*$/,    'comment'],
            ],
        },
    })
}

function initEditor(container)
{
    require.config({ paths: { vs: './node_modules/monaco-editor/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        configLangInEditor(monaco)
        editor = monaco.editor.create(container, {
            value: 'fd 100;',
            language: 'logojs',
            theme:'vs-dark'
        });
    });
}

function getCode()
{
    if (!editor) throw new Error("Editor not initialized")
    return editor.getValue()
}