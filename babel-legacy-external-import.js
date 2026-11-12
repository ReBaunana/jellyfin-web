const { addNamed } = require('@babel/helper-module-imports');

// Keep the application's ES5 parse contract. These vendor packages deliberately
// bypass webpack for URL-based ESM loading; use the existing browser polyfill,
// without rewriting webpack-managed imports or altering the vendor sources.
module.exports = ({ types }) => {
    const helpers = new WeakMap();
    return {
        name: 'legacy-external-vendor-import',
        visitor: {
            CallExpression(path, state) {
                if (!types.isImport(path.node.callee)) return;
                if (!/[\\/]node_modules[\\/](pdfjs-dist|react-router)[\\/]/.test(state.filename || '')) return;
                const comments = [
                    ...(path.node.innerComments || []),
                    ...path.node.arguments.flatMap(argument => argument.leadingComments || [])
                ];
                if (!comments.some(comment => /webpackIgnore\s*:\s*true/.test(comment.value))) return;
                if (path.node.arguments.length !== 1) {
                    throw path.buildCodeFrameError('Unsupported external import attributes; review the vendor loader');
                }
                const program = path.scope.getProgramParent().path;
                let helper = helpers.get(program);
                if (!helper) {
                    helper = addNamed(path, 'importModule', '@uupaa/dynamic-import-polyfill');
                    helpers.set(program, helper);
                }
                path.replaceWith(types.callExpression(types.cloneNode(helper), path.node.arguments));
            }
        }
    };
};
