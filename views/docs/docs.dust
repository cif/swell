# Swell

## Champion of the unobligatory shorcut

Swell is **not a framework**, but rather a collection of compilers and a thin core library of objects that **speed the development of javascript apps.**

### Under the hood

Swell compiles [Coffeescript](http://coffeescript.org/) objects into javascript that extend [Backbone.js](http://backbonejs.org) on the client and respond to requests made via [Express](http://expressjs.com/) / [NodeJS](http://nodejs.org) on the server. A built-in [Socket.io](http://socket.io) instance allows for easy communication beteween multiple connected clients.  By default, Swell utilizes [Dust](https://github.com/linkedin/dustjs/wiki/Dust-Tutorial) for templating (both client and server side) and [Stylus](http://learnboost.github.io/stylus/) as a CSS preprocessor. You can always utilize other technologies to compress and package your static assets.

### Exposure

Swell applications always expose the core [server](/page/server) modules giving you full control over the entire request and response pipeline. The core [client](/page/client) modules are also exposed and included in your compiled app.

If you are developing exclusivey on the client or simply dont like coffeescript, [brunch](http://brunch.io/) or [grunt](http://gruntjs.com/) are better choices. 

### Isomorphic... yet not

For apps to be isomorphic by definition, the code that comprises them runs on both the client and the server which is **not *really* the case with Swell.**  While your data constructs are **defined in one place** and extend what appears to be the same class, in practice the objects they extend are two different objects designed to run on each client and server.

<br>

Ready? [Let's get started](/page/start)
