A few simple example programs showcasing the language.

Unless noted otherwise, the examples use the default variant (`english_terse`).  
Refer to the [language description](./Lang.md) to learn more about the variants.

## English Variants

### Draw 4  Circles

```
repeat 4
  repeat 360
    fd 1;
    rt 1;
  end;
  rt 90;
end;
```

### A Simple Mandala Type of Drawing

This is using the `english_long` variant

```

repeat 40
  repeat 10
    right 36;
    forward 60;
  end;
  right 18;
end;
```

### Using Simple Expressions

```
repeat 5
 fd 2^4;
 rt 360/5;
end;
```

Also with variables:

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

### Control Structures

A branch statement

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

A `while` loop used to draw a square

```
let iters = 4;
while iters > 0
  fd 50;
  rt 90;
  iters = iters -1;
end;
```

### Procedure Definition

Define a procedure (`shape`) then use it in a loop

```
let shapeCount = 10;
let minSides = 2;

procedure shape(_sides,size):
  if (_sides % 3) == 0 then
      pc 'blue';
    else
      pc 'green';
    end;
  
  repeat _sides
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

## Hebrew Variant - דוגמאות בעברית

Drawing a square

<span style="direction:rtl">

```
יהא חזרות = 4;
כלעוד חזרות > 0
  קד 50;
  ימ 90;
  חזרות = חזרות -1;
סוף;
```
</span>

Drawing shapes of different sizes and number of squares, with different colors

<span style="direction:rtl">

```
יהא מספר_צורות = 10;
יהא מינ_צלעות = 2;

שגרה צורה(צד,גודל):
    אם (צד % 3) == 0 אז
      צבע 'blue';
    אחרת
      צבע 'green';
    סוף;
  חזור צד
    קד 50;
    אם (צד % 2) == 0 אז
       ימ 360/צד;
    אחרת
      שמ 360/צד;
    סוף;
  סוף;
סוף;

יהא צלעות = מינ_צלעות;
כלעוד צלעות < (מספר_צורות + מינ_צלעות)
  הפעל צורה עם צד = צלעות, גודל = 50;
  צלעות = צלעות + 1;
סוף;
```

</span>