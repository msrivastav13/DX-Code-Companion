'use strict';

import * as assert from 'assert';
import { Connection } from '@salesforce/core';
import { SalesforceUtil } from '../../services/sfdcUtils';

// Records Tooling SOQL instead of calling an org
function fakeConnection(queries: string[]): Connection {
    const emptyResult = () => Promise.resolve({ totalSize: 0, records: [] });
    return {
        query: emptyResult,
        tooling: {
            query: (soql: string) => {
                queries.push(soql);
                return emptyResult();
            }
        }
    } as unknown as Connection;
}

suite('Tooling SOQL file name validation', () => {
    test('queries the server copy of a valid Apex class', async () => {
        const queries: string[] = [];
        const result = await new SalesforceUtil(fakeConnection(queries)).getFileContentFromServer('ApexClass', 'CcdxFoo', 'cls');
        assert.strictEqual(result.exist, false);
        assert.deepStrictEqual(queries, ["Select Body from ApexClass where Name='CcdxFoo' and NamespacePrefix=null"]);
    });

    const invalid: Array<[string, string]> = [
        ["x' OR Name != '", 'cls'],
        ['Foo\\', 'cls'],
        ['Foo Bar', 'cls'],
        ['1Foo', 'cls'],
        ['Foo', "cls' OR Name != '"]
    ];
    for (const [name, extension] of invalid) {
        test(`rejects ${JSON.stringify(name + '.' + extension)} before querying`, async () => {
            const queries: string[] = [];
            await assert.rejects(
                new SalesforceUtil(fakeConnection(queries)).getFileContentFromServer('ApexClass', name, extension),
                /not a valid Salesforce metadata file name/
            );
            assert.deepStrictEqual(queries, []);
        });
    }
});
