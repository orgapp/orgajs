import handlers from './handlers'
import { transform } from './transform'

module.exports = orga2rehype

function h(node, tagName, props, children) {
  if (
    (children === undefined || children === null) &&
      typeof props === 'object' &&
      'length' in props
  ) {
    children = props
    props = {}
  }

  return {
    type: 'element',
    tagName,
    properties: props || {},
    children: children || []
  }
}

function toHAST(tree, options) {
  h.handlers = handlers
  return transform(h, tree)
}


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
    destination.run(toHAST(node, options), file, done);
    function done(err) {
      next(err);
    }
  }
}

/* Mutate-mode.  Further transformers run on the HAST tree. */
function mutate(options) {
  return transformer;
  function transformer(node) {
    return toHAST(node, options);
  }
}
