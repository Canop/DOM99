import { copyFile, writeTextInFile, concatenateFiles } from "filesac";
import browserify from "browserify";
import { createWriteStream } from "fs";


const b = browserify();

console.log(`Current directory: ${process.cwd()}`);
const docdeps = `./documentation/deps/`;
const modules = `./node_modules/`;


const writableStream = createWriteStream(`${docdeps}highlight-full.js`);
b.add(`./documentation/js/highlighter.js`);
// b.add(`${modules}highlight.js/lib/languages/css.js`);
b.bundle().pipe(writableStream);

const inputsOutputs = {
    [`${modules}template-mb/template.js`]: `${docdeps}template.js`,
    // the core lib is not enough
    // it does not include any language by default
    // https://github.com/highlightjs/highlight.js/issues/1665
    [`${modules}bootstrap/dist/css/bootstrap.min.css`]: `${docdeps}bootstrap.min.css`,
    [`${modules}highlight.js/lib/highlight.js`]: `${docdeps}highlight.js`,
    [`${modules}highlight.js/styles/solarized-dark.css`]: `${docdeps}solarized-dark.css`,
    [`./polyfills/template-mb-bootstrap.js`]: `${docdeps}template-mb-bootstrap.js`,
    [`${modules}@babel/polyfill/dist/polyfill.min.js`]: `${docdeps}polyfill.min.js`,
    [`./polyfills/built/remove.js`]: `${docdeps}remove.js`,
    [`./built/dom99.iife.es5.min.js`]: `${docdeps}dom99.iife.es5.min.js`,
    [`./built/dom99.es.min.js`]: `${docdeps}dom99.es.min.js`,
    // [`./polyfills/built/remove.js`]: `${docdeps}remove.js`,
};

Object.entries(inputsOutputs).map(function ([from, to]) {
    copyFile(from, to);
});
