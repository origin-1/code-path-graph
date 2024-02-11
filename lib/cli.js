#!/usr/bin/env node

'use strict';

const createGraphMap                = require('#create-graph-map');
const { promises: { readFile } }    = require('fs');
const { resolve }                   = require('path');
const { isDeepStrictEqual }         = require('util');

async function main(filePath, options)
{
    filePath = resolve(filePath);
    const code = await readFile(filePath, 'utf-8');
    let graphMap;
    try
    {
        graphMap = createGraphMap(code, options);
    }
    catch ({ message })
    {
        console.error(message);
        return;
    }
    for (const [id, text] of graphMap)
        process.stdout.write(`---\ntitle: ${id}\n---\n${text}\n`);
}

function parseAsSetting(arg)
{
    const match = /^(?<name>.+?)\s*=\s*(?<value>.+)$/.exec(arg);
    return match && match.groups;
}

function parseMainArgs()
{
    let filePath;
    let detail;
    let ecmaVersion;
    let sourceType;
    for (const arg of args)
    {
        if (arg.startsWith('-'))
        {
            const setting = parseAsSetting(arg);
            if (!setting)
                return null;
            const { name, value } = setting;
            switch (name)
            {
            case '--detail':
                if (detail != null) return null;
                detail = value;
                break;
            case '--ecma-version':
                if (ecmaVersion != null) return null;
                {
                    const number = +value;
                    ecmaVersion = value === `${number}` ? number : value;
                }
                break;
            case '--source-type':
                if (sourceType != null) return null;
                sourceType = value;
                break;
            default:
                return null;
            }
        }
        else
        {
            if (filePath != null) return null;
            filePath = arg;
        }
    }
    if (filePath == null) return null;
    const options = { detail, ecmaVersion, sourceType };
    return { filePath, options };
}

const args = process.argv.slice(2);
if (isDeepStrictEqual(args, ['--help']))
{
    const message =
    'usage: code-path-graph [--detail=<...>] [--ecma-version=<...>] [--source-type=<...>] <file>' +
    '\n' +
    '\n' +
    'Create Mermaid state diagrams of code paths in a JavaScript file.\n' +
    '\n' +
    '`--detail` controls the information printed in nodes of the graph. Valid values are:\n' +
    '   nodes           Print node traversal info only (default)\n' +
    '   segments        Print segment names only\n' +
    '   full            Print both segment names and node traversal info\n' +
    '\n' +
    '`--ecma-version` specifies the JavaScript language version.\n' +
    'Valid values are numbers or the string `latest` (default).\n' +
    '\n' +
    '`--source-type` specifies the type of JavaScript code. Valid valus are:\n' +
    '   script          Script (default when `--ecma-version` is `3` or `5`)\n' +
    '   module          ECMAScript module (default for other values of `--ecma-version`)\n' +
    '   commonjs        CommonJS module\n';
    console.log(message);
}
else if (isDeepStrictEqual(args, ['--version']) || isDeepStrictEqual(args, ['-v']))
{
    const { version } = require('code-path-graph/package.json');
    console.log(version);
}
else
{
    const parseResult = parseMainArgs();
    if (parseResult)
        main(parseResult.filePath, parseResult.options);
    else
        console.error('Illegal syntax. Enter "code-path-graph --help" for usage info.');
}
