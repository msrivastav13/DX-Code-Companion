import * as path from 'path';
import * as fs from 'fs';
import Mocha from 'mocha';

export async function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '.');
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
