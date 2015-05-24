// derived from https://github.com/dnewcome/jath

window.HTML = window.HTML || {};

// element-scoped querySelector/querySelectorAll
HTML.select = function(selector, template, node) {
  // TODO: extend the HTMLDocument and Element prototypes and avoid this parameter?
  if (!node) {
    if (template instanceof HTMLDocument || template instanceof Element) {
      node = template;
      template = null;
    } else {
      node = document;
    }
  }

  // split selector if attribute matched
  var attributePosition = selector.indexOf('@');
  if (attributePosition !== -1) {
    template = selector.substring(attributePosition).trim();
    selector = selector.substring(0, attributePosition).trim();
  }

  // avoid Polymer's querySelectorAll shim
  if (typeof window.unwrap === 'function') {
    node = window.unwrap(node);
  }

  var item;

  if (selector) {
    if (Array.isArray(selector)) {
      selector = selector[0];

      // document queries shouldn't have scope
      if (!(node instanceof HTMLDocument)) {
        selector = ':scope ' + selector;
      }

      var items = node.querySelectorAll(selector);
      console.log(items.length + ' items selected', template);
      items = Array.prototype.slice.call(items);

      if (!template) {
        return items;
      }

      return items.map(function(item) {
        return HTML.extract(template, item);
      });
    }

    // document queries shouldn't have scope
    if (!(node instanceof HTMLDocument)) {
      selector = ':scope ' + selector;
    }

    item = node.querySelector(selector);
  } else {
    item = node;
  }

  if (!item) {
    return null;
  }

  if (!template) {
    return item;
  }

  return HTML.extract(template, item);
};

HTML.extract = function(template, node) {
  node = node || document;

  if (Array.isArray(template)) {
    return HTML.select(template, '.', node);
  }

  if (typeof template === 'object') {
    return HTML.extractObject(template, node);
  }

  return HTML.extractItem(template, node);
};

HTML.extractObject = function(template, node) {
  var output = {};

  Object.keys(template).forEach(function(key) {
    output[key] = HTML.select(template[key], '.', node);
  });

  return output;
};

HTML.extractItem = function(template, node) {
  // TODO: template as function

  if (template.substring(0, 1) === ':') {
    return template.substring(1); // literal value, from template
  }

  var attributeName;
  var attributePosition = template.indexOf('@');

  if (attributePosition !== -1) {
    attributeName = template.substring(attributePosition + 1).trim();
    template = template.substring(0, attributePosition).trim();
  }

  var itemNode = (template && template !== '.') ? node.querySelector(template) : node;

  if (!itemNode) {
    return null;
  }

  if (attributeName) {
    // special attributes
    if (['href', 'src', 'data'].indexOf(attributeName) !== -1) {
      return itemNode[attributeName];
    }

    return itemNode.getAttribute(attributeName);
  }

  return itemNode.textContent.trim();
};

HTML.parse = function(html) {
    return (new DOMParser()).parseFromString(html, 'text/html');
};
