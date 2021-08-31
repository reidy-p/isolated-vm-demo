const ivm = require('isolated-vm');
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');
const fetch = require('node-fetch');

// Create an Isolate
const isolate = new ivm.Isolate({ memoryLimit: 128 });

// Create a new context within this isolate. Each context has its own copy of all the builtin
// Objects. So for instance if one context does Object.prototype.foo = 1 this would not affect any
// other contexts.
let context = isolate.createContextSync();

// Get a Reference{} to the global object within the context.
const cage = context.global;

// This makes the global object available in the context as `global`. We use `derefInto()` here
// because otherwise `global` would actually be a Reference{} object in the new isolate.
cage.setSync('global', cage.derefInto());

// Transfer Reference to ivm
cage.setSync('_ivm', ivm);

// We will create a basic `log` function for the new isolate to use.
// cage.setSync('_log', new ivm.Reference(function (...args) {
//     args.unshift("v8:")
//     console.log(...args)
// }));

// cage.setSync('_log', new ivm.Reference(function (arg) {
//     console.log("v8:" + arg)
// }));

cage.setSync('_log', function (arg) {
    console.log("v8:" + arg)
}, { reference: true} );

cage.setSync('log', function(...args) {
    console.log(...args);
});

context.evalSync("log('eval')");

cage.setSync('fetch', function(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(e => {
            console.log(`Failed fetch with error: ${e}`);
        });
});

cage.setSync('readFileSync', function(path, encoding) {
    fs.readFileSync(path, encoding);
})

cage.setSync('setTimeout', function(ms) {
    setTimeout(() => console.log('sleep'), ms);
})

// Read webpack code
if (argv.webpack) {
    console.log("Loading webpack");
    isolate.compileScriptSync(fs.readFileSync(argv.webpack, 'utf8')).runSync(context);
}

const jsCode = fs.readFileSync(argv.jsfile).toString();

// Using the async version of `run` so that calls to `log` will get to the main node isolate
// isolate.compileScriptSync(jsCode).run(context).catch(err => console.error(err));

// eval is a replacement for compile -> run
context.eval(jsCode).catch(err => console.log(err));
