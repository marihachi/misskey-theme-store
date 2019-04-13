import { Store } from 'vuex';
import { Module, VuexModule, getModule, Mutation, Action } from 'vuex-module-decorators';
import api from '../utils/requestApi';

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

		// themes
		@Mutation
		setThemesState(payload: { themes: Theme[] }) {
			if (!payload.themes) {
				throw new Error('invalid payload');
			}
			this.themes = payload.themes;
		}

		@Mutation
		clearThemesState() {
			this.themes = [];
			this.themesFetched = false;
		}

		// themesFetched
		@Mutation
		setThemesFetchedState() {
			this.themesFetched = true;
		}

		// theme
		@Mutation
		addThemeState(payload: { theme: Theme }) {
			if (!payload.theme) {
				throw new Error('invalid payload');
			}
			this.themes.splice(0, 0, payload.theme);
		}

		@Mutation
		setThemeState(payload: { theme: Theme }) {
			if (!payload.theme) {
				throw new Error('invalid payload');
			}
			const index = this.themes.findIndex(i => i.themeId == payload.theme.themeId);
			// if not exists
			if (index == -1) {
				this.addThemeState(payload);
				return;
			}
			this.themes[index] = payload.theme;
		}

		@Mutation
		findThemeState(payload: { themeId: string }) {
			if (!payload.themeId) {
				throw new Error('invalid payload');
			}
			return this.themes.find(i => i.themeId == payload.themeId);
		}

		@Mutation
		replaceThemeState(payload: { themeId: string, theme: Theme }) {
			if (!payload.themeId) {
				throw new Error('invalid payload');
			}
			const index = this.themes.findIndex(i => i.themeId == payload.themeId);
			if (index != -1) {
				this.themes.splice(index, 1, payload.theme);
			}
		}

		@Mutation
		deleteThemeState(payload: { themeId: string }) {
			if (!payload.themeId) {
				throw new Error('invalid payload');
			}
			const index = this.themes.findIndex(i => i.themeId == payload.themeId);
			if (index != -1) {
				this.themes.splice(index, 1);
			}
		}

		@Action
		async fetchThemes() {
			const res = await api('/theme/list', { });
			if (res.error) {
				throw new Error(res.error.reason);
			}
			const themes = res.result;
			this.setThemesState({ themes });
			this.setThemesFetchedState();
		}
	}

	return getModule(ThemeStoreModule);
};
