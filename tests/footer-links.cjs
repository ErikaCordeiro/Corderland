const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const site = JSON.parse(fs.readFileSync(path.join(root, 'data/site.json'), 'utf8'));
const context = {
  window: { __CODERLAND_SITE__: site },
  document: { getElementById: () => ({}) },
  React: { createElement: () => ({}) },
  ReactDOM: { createRoot: () => ({ render() {} }) },
  URL,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'static/js/app.min.js'), 'utf8'), context);
const generic = new URL(vm.runInContext('whatsappHref()', context));
assert.equal(generic.origin + generic.pathname, site.whatsapp.waMe);
assert.equal(generic.searchParams.get('text'), site.whatsapp.defaultMessage);
// A service/form message must keep punctuation, accents and line breaks intact.
const custom = 'Olá! Auditoria & integração?\nEmpresa: A+B / orçamento 10%.';
context.custom = custom;
assert.equal(new URL(vm.runInContext('whatsappHref(custom)', context)).searchParams.get('text'), custom);
assert.equal(vm.runInContext('homeLink("projetos")', context), '#projetos');
// Navigation creates a fresh document in this app.
const projectContext = { ...context, window: { __CODERLAND_SITE__: site, __PROJECT_SLUG__: 'fitland' } };
vm.createContext(projectContext);
vm.runInContext(fs.readFileSync(path.join(root, 'static/js/app.min.js'), 'utf8'), projectContext);
assert.equal(vm.runInContext('homeLink("projetos")', projectContext), '/#projetos');
console.log('Footer links: WhatsApp default/custom encoding and home/project anchors passed.');
