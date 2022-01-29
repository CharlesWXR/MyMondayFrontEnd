<template>
    <el-row justify="center">
        <el-col :span="8">        
            <el-button type="text">忘记密码？</el-button>
            <a-divider type="vertical"></a-divider>
            <el-button type="text" @click="createAccount"> 创建账号</el-button>
        </el-col>        
    </el-row>
</template>

<script>
export default {
    name: 'LoginFooter',
    methods: {
        createAccount() {
            this.$router.push('/register')
        }
    }
}

</script>

<style scoped>

</style>
