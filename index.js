// Create a new isolate limited to 128MB
const ivm = require('isolated-vm');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const isolate = new ivm.Isolate({ memoryLimit: 128 });
const fetch = require('node-fetch');

// Create a new context within this isolate. Each context has its own copy of all the builtin
// Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
// other contexts.
let context = isolate.createContextSync();

// Get a Reference{} to the global object within the context.
const cage = context.global;

// This makes the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
cage.setSync('global', cage.derefInto());

// We will create a basic `log` function for the new isolate to use.
cage.setSync('log', function(args) {
    console.log(args);
});

cage.setSync('fetch', function(url) {
    fetch(url).then(response => response.json()).then(data => console.log(data));
});

cage.setSync('readFileSync', function(path, encoding) {
    fs.readFileSync(path, encoding);
})

cage.setSync('setTimeout', function(ms) {
    setTimeout(() => console.log('sleep'), ms);
})

// And let's test it out:
context.evalSync('log("hello world")');

// Read webpack code
if (argv.webpack) {
    console.log("Loading webpack");
    isolate.compileScriptSync(fs.readFileSync(argv.webpack, 'utf8')).runSync(context);
}

const jsCode = fs.readFileSync(argv.jsfile).toString();
const hostile = isolate.compileScriptSync(jsCode);

// Using the async version of `run` so that calls to `log` will get to the main node isolate
hostile.run(context).catch(err => console.error(err));
