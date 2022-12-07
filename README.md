# DynamiCalc

A Calculator website made in React that focuses on setting dynamic variables that
can change values based on other variables. When you set a variable in most calculators
the immeadiate static value is stored.

## Example

### Expected Behaviour

```py
A = 10
B = A + 10

A = 0
print(B) // 10 is the expected behaivour
```

### Common Implementation

```py
A = 10
B = A + 10 // B = 20 statically behind the scenes

A = 0
print(B) // 20
```