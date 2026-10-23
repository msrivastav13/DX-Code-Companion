'use strict';

import * as assert from 'assert';
import * as cp from 'child_process';
import * as path from 'path';
import { OSUtil } from '../../services/osUtils';
import { VSCodeCore } from '../../services/vscodeCore';
import { repoRoot } from '../environment';

// Feeds VSCodeCore.quoteArg output to real shells and checks the program receives the value unchanged.

const isWindows = process.platform === 'win32';
const shimDir = path.join(repoRoot, 'test-fixtures', 'bin');
// Like the real CLI, the shim is a .cmd batch file on Windows; that is where cmd.exe parsing kicks in
const sfCommand = isWindows
    ? VSCodeCore.quoteArg(OSUtil.toUnixStyle(path.join(shimDir, 'sf.cmd')))
    : VSCodeCore.quoteArg('node') + ' ' + VSCodeCore.quoteArg(path.join(shimDir, 'sf'));

interface Shell {
    name: string;
    command: string;
    args: string[];
    // Turns a command line into what the shell needs to run an executable
    invoke: (commandLine: string) => string;
}

const shells: Shell[] = ([
    { name: 'bash', command: 'bash', args: ['--noprofile', '--norc', '-c'], invoke: line => line },
    { name: 'zsh', command: 'zsh', args: ['-f', '-c'], invoke: line => line },
    { name: 'pwsh', command: 'pwsh', args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command'], invoke: line => '& ' + line },
    { name: 'powershell', command: 'powershell.exe', args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command'], invoke: line => '& ' + line }
] as Shell[]).filter(shell => cp.spawnSync(shell.command, shell.args.concat(['exit 0'])).status === 0);

const portable = [
    '/Users/dev/My Project/force-app/main/default/classes/Foo.cls',
    'semi;colon',
    'pipe | and && or ||',
    'redirect > out < in 2>&1',
    "single 'quotes'",
    'glob * ? [ab] {x,y} ~ #hash',
    'percent %PATH% caret ^ comma, colon:',
    'parens (x) @at +plus =equals',
    'tab\there',
    'unicode café ✓'
];
// cmd.exe operators and variable expansion, rejected on Windows only
const batchOperators = /[&|<>^%]/;
const accepted = portable.filter(value => !isWindows || !batchOperators.test(value));

const rejected = [
    '$(id)',
    '${HOME}',
    '`id`',
    '"; id; "',
    'trailing\\',
    'line\nbreak',
    'carriage\rreturn',
    'bang!',
    '“$(id)”'
].concat(isWindows ? portable.filter(value => batchOperators.test(value)) : []);

suite('Shell quoting', () => {
    test('at least one shell is available', () => {
        assert.ok(shells.length > 0, 'no supported shell found on PATH');
    });

    for (const shell of shells) {
        test(`${shell.name} passes accepted values through unchanged`, () => {
            for (const value of accepted) {
                const commandLine = shell.invoke(sfCommand + ' ' + VSCodeCore.quoteArg(value));
                const result = cp.spawnSync(shell.command, shell.args.concat([commandLine]), {
                    encoding: 'utf8',
                    env: Object.assign({}, process.env, { CCDX_SF_STDOUT: '1' })
                });
                assert.strictEqual(result.status, 0, `${shell.name} failed for ${JSON.stringify(value)}: ${result.stderr}`);
                assert.deepStrictEqual(JSON.parse(result.stdout), [value], `${shell.name} altered ${JSON.stringify(value)}`);
            }
        });
    }

    for (const value of rejected) {
        test(`rejects ${JSON.stringify(value)}`, () => {
            assert.throws(() => VSCodeCore.quoteArg(value), /Refusing to run command/);
        });
    }
});
