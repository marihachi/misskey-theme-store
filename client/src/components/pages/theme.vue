<template>
<div class="theme-page">
	<div v-if="theme != null">
		<div class="container">
			<div class="left">
				<div class="theme-image"></div>
			</div>
			<div class="right">
				<h1>{{theme.name}}</h1>
				<p>{{theme.description}}</p>
				<p>作者: <router-link :to="{ name: 'userDetail', params: { username: theme.user.username } }">@{{theme.user.username}}</router-link></p>
				<a :href=themeUrl class="button">このテーマをダウンロード</a>
				<div class="author-setting" v-if="isAuthor">
					<h2>投稿したテーマの設定</h2>
					<label for="image-file" class="file-select button">
						スクリーンショットの登録
						<input type="file" id="image-file" @change="e => onFileChanged(e)" accept=".jpg .png">
					</label>
					<button class="button">テーマの削除</button>
				</div>
			</div>
		</div>
	</div>
	<div v-else>
		<p>読み込んでいます...</p>
	</div>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import api from '../../utils/requestApi';
import { sessionModule } from '../../store';

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

	get isAuthor() {
		if (!sessionModule.session || !this.theme) {
			return false;
		}
		return (sessionModule.session.user.userId == this.theme.user.userId);
	}

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

	.container {
		display: flex;

		.left {

		}

		.right {
			.file-select {
				input {
					display: none;
				}
			}
		}
	}
}
</style>
