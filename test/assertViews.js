var assert = require('assert');
var path = require('path');
var fs = require('fs');
var jsHtml = require('../main');
var util = require('../lib/util');

var whitespaceRegex = /\s+/g;

function runDirectory(dirPath, options)	{
	var extendOptionsJson = '{}';
	try	{
		extendOptionsJson = fs.readFileSync(dirPath + '.json', 'utf-8');
	}
	catch(ex)	{
	}
	var extendOptions = JSON.parse(extendOptionsJson);
	var options = util.extend({}, options, extendOptions);
	
	fs.readdirSync(dirPath).forEach(function(subPath) {
		var filePath = dirPath + '/' + subPath;
		var fileStat = fs.statSync(filePath);
		if(fileStat.isDirectory()) runDirectory(filePath, options);
		if(fileStat.isFile()) runFile(filePath, options);
	});
}

function runFile(filePath, options)	{
	var match = /((.*\/)?(.+))\.html$/i.exec(filePath);
	if (!match) return;

	console.log('[' + match[3] + ']');


	var extendOptionsJson = '{}';
	try	{
		extendOptionsJson = fs.readFileSync(match[1] + '.json', 'utf-8');
	}
	catch(ex)	{
	}
	var extendOptions = JSON.parse(extendOptionsJson);
	var options = util.extend({}, options, extendOptions);



	var expect = fs.readFileSync(match[1] + '.html', 'utf-8');
	var actual = '';
	function write(){
		var argumentCount = arguments.length;
		for(var argumentIndex = 0; argumentIndex < argumentCount; argumentIndex++){
			var argument = arguments[argumentIndex];
			actual += util.str(argument);
		}
	}
	function end(){
		write.apply(this, arguments);

		expect = expect.replace(whitespaceRegex, '');
		actual = actual.replace(whitespaceRegex, '');

		assert.equal(actual, expect);
	}

	jsHtml.renderAsync(write, end, fs.readFileSync(match[1] + '.jshtml', 'utf-8'), options);
}

runDirectory(path.normalize(__dirname + '/../examples/views'), {});

