<template>
<div class="themes-page">
	<p>theme list</p>
	<ul v-if="themes.length != 0">
		<li v-for="theme in themes" :key="theme.themeId">
			<p>{{theme.name}}</p>
			<p>{{theme.description}}</p>
			<router-link :to="{ name: 'themeDetail', params: { themeId: theme.themeId } }">detail page</router-link>
		</li>
	</ul>
	<div v-else>
		<p>no themes</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { themeModule } from '../../store';

@Component({ components: { } })
export default class extends Vue {
	get themes() {
		return themeModule.themes;
	};

	@Prop() query!: string;

	async created() {
		if (!themeModule.themesFetched) {
			await themeModule.fetchThemes();
		}
	}
}
</script>

<style lang="scss" scoped>
.themes-page {
	margin: 1.5rem;
}
</style>
