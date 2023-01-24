
# Samples
1. Drawing LOGO:
```
//L
rt 180;
fd 50;

lt 90;
fd 40;

pu;

fd 20;

pd;
//O
pc blue;
fd 40;
lt 90;
fd 50;
lt 90;
fd 40;
lt 90;
fd 50;
lt 90;

pu;
pc black;
fd 60;

lt 90;
fd 50;
rt 90;
fd 30;
rt 180;

pd;
//G
fd 30;
lt 90;
fd 50;
lt 90;
fd 40;
lt 90;
fd 20;
lt 90;
fd 10;

pu;
rt 180;
fd 30;

lt 90;
fd 30;

pd;
//O
pc blue;
rt 90;
fd 40;
rt 90;
fd 50;
rt 90;
fd 40;
rt 90;
fd 50;
```


2. 4 circles

```
//position in a better place
rt 90;
pu;
fd 200;
rt 90;
fd 100;
lt 180;
pd;

//draw 4 circles
repeat 4
  repeat 360
    fd 1;
    rt 1;
  end;
  rt 90;
end;
```

3. 

```
rt 90; pu; fd 200; lt 90; bk 100; pd; 

repeat 40
  repeat 10
    rt 36;
    fd 60;
  end;
  rt 18;
end;
```

4. Using expressions
```
repeat 2*2/1
  fd 10*5;
  rt 10 + 240/3;
end;
```

```
repeat 5
 fd 2^4;
 rt 360/5;
end;
```

5. Using a variable

```

let iters = 7;
repeat iters
  fd 50;
  rt 360/iters;
end;
```

```
let sides = 5;

repeat 12
  repeat sides
    fd 50;
    rt 360/sides;
  end;
  sides = sides + 1;
end;
```

6. A branch statement

```
  let iters = 5;
  if iters =/= 0 then
    repeat iters
      fd 50;
      rt 90;
    end;
  else
    fd 100;
  end;
```

7. A while loop

A simple square
```
let iters = 4;
while iters > 0
  fd 50;
  rt 90;
  iters = iters -1;
end;
```

Drawing several shapes using loops
```
let shapeCount = 20;
let minSides = 3;

let sides = minSides;
while sides < (shapeCount + minSides)
  repeat sides
    fd 50;
    rt 360/sides;
  end;
  sides = sides + 1;
end;
```

8. A procedure definition and call

```
let shapeCount = 20;
let minSides = 2;

procedure shape(_sides,size):
  repeat _sides
    if (_sides % 3) == 0 then
      pc blue;
    else
      pc green;
    end;
    fd 50;
    if (_sides % 2) == 0 then
      let x = 5;
      rt 360/_sides;
    else
      lt 360/_sides;
    end;

  end;
end;

let sides = minSides;
while sides < (shapeCount + minSides)
  call shape with _sides = sides, size = 50;
  sides = sides + 1;
end;
```