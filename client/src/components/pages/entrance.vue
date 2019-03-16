<template>
<div v-if="isLogin">
	<p>ログイン済みです</p>
</div>
<div v-else>
	<signup />
	<signin />
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import signup from '../signup.vue';
import signin from '../signin.vue';

@Component({ components: { signup, signin } })
export default class extends Vue {
	get isLogin() {
		return this.$store.getters.session;
	}
}
</script>

<style lang="scss">

</style>
