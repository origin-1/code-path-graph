# `code-path-graph`

A Node.js library and command-line tool to create [Mermaid state diagrams](https://mermaid.js.org/syntax/stateDiagram.html) of code paths in JavaScript files.

The diagrams are generated using the [code path analysis](https://eslint.org/docs/latest/extend/code-path-analysis) functionality of ESLint can be embedded in GitHub markdown using fenced code blocks (i.e. ```` ```mermaid ```` … ```` ``` ````).

## Usage

```console
code-path-graph [--detail=<...>] [--ecma-version=<...>] [--source-type=<...>] <file>
```

`detail` controls the information printed in nodes of the graph. Valid values are:

* **`nodes`**\
Print node traversal info only (default)
* **`segments`**\
Print segment names only
* **`full`**\
Print both segment names and node traversal info

`ecmaVersion` specifies the JavaScript language version.
Valid values are numbers or the string `latest` (default).

`sourceType` specifies the type of JavaScript code. Valid valus are:

* **`script`**\
Script (default for `ecmaVersion` 3 or 5)
* **`module`**\
ECMAScript module (default for other values of `ecmaVersion`)
* **`commonjs`**\
CommonJS module

## Example

Given is a JavaScript file `test.js` with the following content:
```js
if (foo)
{
    throw bar();
}
```

Running the command
```console
npx code-graph-path test.js
```
produces the following output:
```
---
title: s1
---
stateDiagram-v2
classDef common fill: white, stroke: black, text-align: center
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
classDef thrown fill: none, line-height: 1, stroke: none
s1_1::: common: Program#58;enter\nIfStatement#58;enter\nIdentifier (foo)
s1_2::: common: BlockStatement#58;enter\nThrowStatement#58;enter\nCallExpression#58;enter\nIdentifier (bar)\nCallExpression#58;exit\nThrowStatement#58;exit
s1_4::: common: IfStatement#58;exit\nProgram#58;exit
s1_3:::common: #60;#60;unreachable#62;#62;\nBlockStatement#58;exit
s1_3:::unreachable
thrown:::thrown: ✘
[*] --> s1_1
s1_1 --> s1_2
s1_1 --> s1_4
s1_2 --> s1_3
s1_3 --> s1_4
s1_4 --> [*]
s1_2 --> thrown
```

In a GitHub markdown file, this text can be inserted in a fenced code block (see below)
````
```mermaid
---
title: s1
---
stateDiagram-v2
classDef common fill: white, stroke: black, text-align: center
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
classDef thrown fill: none, line-height: 1, stroke: none
s1_1::: common: Program#58;enter\nIfStatement#58;enter\nIdentifier (foo)
s1_2::: common: BlockStatement#58;enter\nThrowStatement#58;enter\nCallExpression#58;enter\nIdentifier (bar)\nCallExpression#58;exit\nThrowStatement#58;exit
s1_4::: common: IfStatement#58;exit\nProgram#58;exit
s1_3:::common: #60;#60;unreachable#62;#62;\nBlockStatement#58;exit
s1_3:::unreachable
thrown:::thrown: ✘
[*] --> s1_1
s1_1 --> s1_2
s1_1 --> s1_4
s1_2 --> s1_3
s1_3 --> s1_4
s1_4 --> [*]
s1_2 --> thrown
```
````
to produce a visible diagram like the following.
```mermaid
---
title: s1
---
stateDiagram-v2
classDef common fill: white, stroke: black, text-align: center
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
classDef thrown fill: none, line-height: 1, stroke: none
s1_1::: common: Program#58;enter\nIfStatement#58;enter\nIdentifier (foo)
s1_2::: common: BlockStatement#58;enter\nThrowStatement#58;enter\nCallExpression#58;enter\nIdentifier (bar)\nCallExpression#58;exit\nThrowStatement#58;exit
s1_4::: common: IfStatement#58;exit\nProgram#58;exit
s1_3:::common: #60;#60;unreachable#62;#62;\nBlockStatement#58;exit
s1_3:::unreachable
thrown:::thrown: ✘
[*] --> s1_1
s1_1 --> s1_2
s1_1 --> s1_4
s1_2 --> s1_3
s1_3 --> s1_4
s1_4 --> [*]
s1_2 --> thrown
```
