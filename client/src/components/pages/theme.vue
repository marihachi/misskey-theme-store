<template>
<div class="theme-page">
	<div v-if="theme != null">
		<p>テーマ名: {{theme.name}}</p>
		<p>説明: {{theme.description}}</p>
		<p>作者: <router-link :to="{ name: 'userDetail', params: { username: theme.user.username } }">@{{theme.user.username}}</router-link></p>
		<p>テーマファイル: <a :href=themeUrl>download</a></p>
	</div>
	<div v-else>
		<p>読み込んでいます...</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import api from '../../utils/requestApi';

type Theme = {
	themeId: string,
	user: any,
	name: string,
	description: string,
	themeFileName: string,
	imageFileName: string
};

@Component({ components: { } })
export default class extends Vue {
	theme: Theme | null = null;

	get themeUrl() {
		if (this.theme) {
			return `/theme/file/${this.theme.themeFileName}`;
		}
		else {
			return '';
		}
	}

	async created() {
		const res = await api('/theme/get', { themeId: this.$route.params.themeId });
		this.theme = (res.result as Theme);
	}
}
</script>

<style lang="scss" scoped>
.theme-page {
	margin: 1.5rem;
}
</style>
