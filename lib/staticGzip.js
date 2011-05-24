/*!
 * Tom Gallacher
 * 
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
		parse = require('url').parse,
		path = require('path'),
		mime = require('mime'),
		compress = require('compress'),
		staticSend = require('connect').static.send;

/**
 * gzipped cache.
 */

var gzippoCache = {};

/**
 * gzip file.
 */
 
var gzippo = function(filename, callback) {
	var gzip = new compress.Gzip();
	gzip.init();
		fs.readFile(filename, function (err, data) {
		if (err) throw err;
		var gzippedData = gzip.deflate(data, 'binary') + gzip.end();
		callback(err, gzippedData);
	});
};

/**
 * By default gzip's static's that match the given regular expression /text|javascript|json/
 * and then serves them with Connects static provider, denoted by the given `dirPath`.
 *
 * Options:
 *
 *	-	`maxAge`  cache-control max-age directive, defaulting to 1 day
 *	-	`matchType` - A regular expression tested against the Content-Type header to determine whether the response 
 *		should be gzipped or not. The default value is `/text|javascript|json/`.
 *
 * Examples:
 *
 *     connect.createServer(
 *       connect.staticGzip(__dirname + '/public/');
 *     );
 *
 *     connect.createServer(
 *       connect.staticGzip(__dirname + '/public/', {maxAge: 86400000});
 *     );
 *
 * @param {String} path
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function staticGzip(dirPath, options){
	options = options || {};
	dirPath = dirPath || __dirname + '/public/';
	var maxAge = options.maxAge || 86400000,
	contentTypeMatch = options.contentTypeMatch || /text|javascript|json/;
	
	if (!contentTypeMatch.test) throw new Error('contentTypeMatch: must be a regular expression.');

  return function staticGzip(req, res, next){
		var url, filename, contentType, acceptEncoding;
		
		function pass(name) {
			var o = Object.create(options);
			o.path = name;
			staticSend(req, res, next, o);
		}
		
		function sendGzipped(data) {
			var charset = mime.charsets.lookup(contentType);
			contentType = contentType + (charset ? '; charset=' + charset : '');
			res.setHeader('Content-Type', contentType);
			res.setHeader('Content-Encoding', 'gzip');
			res.setHeader('Vary', 'Accept-Encoding');	
			res.setHeader('Content-Length', data.length);
			res.end(data, 'binary');
		}
		
		function gzipAndSend(filename, gzipName) {
			gzippo(filename, function(err, gzippedData) {
				gzippoCache[gzipName] = {
					'mtime': Date.now(),
					'content': gzippedData
				};
				sendGzipped(gzippedData);
			});	
		}
		
		
		if (req.method !== 'GET') {
			return next();
		}
		
		url = parse(req.url);
		filename = path.join(dirPath, url.pathname);
				
		contentType = mime.lookup(filename);
		acceptEncoding = req.headers['accept-encoding'] || '';

		if (!contentTypeMatch.test(contentType)) {
			return pass(filename);
		}
		
		if (!~acceptEncoding.indexOf('gzip')) {
			return pass(filename);
		}
		
		//This is storing in memory for the moment, need to think what the best way to do this.
		//Check file is not a directory
		
		fs.stat(filename, function(err, stat) {
			if (err || stat.isDirectory()) {
				return pass(filename);	
			}

			var base = path.basename(filename),
					dir = path.dirname(filename),
					gzipName = path.join(dir, base + '.gz');
					
			//check for pre-compressed file 
			//TODO: Look into placing into a loop and using dot notation for speed improvements. 
			if (typeof gzippoCache[gzipName] === 'undefined') {
				gzipAndSend(filename, gzipName);
			} else {
				if ((gzippoCache[gzipName].mtime + maxAge) < Date.now()) {
					gzipAndSend(filename, gzipName);
				} else {
					sendGzipped(gzippoCache[gzipName].content);
				}
			}
		});
	};
};