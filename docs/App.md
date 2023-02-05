# Application

The included application provides a simple way to enter LogoSVG code and execute it.

The application is split into 2 main parts: the drawing canvas and the code editor.
Below the code editor you can find control buttons, and a console area where messages will be shown, and error messages will be displayed.

## Parameters
You can initialize the application with 3 parameters:
1. `x` - the initial x location of the cursor.  
   X values increase to the right.
2. `y` - the initial y location of the cursor.  
   Y values increase toward the bottom of the canvas area.
3. The language variant to use.  
   Current acceptable values are: `english_terse`, `english_long`, `hebrew`.

For RTL language, namely hebrew, the editor will be different.

## Possible Operations
`Execute` will try to execute the current program in the editor. It starts with the existing current state, after the last run. Variable and procedure definitions are not erased.

`Reset` will reset the application to its initial state, including a reset of variable and procedure definitions.