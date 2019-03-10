<template>
<div>
	<p>アカウントの登録</p>
	<form>
		<div>
			<input type="text">
		</div>
		<div>
			<input type="password">
		</div>
		<button>登録する</button>
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
