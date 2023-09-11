'use strict';

const formatCodePath    = require('#format-code-path');
const LinterError       = require('#linter-error');
const { join }          = require('path');

function createGraphMap
(
    code,
    {
        detail      = 'nodes',
        ecmaVersion = 'latest',
        sourceType  = ecmaVersion === 3 || ecmaVersion === 5 ? 'script' : 'module',
    } =
    { },
)
{
    if (!['full', 'nodes', 'segments'].includes(detail))
    {
        const message = '`detail` option must be one of "full", "nodes", "segments" or undefined.';
        throw TypeError(message);
    }
    if (typeof ecmaVersion !== 'number' && ecmaVersion !== 'latest')
    {
        const message = '`ecmaVersion` option must be a number, "latest" or undefined.';
        throw TypeError(message);
    }
    if (!['commonjs', 'module', 'script'].includes(sourceType))
    {
        const message =
        '`sourceType` option must be one of "script", "module", "commonjs" or undefined.';
        throw TypeError(message);
    }

    const { Linter } = require('eslint');

    const graphMap = new Map();
    const segmentNames = detail === 'full' || detail === 'segments';
    const visitors =
    {
        onCodePathStart(codePath)
        {
            graphMap.set(codePath.id, null);
        },
        onCodePathEnd(codePath)
        {
            const text = formatCodePath(codePath, { segmentNames });
            graphMap.set(codePath.id, text);
        },
    };
    const config =
    {
        languageOptions:    { ecmaVersion, sourceType },
        plugins:            { test: { rules: { test: { create: () => visitors } } } },
        rules:              { 'test/test': 'error' },
    };
    const linter = new Linter({ configType: 'flat' });
    const restoreDebugHelpers = patchDebugHelpers(detail !== 'segments');
    try
    {
        const lintMessages = linter.verify(code, config);
        if (lintMessages.length) throw new LinterError(lintMessages);
    }
    finally
    {
        restoreDebugHelpers();
    }
    return graphMap;
}

function patchDebugHelpers(useDebugInfo)
{
    const postrequire = require('postrequire');

    const eslintPath = require.resolve('eslint');
    const debugHelpersPath = join(eslintPath, '../linter/code-path-analysis/debug-helpers.js');
    const originalExports = require(debugHelpersPath);
    const debug = () => { };
    debug.enabled = useDebugInfo;
    const patchedExports = postrequire(debugHelpersPath, { require: () => () => debug });
    const originalDescriptors = Object.getOwnPropertyDescriptors(originalExports);
    const patchedDescriptors = Object.getOwnPropertyDescriptors(patchedExports);
    Object.defineProperties(originalExports, patchedDescriptors);
    const restoreDebugHelpers = () => Object.defineProperties(originalExports, originalDescriptors);
    return restoreDebugHelpers;
}

module.exports = createGraphMap;
