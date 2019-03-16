<template>
<div>
	<p>theme detail</p>
	<div v-if="theme != null">
		<p>theme name: {{theme.name}}</p>
		<p>description: {{theme.description}}</p>
		<p>author: {{theme.user.username}}</p>
		<p>theme file: <a :href=themeUrl>download</a></p>
	</div>
	<div v-else>
		<p>now loading...</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

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
		const result = await axios.post('/theme/get', { themeId: this.$route.params.themeId });
		this.theme = (result.data.result as Theme);
	}
}
</script>

<style lang="scss">

</style>
