<template>
    <el-row justify="center">
        <el-col :lg="2" :md="2" :sm="4" :xs="4">
            <img :src="logoSrc" class="login-header-logo">
        </el-col>
        <el-col :span="1" justify="center">
            <el-divider direction="vertical" class="login-header-divider"></el-divider>
        </el-col>
        <el-col :lg="4" :md="5" :sm="8" :xs="11">
            <a-typography-title class="login-header-header header">MyMonday</a-typography-title>
        </el-col>
    </el-row>
</template>

<script>
export default {
    name: "LoginHeader",
    data() {
        return {
            logoSrc: require("../assets/img/main-logo.png")
        }
    }
}
</script>

<style scoped>
    .login-header-logo {
        margin: auto;
        width: 80%;
        max-height: 10vh;
        max-width: 10vh;
        text-align: center;
    }

    .login-header-divider {
        height: 100%;
        width: 10%;
        padding: 10%;
        text-align: center;
    }

    .login-header-header {
        padding-top: 5%;
    }

    .header {
        color: #409eff;
    }
</style>