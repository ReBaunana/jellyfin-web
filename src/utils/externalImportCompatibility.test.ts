// @vitest-environment node
import { transformSync } from '@babel/core';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const plugin = require('../../babel-legacy-external-import.js');

function transform(code: string, filename = 'node_modules/react-router/dist/client.mjs') {
    return transformSync(code, {
        filename: path.resolve(filename),
        configFile: false,
        babelrc: false,
        plugins: [plugin]
    })?.code;
}

describe('External vendor module compatibility', () => {
    it('uses the existing loader only for explicitly external vendor imports', () => {
        const output = transform('const loaded = import(/* webpackIgnore: true */ url);');
        expect(output).toContain('@uupaa/dynamic-import-polyfill');
        expect(output).not.toMatch(/\bimport\s*\(/);
        expect(output).toMatch(/importModule\(.*url/);
    });

    it('preserves webpack-managed code splitting and application imports', () => {
        expect(transform('const loaded = import("./route.js");')).toContain('import("./route.js")');
        expect(transform('const loaded = import(/* webpackIgnore: true */ url);', 'src/view.js')).toMatch(/\bimport\s*\(/);
    });
});
