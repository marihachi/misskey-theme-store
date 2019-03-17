<template>
<div class="signin-page">
	<signin />
	<signup />
</div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import signin from '../signin.vue';
import signup from '../signup.vue';


@Component({ components: { signin, signup } })
export default class extends Vue {

}
</script>

<style lang="scss" scoped>
.signin-page {
}
</style>
