
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