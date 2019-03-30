<template>
<div class="themes-page">
	<ul v-if="themes.length != 0">
		<li v-for="theme in themes" :key="theme.themeId">
			<div class="card" :style="{ background: theme.secondaryColor, color: theme.textColor }">
				<div class="name">
					<p>{{theme.name}}</p>
				</div>
				<div class="desc">
					<p>{{theme.description}}</p>
				</div>
				<div class="details-link">
					<router-link :to="{ name: 'themeDetail', params: { themeId: theme.themeId } }" :style="{ color: theme.primaryColor }">
						詳細ページへ
					</router-link>
				</div>
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
			margin: 1rem;

			.card {
				display: flex;
				flex-direction: column;
				border-radius: 0.5rem;
				padding: 1rem;
				width: 16rem;
				min-height: 8rem;

				p {
					margin: 0 0 1rem 0;
				}

				.name {
				}

				.desc {
					p {
						font-size: 0.8rem;
					}
				}

				.details-link {
					margin-top: auto;
				}
			}
		}
	}
}
</style>
