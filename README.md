# gzippo

gzippo pronounced `g-zippo` is a gzip middleware for Connect using Compress for better performace.

## Installation
	
	$ npm install gzippo

### Usage

In your express/connect server setup, use as follows:
	var gzippo = require('gzippo');
	
	//Replace the static provider with gzippo's
	//app.use(express.static(__dirname + '/public'));
	app.use(gzippo.staticGzip(__dirname + '/public'));

Options:

- `matchType` - A regular expression tested against the Content-Type header to determine whether the response should be gzipped or not. The default value is `/text|javascript|json/`.
- `maxAge` - cache-control max-age directive, defaulting to 1 day

Currently the gzipped version is created and stored in memory. This is not final and was done to get a working version
up and about. A version which will gzip text/html after res.render() / res.end() is in progress.
	
[node-compress](https://github.com/waveto/node-compress) gzip library is used for gzipping.

## License

(The MIT License)

Copyright (c) 2011 Tom Gallacher &lt;<http://www.tomgallacher.info>&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.