'use strict';

var _oastToHast = require('oast-to-hast');

var _oastToHast2 = _interopRequireDefault(_oastToHast);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = orga2rehype;

function orga2rehype(destination, options) {
  if (destination && !destination.process) {
    options = destination;
    destination = null;
  }

  return destination ? bridge(destination, options) : mutate(options);
}

/* Bridge-mode.  Runs the destination with the new HAST
 * tree. */
function bridge(destination, options) {
  return transformer;
  function transformer(node, file, next) {
    destination.run((0, _oastToHast2.default)(node, options), file, done);
    function done(err) {
      next(err);
    }
  }
}

/* Mutate-mode.  Further transformers run on the HAST tree. */
function mutate(options) {
  return transformer;
  function transformer(node) {
    return (0, _oastToHast2.default)(node, options);
  }
}