<template>
	<login-header class="login-header"></login-header>
	<login-form></login-form>
</template>

<script>
// @ is an alias to /src
import LoginHeader from "@/components/LoginHeader.vue"
import LoginForm from "@/components/LoginForm.vue"

export default {
	name: 'Home',
	components: {
		LoginHeader,
		LoginForm
	}
}
</script>

<style scoped>
	.login-header {
		padding-top: 20vh;
		margin-bottom: 5vh;
	}
</style>