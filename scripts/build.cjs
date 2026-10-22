// Uses the repository's existing Babel; no npm installation or browser compiler.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '..');
const context = { console };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'static/vendor/babel.min.js'), 'utf8'), context);
const source = fs.readFileSync(path.join(root, 'static/js/app.js'), 'utf8');
const result = context.Babel.transform(source, { presets: ['react'], comments: false, compact: true });
fs.writeFileSync(path.join(root, 'static/js/app.min.js'), result.code + '\n');
console.log('React JSX compiled: static/js/app.min.js (' + Buffer.byteLength(result.code) + ' bytes)');
