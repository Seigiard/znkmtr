window.$$ = (function (window, document, fn, nsRegAndEvents, id, s_EventListener, s_MatchesSelector, i, j, k, l, $) {
  $ = function (s, context) {
    return new $.i(s, context);
  };

  $.i = function (s, context) {
    fn.push.apply(this, !s ? fn : s.nodeType || s == window ? [s] : "" + s === s ? /</.test(s)
      ? ((i = document.createElement(context || 'q')).innerHTML = s, i.children) : (context && $(context)[0] || document).querySelectorAll(s) : /f/.test(typeof s) ? /c/.test(document.readyState) ? s() : $(document).on('DOMContentLoaded', s) : s);
  };

  $.i[l = 'prototype'] = ($.extend = function (obj) {
    k = arguments;
    for (i = 1; i < k.length; i++) {
      if (l = k[i]) {
        for (j in l) {
          obj[j] = l[j];
        }
      }
    }

    return obj;
  })($.fn = $[l] = fn, { // $.fn = $.prototype = fn
    on: function (n, f) {
      // n = [ eventName, nameSpace ]
      n = n.split(nsRegAndEvents);
      this.map(function (item) {
        // item.b$ is balalaika_id for an element
        // i is eventName + id ("click75")
        // nsRegAndEvents[ i ] is array of events (eg all click events for element#75) ([[namespace, handler], [namespace, handler]])
        (nsRegAndEvents[i = n[0] + (item.b$ = item.b$ || ++id)] = nsRegAndEvents[i] || []).push([f, n[1]]);
        // item.addEventListener( eventName, f )
        item['add' + s_EventListener](n[0], f);
      });
      return this;
    },
    addClass: function (className) {
      this.forEach(function (item) {
        var classList = item.classList;
        classList.add.apply(classList, className.split(/\s/));
      });
      return this;
    },

    removeClass: function (className) {
      this.forEach(function (item) {
        var classList = item.classList;
        classList.remove.apply(classList, className.split(/\s/));
      });
      return this;
    },

    toggleClass: function (className) {
      this.forEach(function (item) {
        var classList = item.classList;
        classList.toggle.apply(classList, className.split(/\s/));
      });
      return this;
    },
  });
  return $;
})(window, document, [], /\.(.+)/, 0, 'EventListener', 'MatchesSelector')