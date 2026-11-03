# DynamiCalc

A calculation notebook where variables stay connected. In most calculators,
setting a variable stores its value at that moment. In DynamiCalc, `=` stores
the formula, so changing a value updates everything that uses it.

## Writing a notebook

Type one calculation per line. Each line's result appears on the right as you
type.

```
price = 120
tax = 8%
total = price * (1 + tax)     129.6

quoted := total               129.6
price = 150
total                         162
quoted                        129.6
```

| Syntax        | Meaning                                                    |
| ------------- | ---------------------------------------------------------- |
| `a = expr`    | Stores the formula. It's recalculated wherever `a` is used |
| `a := expr`   | Stores the value `expr` has on that line                   |
| `f(x) = expr` | Defines a function                                         |
| `ans`         | The previous line's result                                 |
| `# note`      | A note. Ignored by the calculator                          |
| `5 ft to m`   | Unit conversion                                            |

Put the cursor on a line to see what it depends on. Wires in the margin connect
it to the lines it uses (blue) and the lines that use it (amber).

The **Graph** page plots functions of `x`.

## Development

```sh
npm install
npm run dev        # start the dev server
npm test           # run tests with Vitest
npm run lint       # ESLint + Prettier
npm run typecheck  # TypeScript
npm run build      # type-check and build to build/
npm run deploy     # build and deploy to Firebase
```

Built with React, TypeScript, Vite, [mathjs](https://mathjs.org) and
[CodeMirror](https://codemirror.net).
