<template>
<div class="theme-page">
	<div v-if="theme != null">
		<div class="container">
			<div class="left">
				<img :src=themeImageUrl v-if="theme.imageFileName != null" />
			</div>
			<div class="right">
				<h1>{{theme.name}}</h1>
				<p>{{theme.description}}</p>
				<p>作者: <router-link :to="{ name: 'userDetail', params: { username: theme.user.username } }">{{theme.user.username}}</router-link></p>
				<a :href=themeUrl class="button">このテーマをダウンロード</a>
				<div class="author-setting" v-if="isAuthor">
					<h2>投稿したテーマの設定</h2>
					<label for="image-file" class="file-select button">
						スクリーンショットの登録
						<input type="file" id="image-file" @change="e => onFileChanged(e)" accept=".jpg, .png">
					</label>
					<button class="button" @click="deleteTheme()">テーマの削除</button>
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
import { sessionModule, themeModule } from '../../store';

type Theme = {
	themeId: string,
	user: any,
	name: string,
	description: string,
	themeFileName: string,
	imageFileName: string
};

const readFileAsBase64 = (file: Blob) => new Promise<any>((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = (e) => {
		const result: string | ArrayBuffer | null = reader.result;
		if (result == null) return reject('result is null');
		if (result instanceof ArrayBuffer) return reject('result is not string');
		resolve(result.split(',')[1]);
	};
	reader.onerror = (e) => {
		reject(new Error('file read error'));
	};
	reader.readAsDataURL(file);
});

@Component({ components: { } })
export default class extends Vue {

	get theme(): Theme | undefined {
		return themeModule.themes.find(i => i.themeId == this.$route.params.themeId);
	}

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

	get themeImageUrl() {
		if (this.theme) {
			return `/theme/image/${this.theme.imageFileName}`;
		}
		else {
			return '';
		}
	}

	async created() {
	}

	async deleteTheme() {
		if (!sessionModule.session) return;
		const res = await api('/theme/delete', {
			token: sessionModule.session.token,
			themeId: this.$route.params.themeId
		});
	}

	async onFileChanged(e: any) {
		if (!sessionModule.session) {
			return;
		}

		if (this.theme == null) {
			return;
		}

		const file = e.target.files[0];
		if (!file) {
			return;
		}
		const image = await readFileAsBase64(file);

		const res = await api('/theme/image/register', {
			token: sessionModule.session.token,
			themeId: this.theme.themeId,
			imageData: image
		});
		if (res.error) {
			console.error(res.error);
			alert('スクリーンショットの登録に失敗しました');
			return;
		}
		const theme: Theme = res.result;
	}
}
</script>

<style lang="scss" scoped>
.theme-page {
	margin: 1.5rem;

	.container {
		display: flex;

		.left {
			img {
				max-width: 512px;
			}
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
