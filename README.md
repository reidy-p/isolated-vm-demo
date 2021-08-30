Sandboxing JavaScript (Work In Progress)
---
Some applications or services allow us to submit JavaScript code to be executed on their servers. For example, [Screeps](https://screeps.com/) is an MMO game that users play by writing and submitting JavaScript code. [Cloudflare Workers](https://workers.cloudflare.com/) is a serverless platform that allows developers to run code closer to their users by running it on Cloudflare servers. These services need a way of isolating code submitted by users to prevent it from performing malicious actions on their servers or from trying to interfere with other user's processes. NodeJS was not designed to handle this use-case by default because it allows access to the filesystem and network, for example.

However, there is another widely used technology that is designed to isolate JavaScript code: the web browser. Specifically, modern web browsers such as Google Chrome are carefully designed to try to ensure that websites in different tabs cannot interact with each other, for example. Would it be possible to use some of the same code on a server? [Cloudflare Workers](https://workers.cloudflare.com/) follow this exact approach by using V8, the open-source JavaScript engine used in Google Chrome, to isolate any user-submitted JavaScript code.

[isolated-vm](https://github.com/laverdet/isolated-vm) is a NodeJS library which allows access to v8's ``Isolate`` functionality.

Limitations
---
An important limitation of ``isolated-vm`` is that by default it only allows us to run "pure" JavaScript (i.e., the EMCAScript implementation) and no access is provided to either the browser APIs or the Node runtime. This means, for example, that it is not possible to use the ``require`` method to import libraries as in NodeJS or to access the DOM. One partial solution to this is to use [webpack](https://webpack.js.org/) to bundle external libraries and then transfer them manually over to the isolate instance. This seems to work for libraries that do not depend on core NodeJS modules that allow access to the filesystem or the network such as ``fs``, ``http`` or ``net``. 

Alternatives
---
* [Deno?](https://deno.land/)
* Write the JS runtime in Rust to solve potential latency issues with using Node. Fly.io moved in this direction after hitting limits with ``isolated-vm``

TODO
---
* Find code to cause memory leaks?
* Any code to break isolate?
* Spectre / Meltdown

