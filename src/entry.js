
import Http from './Http';

function install(Vue, options = {}) {

    const { headers = {}, ...rest } = options;

    Http.setDefaultOptions(rest);
    Http.setDefaultHeaders(headers);

    Vue.prototype.$http = Http;

}

// Create module definition for Vue.use()
const plugin = {
    install
}

// To auto-install when vue is found
/* global window global */
let GlobalVue = null
if (typeof window !== 'undefined') {
    GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue
}
if (GlobalVue) {
    GlobalVue.use(plugin)
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
Http.install = install

// Export component by default
export default Http

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
