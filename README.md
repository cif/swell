# Swell

## Champion of the unobligatory shortcut

Swell is a collection of node.js compilers and a thin core library of objects that **speed the development of javascript apps on both client and server.**

### Under the hood

Swell compiles [Coffeescript](http://coffeescript.org/) objects into javascript that extend [Backbone.js](http://backbonejs.org) on the client and respond to requests made via [Express](http://expressjs.com/) / [NodeJS](http://nodejs.org) on the server. [Socket.io](http://socket.io) allows for easy communication beteween multiple connected clients.  By default, Swell utilizes [Dust](https://github.com/linkedin/dustjs/wiki/Dust-Tutorial) for templating (both client and server side) and [Stylus](http://learnboost.github.io/stylus/) as a CSS preprocessor however it can be very easily adapted to use different client side tools.

### Exposure

Swell applications always expose the core server modules giving you full control over the request and response pipeline. Core client modules are also exposed and compiled in to your app realtime as opposed to being black-boxed in a vendor or public file.

### Not Isomorphic

[Isomorphic](http://isomorphic.net/) apps run the same code on both the client and the server. This is **not the case with Swell.**  Models and collections are **defined in one place** and extend what appears to be the same class however, when compiled they **extend two different objects** each of which is intened for the client or server &mdash; but not both! 
 
<br>