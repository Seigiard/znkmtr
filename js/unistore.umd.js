!function (n, t) { "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : n.unistore = t() }(this, function () { function n(n, t) { for (var e in t) n[e] = t[e]; return n } return function (t) { var e = []; function u(n) { for (var t = [], u = 0; u < e.length; u++)e[u] === n ? n = null : t.push(e[u]); e = t } function r(u, r, o) { t = r ? u : n(n({}, t), u); for (var f = e, i = 0; i < f.length; i++)f[i](t, o) } return t = t || {}, { action: function (n) { function e(t) { r(t, !1, n) } return function () { for (var u = arguments, r = [t], o = 0; o < arguments.length; o++)r.push(u[o]); var f = n.apply(this, r); if (null != f) return f.then ? f.then(e) : e(f) } }, setState: r, subscribe: function (n) { return e.push(n), function () { u(n) } }, unsubscribe: u, getState: function () { return t } } } });
