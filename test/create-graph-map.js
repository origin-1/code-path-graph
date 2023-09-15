'use strict';

const createGraphMap                = require('#create-graph-map');
const LinterError                   = require('#linter-error');
const { strict: assert }            = require('assert');
const { promises: { readFile } }    = require('fs');
const { join }                      = require('path');

async function test({ code, detail, expectedMappings })
{
    const graphMap = createGraphMap(code, { detail });
    const actualKeys = [...graphMap.keys()];
    const expectedKeys = Object.keys(expectedMappings);
    assert.deepEqual(actualKeys, expectedKeys);
    for (const [id, actualText] of graphMap)
    {
        const expectedGraphName = expectedMappings[id];
        const expectedGraphPath = join(__dirname, 'expected', `${expectedGraphName}.mermaid`);
        const expectedText = await readFile(expectedGraphPath, 'utf-8');
        assert.equal(actualText, expectedText, `Text for code path ${id}`);
    }
}

describe
(
    'createGraphMap',
    () =>
    {
        it
        (
            'short sample code',
            async () =>
            await test
            (
                {
                    code:
                    `
                    if (a && b)
                    {
                        foo();
                    }
                    bar();                
                    `,
                    expectedMappings: { 's1': 'graph-1' },
                },
            ),
        );

        it
        (
            'throw statement',
            async () =>
            await test
            (
                {
                    code:               'throw foo;',
                    expectedMappings:   { 's1': 'graph-2' },
                },
            ),
        );

        it
        (
            'conditional throw statement with segments detail',
            async () =>
            await test
            (
                {
                    code:               'if (foo) throw bar;',
                    detail:             'segments',
                    expectedMappings:   { 's1': 'graph-3' },
                },
            ),
        );

        it
        (
            'conditional throw statement with full detail',
            async () =>
            await test
            (
                {
                    code:               'if (foo) throw bar;',
                    detail:             'full',
                    expectedMappings:   { 's1': 'graph-4' },
                },
            ),
        );

        it
        (
            'function declaration',
            async () =>
            await test
            (
                {
                    code:               'function foo() { }',
                    detail:             'nodes',
                    expectedMappings:   { 's1': 'graph-5a', 's2': 'graph-5b' },
                },
            ),
        );

        it
        (
            'unparsable code',
            () =>
            assert.throws
            (
                () =>
                {
                    try
                    {
                        createGraphMap('?');
                    }
                    catch (error)
                    {
                        // ESLint 8.4 does not set `nodeType`.
                        delete error.lintMessages[0].nodeType;
                        throw error;
                    }
                },
                {
                    constructor: LinterError,
                    lintMessages:
                    [
                        {
                            column:     1,
                            fatal:      true,
                            line:       1,
                            message:    'Parsing error: Unexpected token ?',
                            ruleId:     null,
                            severity:   2,
                        },
                    ],
                    message:
                    'Could not graph code\nParsing error: Unexpected token ? on line 1 column 1',
                },
            ),
        );

        it
        (
            'invalid value for option `detail`',
            () =>
            assert.throws
            (
                () => createGraphMap('', { detail: 'foobar' }),
                {
                    constructor: TypeError,
                    message:
                    '`detail` option must be one of "full", "nodes", "segments" or undefined.',
                },
            ),
        );

        it
        (
            'invalid value for option `ecmaVersion`',
            () =>
            assert.throws
            (
                () => createGraphMap('', { ecmaVersion: 'foobar' }),
                {
                    constructor:    TypeError,
                    message:        '`ecmaVersion` option must be a number, "latest" or undefined.',
                },
            ),
        );

        it
        (
            'invalid value for option `sourceType`',
            () =>
            assert.throws
            (
                () => createGraphMap('', { sourceType: 'foobar' }),
                {
                    constructor: TypeError,
                    message:
                    '`sourceType` option must be one of "script", "module", "commonjs" or ' +
                    'undefined.',
                },
            ),
        );
    },
);
