<template>
    <el-row justify="center" class="reg-footer">
        <el-col :span="1" justify="center">
            <el-button type="text" @click="click">已有账号？</el-button>
        </el-col>
    </el-row>
</template>

<script>
export default {
    name: "RegFooter",
    methods: {
        click: function() {
            this.$router.push("/")
        }
    }
}
</script>

<style scoped>
    .reg-footer {
        margin-left: 10%;
        width: 80%;
    }
</style>