import { StoreOptions, GetterTree, ActionTree, MutationTree } from 'vuex';

export default class StorePart<S> {
	state?: S | (() => S);
	getters?: GetterTree<S, S>;
	actions?: ActionTree<S, S>;
	mutations?: MutationTree<S>;

	constructor(options: StoreOptions<S>) {
		this.state = options.state;
		this.getters = options.getters;
		this.actions = options.actions;
		this.mutations = options.mutations;
	}
}
