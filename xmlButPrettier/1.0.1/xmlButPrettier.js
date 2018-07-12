(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
window.xmlButPrettier = require('xml-but-prettier');
},{"xml-but-prettier":3}],2:[function(require,module,exports){
/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

module.exports = repeat;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

},{}],3:[function(require,module,exports){
'use strict';

var repeat = require('repeat-string');

var splitOnTags = function splitOnTags(str) {
  return str.split(/(<\/?[^>]+>)/g).filter(function (line) {
    return line.trim() !== '';
  });
};
var isTag = function isTag(str) {
  return (/<[^>!]+>/.test(str)
  );
};
var isClosingTag = function isClosingTag(str) {
  return (/<\/+[^>]+>/.test(str)
  );
};
var isSelfClosingTag = function isSelfClosingTag(str) {
  return (/<[^>]+\/>/.test(str)
  );
};
var isOpeningTag = function isOpeningTag(str) {
  return isTag(str) && !isClosingTag(str) && !isSelfClosingTag(str);
};

module.exports = function (xml) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var indentor = config.indentor,
      textNodesOnSameLine = config.textNodesOnSameLine;

  var depth = 0;
  var indicesToRemove = [];
  indentor = indentor || '    ';

  var rawResult = lexer(xml).map(function (element, i, arr) {
    var value = element.value,
        type = element.type;

    if (type === 'ClosingTag') {
      depth--;
    }

    var indentation = repeat(indentor, depth);
    var line = indentation + value;

    if (type === 'OpeningTag') {
      depth++;
    }

    if (textNodesOnSameLine) {
      // Lookbehind for [OpeningTag][Text][ClosingTag]
      var oneBefore = arr[i - 1];
      var twoBefore = arr[i - 2];

      if (type === "ClosingTag" && oneBefore.type === "Text" && twoBefore.type === "OpeningTag") {
        // collapse into a single line
        line = '' + indentation + twoBefore.value + oneBefore.value + value;
        indicesToRemove.push(i - 2, i - 1);
      }
    }

    return line;
  });

  indicesToRemove.forEach(function (idx) {
    return rawResult[idx] = null;
  });

  return rawResult.filter(function (val) {
    return !!val;
  }).join('\n');
};

function lexer(xmlStr) {
  var values = splitOnTags(xmlStr);
  return values.map(function (value) {
    return {
      value: value,
      type: getType(value)
    };
  });
}

// Helpers

function getType(str) {
  if (isClosingTag(str)) {
    return 'ClosingTag';
  }

  if (isOpeningTag(str)) {
    return 'OpeningTag';
  }

  if (isSelfClosingTag(str)) {
    return 'SelfClosingTag';
  }

  return 'Text';
}
},{"repeat-string":2}]},{},[1]);
