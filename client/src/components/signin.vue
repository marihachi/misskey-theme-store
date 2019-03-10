<template>
<div>
	<p>ログイン</p>
	<form>
		<div>
			<input type="text">
		</div>
		<div>
			<input type="password">
		</div>
		<button>ログインする</button>
	</form>
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component({ components: { } })
export default class extends Vue {

}
</script>

<style lang="scss">

</style>
