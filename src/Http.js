
import HttpUtil from "./Http/HttpUtil";
import { tryParseJson } from 'js-helpers/dist/json/tryParseJson';
import { encodeQueryData } from 'js-helpers/dist/request/queryStringParameter';

let _default_options = {};

let _default_headers = {};

let _init_then = (data) => data;

let _init_catch = (error) => {throw error};

let _base_url = "";

class Http {

    static get default_options() { return _default_options; }
    static set default_options(options) { _default_options = options; }
    static get default_headers() { return _default_headers; }
    static set default_headers(headers) { _default_headers = headers; }
    static get base_url() { return _base_url; }
    static set base_url(url) { _base_url = url; }
    static get init_then() { return _init_then; }
    static set init_then(func) { _init_then = func; }
    static get init_catch() { return _init_catch; }
    static set init_catch(func) { _init_catch = func; }

    static instance() {
        return new Http();
    }

    get(url, data = {}, options= {}) {
        return fetch(prepareGetUrl(this.prependBaseUrl(url), data), { method: 'GET', ...this.prepareOptions(options) })
            .then(checkStatus)
            .then(parseResponse)
            .catch(parseError)
            .then(Http.init_then)
            .catch(Http.init_catch);
    }

    post(url, data = {}, options= {}) {
        return fetch(this.prependBaseUrl(url), {
            method: 'POST',
            body: prepareData(data),
            ...this.prepareOptions(options, data)
        })
            .then(checkStatus)
            .then(parseResponse)
            .catch(parseError)
            .then(Http.init_then)
            .catch(Http.init_catch);
    }

    put(url, data, options= {}) {
        return Http.post(url, addMethodToData('PUT', data), options);
    }

    patch(url, data, options= {}) {
        return Http.post(url, addMethodToData('PATCH', data), options);
    }

    delete(url, data, options= {}) {
        return Http.post(url, addMethodToData('DELETE', data), options);
    }

    static setDefaultHeader(key, value) {
        Http.default_headers[key] = value;
    }

    static removeDefaultHeader(key) {
        let headers = Http.default_headers;
        delete headers[key];
        Http.default_headers = headers;
    }

    static setDefaultHeaders(headers) {
        Http.default_headers = headers;
    }

    static setDefaultOption(key, value) {
        Http.default_options[key] = value;
    }

    static removeDefaultOption(key) {
        let options = Http.default_options;
        delete options[key];
        Http.default_options = options;
    }

    static setDefaultOptions(options) {
        Http.default_options = options;
    }

    static setBaseUrl(url) {
        Http.base_url = url;
    }

    static getBaseUrl() {
        return Http.base_url;
    }

    prependBaseUrl(url) {
        let base_url = this.base_url || Http.base_url;
        if(base_url) {
            return base_url + url;
        }
        return url;
    }

    prepareOptions(opts, data) {
        let default_options = Http.default_options;
        let default_headers = Http.default_headers;
        let { headers = {}, ...options } = opts;

        if(HttpUtil.isFormData(data))  {
            //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
            delete default_headers.headers['Content-Type'];
        }

        if(options.hasOwnProperty('base_url')) {
            const { base_url, ...rest } = options;
            this.base_url = base_url;
            options = rest;
        }

        return {
            ...default_options,
            ...options,
            headers: {
                ...default_headers,
                ...headers
            }
        };
    }

    static setInitThen(func) {
        Http.init_then = func;
    }

    static setInitCatch(func) {
        Http.init_catch = func;
    }
}


function prepareData(data) {
    if(HttpUtil.isFormData(data)) return;

    if(!window.File || !HttpUtil.hasFiles(data)) return JSON.stringify(data);

    return HttpUtil.objectToFormData(data);
}

function prepareGetUrl(url,data) {
    return `${url}?${encodeQueryData(data)}`;
}

function addMethodToData(method,data) {
    if(HttpUtil.isFormData(data)) {
        data.append('_method',method);
        return data;
    }
    data._method = method;
    return data;
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
}

function parseResponse(response) {
    return response.text().then((data) => {
        return Promise.resolve({
            data: tryParseJson(data),
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            response
        });
    });
}

function parseError(error) {
    if(!error.response || !(error.response.status > 0)) throw error;
    return error.response.text().then((data) => {
        error.status = error.response.status;
        error.data = tryParseJson(data);
        throw error;
    })
}


export default Http;
