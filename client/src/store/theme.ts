import { Store } from 'vuex';
import { Module, VuexModule, getModule, Mutation, Action } from 'vuex-module-decorators';
import axios from 'axios';

export type Theme = {
	themeId: string,
	user: any,
	name: string,
	description: string,
	themeFileName: string,
	imageFileName: string
};

export default function<T> (store: Store<T>) {

	@Module({ dynamic: true, store: store, name: 'theme' })
	class ThemeStoreModule extends VuexModule {
		themes: Theme[] = [];
		themesFetched: boolean = false;

		@Mutation
		setThemesState(payload: { themes: Theme[] }) {
			if (!payload.themes) {
				throw new Error('invalid payload');
			}
			this.themes = payload.themes;
		}

		@Mutation
		setThemesFetchedState() {
			this.themesFetched = true;
		}

		@Mutation
		clearThemesState() {
			this.themes = [];
			this.themesFetched = false;
		}

		@Action
		async fetchThemes() {
			const result = await axios.post('/theme/list', { });
			if (result.status != 200) {
				throw new Error(result.data.error.reason);
			}
			const themes = result.data.result;
			this.setThemesState({ themes });
			this.setThemesFetchedState();
		}
	}

	return getModule(ThemeStoreModule);
};
