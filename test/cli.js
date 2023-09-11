'use strict';

const { strict: assert }            = require('assert');
const { execFile }                  = require('child_process');
const { promises: { readFile } }    = require('fs');
const { dirname, join }             = require('path');
const { promisify }                 = require('util');

const getExpectedGraphPath = name => join(__dirname, 'expected', `${name}.mermaid`);

async function test(...args)
{
    const { bin } = require('code-path-graph/package.json');
    const pkgDir = dirname(__dirname);
    const result = await promisify(execFile)(process.execPath, [bin, ...args], { cwd: pkgDir });
    return result;
}

describe
(
    'CLI',
    () =>
    {
        it
        (
            'option -v',
            async () =>
            {
                const { stdout, stderr } = await test('-v');
                const { version } = require('code-path-graph/package.json');
                assert.equal(stdout, `${version}\n`);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'option --version',
            async () =>
            {
                const { stdout, stderr } = await test('--version');
                const { version } = require('code-path-graph/package.json');
                assert.equal(stdout, `${version}\n`);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'option --help',
            async () =>
            {
                const { stdout, stderr } = await test('--help');
                assert(stdout);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'option --detail',
            async () =>
            {
                const { stdout, stderr } =
                await test('test/fixtures/conditional-throw.js', '--detail=full');
                const graphText = await readFile(getExpectedGraphPath('graph-4'), 'utf-8');
                assert.equal(stdout, `---\ntitle: s1\n---\n${graphText}\n`);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'option --ecma-version',
            async () =>
            {
                const { stdout, stderr } =
                await test('test/fixtures/es3-script.js', '--ecma-version=3');
                const graphText = await readFile(getExpectedGraphPath('graph-6'), 'utf-8');
                assert.equal(stdout, `---\ntitle: s1\n---\n${graphText}\n`);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'option --source-type',
            async () =>
            {
                const { stdout, stderr } =
                await test('test/fixtures/top-level-return.js', '--source-type=commonjs');
                const graphText = await readFile(getExpectedGraphPath('graph-7'), 'utf-8');
                assert.equal(stdout, `---\ntitle: s1\n---\n${graphText}\n`);
                assert.equal(stderr, '');
            },
        );

        it
        (
            'duplicate option --detail',
            async () =>
            {
                const { stdout, stderr } = await test('--detail=foo', '--detail=bar');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'duplicate option --ecma-version',
            async () =>
            {
                const { stdout, stderr } = await test('--ecma-version=foo', '--ecma-version=bar');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'duplicate option --source-type',
            async () =>
            {
                const { stdout, stderr } = await test('--source-type=foo', '--source-type=bar');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'invalid standalone option',
            async () =>
            {
                const { stdout, stderr } = await test('-?');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'invalid option with value',
            async () =>
            {
                const { stdout, stderr } = await test('--foobar=42');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'too many arguments',
            async () =>
            {
                const { stdout, stderr } = await test('foo', 'bar');
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'missing argument',
            async () =>
            {
                const { stdout, stderr } = await test();
                assert.equal(stdout, '');
                assert.equal
                (stderr, 'Illegal syntax. Enter "code-path-graph --help" for usage info.\n');
            },
        );

        it
        (
            'lint error',
            async () =>
            {
                const { stdout, stderr } = await test('test/fixtures/unparsable.js');
                assert.equal(stdout, '');
                assert.equal
                (
                    stderr,
                    'Could not graph code\nParsing error: Unexpected token ? on line 1 column 1\n',
                );
            },
        );
    },
);
