import _objectToFormData from 'js-helpers/dist/request/objectToFormData';
import { tryParseJson } from 'js-helpers/dist/json/tryParseJson';
import { encodeQueryData } from 'js-helpers/dist/request/queryStringParameter';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpUtil = function () {
    function HttpUtil() {
        _classCallCheck(this, HttpUtil);
    }

    _createClass(HttpUtil, null, [{
        key: 'isFormData',
        value: function isFormData(data) {
            return typeof FormData !== 'undefined' && data instanceof FormData;
        }
    }, {
        key: 'hasFiles',
        value: function hasFiles(data) {
            return Object.keys(data).some(function (property) {
                return data[property] instanceof File || data[property] instanceof FileList;
            });
        }
    }, {
        key: 'prepareMethodType',
        value: function prepareMethodType(options) {
            /* eslint-disable no-param-reassign */
            var methodType = options.method ? options.method.toLowerCase() : options.method;

            if (methodType !== 'put' && methodType !== 'patch') return options;

            if (HttpUtil.isFormData(options.data)) {
                options.data.append('_method', methodType);
            } else {
                options.data._method = methodType;
            }

            options.method = 'POST';

            return options;
        }
    }, {
        key: 'objectToFormData',
        value: function objectToFormData(data) {
            return _objectToFormData(data);
        }
    }, {
        key: 'urlGenerator',
        value: function urlGenerator(baseUrl, url) {
            var base = baseUrl.replace(/\/$/, '');
            url = url.replace(/^\//, '');
            return base + '/' + url;
        }
    }]);

    return HttpUtil;
}();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default_options = {};

var _default_headers = {};

var _init_then = function _init_then(data) {
    return data;
};

var _init_catch = function _init_catch(error) {
    throw error;
};

var _base_url = "";

var Http = function () {
    function Http() {
        _classCallCheck$1(this, Http);
    }

    _createClass$1(Http, [{
        key: 'get',
        value: function get(url) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return fetch(prepareGetUrl(this.prependBaseUrl(url), data), _extends({ method: 'GET' }, this.prepareOptions(options))).then(checkStatus).then(parseResponse).catch(parseError).then(Http.init_then).catch(Http.init_catch);
        }
    }, {
        key: 'post',
        value: function post(url) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return fetch(this.prependBaseUrl(url), _extends({
                method: 'POST',
                body: prepareData(data)
            }, this.prepareOptions(options, data))).then(checkStatus).then(parseResponse).catch(parseError).then(Http.init_then).catch(Http.init_catch);
        }
    }, {
        key: 'put',
        value: function put(url, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return Http.post(url, addMethodToData('PUT', data), options);
        }
    }, {
        key: 'patch',
        value: function patch(url, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return Http.post(url, addMethodToData('PATCH', data), options);
        }
    }, {
        key: 'delete',
        value: function _delete(url, data) {
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return Http.post(url, addMethodToData('DELETE', data), options);
        }
    }, {
        key: 'prependBaseUrl',
        value: function prependBaseUrl(url) {
            var base_url = this.base_url || Http.base_url;
            if (base_url) {
                return base_url + url;
            }
            return url;
        }
    }, {
        key: 'prepareOptions',
        value: function prepareOptions(opts, data) {
            var default_options = Http.default_options;
            var default_headers = Http.default_headers;

            var _opts$headers = opts.headers,
                headers = _opts$headers === undefined ? {} : _opts$headers,
                options = _objectWithoutProperties(opts, ['headers']);

            if (HttpUtil.isFormData(data)) {
                //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
                delete default_headers.headers['Content-Type'];
            }

            if (options.hasOwnProperty('base_url')) {
                var _options = options,
                    base_url = _options.base_url,
                    rest = _objectWithoutProperties(_options, ['base_url']);

                this.base_url = base_url;
                options = rest;
            }

            return _extends({}, default_options, options, {
                headers: _extends({}, default_headers, headers)
            });
        }
    }], [{
        key: 'instance',
        value: function instance() {
            return new Http();
        }
    }, {
        key: 'setDefaultHeader',
        value: function setDefaultHeader(key, value) {
            Http.default_headers[key] = value;
        }
    }, {
        key: 'removeDefaultHeader',
        value: function removeDefaultHeader(key) {
            var headers = Http.default_headers;
            delete headers[key];
            Http.default_headers = headers;
        }
    }, {
        key: 'setDefaultHeaders',
        value: function setDefaultHeaders(headers) {
            Http.default_headers = headers;
        }
    }, {
        key: 'setDefaultOption',
        value: function setDefaultOption(key, value) {
            Http.default_options[key] = value;
        }
    }, {
        key: 'removeDefaultOption',
        value: function removeDefaultOption(key) {
            var options = Http.default_options;
            delete options[key];
            Http.default_options = options;
        }
    }, {
        key: 'setDefaultOptions',
        value: function setDefaultOptions(options) {
            Http.default_options = options;
        }
    }, {
        key: 'setBaseUrl',
        value: function setBaseUrl(url) {
            Http.base_url = url;
        }
    }, {
        key: 'getBaseUrl',
        value: function getBaseUrl() {
            return Http.base_url;
        }
    }, {
        key: 'setInitThen',
        value: function setInitThen(func) {
            Http.init_then = func;
        }
    }, {
        key: 'setInitCatch',
        value: function setInitCatch(func) {
            Http.init_catch = func;
        }
    }, {
        key: 'default_options',
        get: function get() {
            return _default_options;
        },
        set: function set(options) {
            _default_options = options;
        }
    }, {
        key: 'default_headers',
        get: function get() {
            return _default_headers;
        },
        set: function set(headers) {
            _default_headers = headers;
        }
    }, {
        key: 'base_url',
        get: function get() {
            return _base_url;
        },
        set: function set(url) {
            _base_url = url;
        }
    }, {
        key: 'init_then',
        get: function get() {
            return _init_then;
        },
        set: function set(func) {
            _init_then = func;
        }
    }, {
        key: 'init_catch',
        get: function get() {
            return _init_catch;
        },
        set: function set(func) {
            _init_catch = func;
        }
    }]);

    return Http;
}();

function prepareData(data) {
    if (HttpUtil.isFormData(data)) return;

    if (!window.File || !HttpUtil.hasFiles(data)) return JSON.stringify(data);

    return HttpUtil.objectToFormData(data);
}

function prepareGetUrl(url, data) {
    return url + '?' + encodeQueryData(data);
}

function addMethodToData(method, data) {
    if (HttpUtil.isFormData(data)) {
        data.append('_method', method);
        return data;
    }
    data._method = method;
    return data;
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

function parseResponse(response) {
    return response.text().then(function (data) {
        return Promise.resolve({
            data: tryParseJson(data),
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            response: response
        });
    });
}

function parseError(error) {
    if (!error.response || !(error.response.status > 0)) throw error;
    return error.response.text().then(function (data) {
        error.status = error.response.status;
        error.data = tryParseJson(data);
        throw error;
    });
}

function _objectWithoutProperties$1(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function install(Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _options$headers = options.headers,
        headers = _options$headers === undefined ? {} : _options$headers,
        rest = _objectWithoutProperties$1(options, ['headers']);

    Http.setDefaultOptions(rest);
    Http.setDefaultHeaders(headers);

    Vue.prototype.$http = Http;
}

// Create module definition for Vue.use()
var plugin = {
    install: install

    // To auto-install when vue is found
    /* global window global */
};var GlobalVue = null;
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
}
if (GlobalVue) {
    GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
Http.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;

export default Http;
