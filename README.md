# `code-path-graph` · [![npm version][npm badge]][npm url]

A Node.js library and command-line tool to create [Mermaid state diagrams](https://mermaid.js.org/syntax/stateDiagram.html) of code paths in JavaScript files.

The diagrams are generated using the [code path analysis](https://eslint.org/docs/latest/extend/code-path-analysis) functionality of ESLint and can be embedded in GitHub markdown using fenced code blocks (i.e. ```` ```mermaid ```` … ```` ``` ````).

## Installation

A version of Node.js [supported by ESLint 8](https://eslint.org/docs/user-guide/getting-started#prerequisites) is required.

### Install locally as a library

```console
npm i code-path-graph
```

### Install globally as a command-line tool

```console
npm i -g code-path-graph
```

## Usage

```console
code-path-graph [--detail=<...>] [--ecma-version=<...>] [--source-type=<...>] <file>
```

**`--detail`** controls the information printed in nodes of the graph. Valid values are:

* `nodes`\
Print node traversal info only (default)
* `segments`\
Print segment names only
* `full`\
Print both segment names and node traversal info

**`--ecma-version`** specifies the JavaScript language version.
Valid values are numbers or the string `latest` (default).

**`--source-type`** specifies the type of JavaScript code. Valid values are:

* `script`\
Script (default when `--ecma-version` is `3` or `5`)
* `module`\
ECMAScript module (default for other values of `--ecma-version`)
* `commonjs`\
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
code-graph-path test.js
```
produces the following output:
```
---
title: s1
---
stateDiagram-v2
classDef common fill: white, stroke: black
class s1_1, s1_2, s1_4, s1_3 common
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
class s1_3 unreachable
classDef thrown fill: none, stroke: none
state "Program:enter\nIfStatement:enter\nIdentifier (foo)" as s1_1
state "BlockStatement:enter\nThrowStatement:enter\nCallExpression:enter\nIdentifier (bar)\nCallExpression:exit\nThrowStatement:exit" as s1_2
state "IfStatement:exit\nProgram:exit" as s1_4
state "BlockStatement:exit" as s1_3
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
classDef common fill: white, stroke: black
class s1_1, s1_2, s1_4, s1_3 common
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
class s1_3 unreachable
classDef thrown fill: none, stroke: none
state "Program:enter\nIfStatement:enter\nIdentifier (foo)" as s1_1
state "BlockStatement:enter\nThrowStatement:enter\nCallExpression:enter\nIdentifier (bar)\nCallExpression:exit\nThrowStatement:exit" as s1_2
state "IfStatement:exit\nProgram:exit" as s1_4
state "BlockStatement:exit" as s1_3
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
classDef common fill: white, stroke: black
class s1_1, s1_2, s1_4, s1_3 common
classDef unreachable fill: #FF9800, stroke-dasharray: 5 5
class s1_3 unreachable
classDef thrown fill: none, stroke: none
state "Program:enter\nIfStatement:enter\nIdentifier (foo)" as s1_1
state "BlockStatement:enter\nThrowStatement:enter\nCallExpression:enter\nIdentifier (bar)\nCallExpression:exit\nThrowStatement:exit" as s1_2
state "IfStatement:exit\nProgram:exit" as s1_4
state "BlockStatement:exit" as s1_3
thrown:::thrown: ✘
[*] --> s1_1
s1_1 --> s1_2
s1_1 --> s1_4
s1_2 --> s1_3
s1_3 --> s1_4
s1_4 --> [*]
s1_2 --> thrown
```

[npm badge]: https://img.shields.io/npm/v/code-path-graph?logo=npm
[npm url]: https://www.npmjs.com/package/code-path-graph
