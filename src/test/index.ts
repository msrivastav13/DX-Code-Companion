'use strict';

// Entry point VS Code loads inside the extension host (--extensionTestsPath).
// Runs every *.test.js in the folder named by CCDX_TEST_SUITE.

import * as fs from 'fs';
import * as path from 'path';

// mocha 12 is ESM-only; depending on the loader, require() returns the class or its module namespace
// tslint:disable-next-line:no-var-requires
const mochaModule = require('mocha');
const Mocha: typeof import('mocha') = mochaModule.default || mochaModule;

export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
        timeout: 60000
    });

    const testsRoot = path.resolve(__dirname, process.env.CCDX_TEST_SUITE || 'integration');
    const files = fs.readdirSync(testsRoot).filter(f => f.endsWith('.test.js'));

    files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

    return new Promise<void>((resolve, reject) => {
        mocha.run((failures: number) => {
            if (failures > 0) {
                reject(new Error(`${failures} tests failed.`));
            } else {
                resolve();
            }
        });
    });
}
