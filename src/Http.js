
import HttpUtil from "./Http/HttpUtil";
import { tryParseJson } from 'js-helpers/dist/json/tryParseJson';
import { encodeQueryData } from 'js-helpers/dist/request/queryStringParameter';

let _default_options = {};

let _default_headers = {};

let _base_url = "";

class Http {

    static get default_options() { return _default_options; }
    static set default_options(options) { _default_options = options; }
    static get default_headers() { return _default_headers; }
    static set default_headers(headers) { _default_headers = headers; }
    static get base_url() { return _base_url; }
    static set base_url(url) { _base_url = url; }

    static get(url, data = {}, options= {}) {
        return fetch(prepareGetUrl(prependBaseUrl(url), data), { method: 'GET', ...prepareOptions(options) })
            .then(checkStatus)
            .then(parseResponse)
            .catch(parseError);
    }

    static post(url, data = {}, options= {}) {
        return fetch(prependBaseUrl(url), {
            method: 'POST',
            body: prepareData(data),
            ...prepareOptions(options, data)
        })
            .then(checkStatus)
            .then(parseResponse)
            .catch(parseError);
    }

    static put(url, data, options= {}) {
        return Http.post(url, addMethodToData('PUT', data), options);
    }

    static patch(url, data, options= {}) {
        return Http.post(url, addMethodToData('PATCH', data), options);
    }

    static delete(url, data, options= {}) {
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
}

function prepareOptions(opts, data) {
    let default_options = Http.default_options;
    let default_headers = Http.default_headers;
    let { headers = {}, ...options } = opts;

    if(HttpUtil.isFormData(data))  {
        //https://stackoverflow.com/questions/39280438/fetch-missing-boundary-in-multipart-form-data-post
        delete default_headers.headers['Content-Type'];
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

function prependBaseUrl(url) {
    if(Http.base_url) {
        return Http.base_url + url;
    }
    return url;
}

export default Http;
