<template>
<div class="themes-page">
	<ul v-if="themes.length != 0">
		<li v-for="theme in themes" :key="theme.themeId">
			<div :style="{ background: theme.secondaryColor, color: theme.textColor }">
				<p>{{theme.name}}</p>
				<p>{{theme.description}}</p>
				<router-link :to="{ name: 'themeDetail', params: { themeId: theme.themeId } }" :style="{ color: theme.primaryColor }">
					詳細ページへ
				</router-link>
			</div>
		</li>
	</ul>
	<div v-else>
		<p>テーマがまだありません</p>
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

	ul {
		display: flex;
		flex-wrap: wrap;
		padding: 0;

		> li {
			list-style: none;
			background-color: hsla(28, 75%, 40%, 0.14);
			margin: 1rem;
			border-radius: 0.5rem;

			> div {
				border-radius: 0.5rem;
				padding: 1rem;
				height: 16rem;
				width: 16rem;

				p {
					margin: 0 0 1rem 0;
				}
			}
		}
	}
}
</style>
