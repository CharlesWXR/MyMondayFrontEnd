<template>
	<login-header class="login-header"></login-header>
	<login-form></login-form>
	<login-footer class="login-footer"></login-footer>
</template>

<script>
// @ is an alias to /src
import LoginHeader from "@/components/LoginHeader.vue"
import LoginForm from "@/components/LoginForm.vue"
import LoginFooter from "@/components/LoginFooter.vue"

export default {
	name: 'Home',
	components: {
		LoginHeader,
		LoginForm,
		LoginFooter
	}
}
</script>

<style scoped>
	.login-footer {
		text-align: center;
		margin-left: 10%;
		width: 80%;
	}
</style>