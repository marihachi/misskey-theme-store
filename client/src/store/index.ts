import Vue from 'vue';
import Vuex from 'vuex';

import session from './session';
import theme from './theme';

Vue.use(Vuex);
const store = new Vuex.Store({ });

export default store;
export const sessionModule = session(store);
export const themeModule = theme(store);
