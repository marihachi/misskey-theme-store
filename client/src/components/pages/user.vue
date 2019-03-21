<template>
<div class="user-page">
	<p>user detail</p>
	<div v-if="user">
		<p>username: {{user.username}}</p>
		<p>userId: {{user.userId}}</p>
		<p>themes:</p>
		<ul v-if="user.themes.length != 0">
			<li v-for="theme in user.themes" :key="theme.themeId">
				<p>{{theme.name}}</p>
				<p>{{theme.description}}</p>
				<router-link :to="{ name: 'themeDetail', params: { themeId: theme.themeId } }">detail page</router-link>
			</li>
		</ul>
		<p v-else>テーマは投稿されていません</p>
	</div>
	<div v-else>
		<p>ユーザーが見つかりません</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import axios from 'axios';

@Component({ components: { } })
export default class extends Vue {
	user: any = null;

	async created() {
		const resolved = await axios.post('/user/resolve', { username: this.$route.params.username });
		if (resolved.status != 200) {
			console.error(resolved.data);
			return;
		}
		const userId = resolved.data.result;
		const userFetched = await axios.post('/user/get', { userId: userId });
		if (userFetched.status != 200) {
			console.error(userFetched.data);
			return;
		}
		this.user = userFetched.data.result;
	}
}
</script>

<style lang="scss" scoped>
.user-page {
}
</style>
