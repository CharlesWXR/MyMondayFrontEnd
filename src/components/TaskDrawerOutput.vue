<template>
<div>
    <a-typography-text strong>已选取 {{ selectedOutputs.data.length }} 个输出文件</a-typography-text>
    <a v-for='output in selectedOutputs.data' :key="output.id">
        <div>{{ output.name }}</div>
    </a>
</div>
    <a-button>
        选取文件作为任务输出
    </a-button>
</template>

<script>
import { reactive, getCurrentInstance } from 'vue'
import { message } from 'ant-design-vue'

export default {
    name: 'TaskDrawerOutput',
    props: ['taskID'],
    setup(props) {
        const { appContext } = getCurrentInstance();
        const $store = appContext.config.globalProperties.$store
        const $http = appContext.config.globalProperties.$http
        const $router = appContext.config.globalProperties.$router

        const selectedOutputs = reactive ({
            data: []
        })

        $http.get('/api/attachment/output', {params: {task_id: props.taskID}})
        .then (response => {
            let res = response.data
            if (res.code === 200) {
                selectedOutputs.data = res.result
            }
            else
                message.warn("Unexpected error happened")
        })
        
        return {
            selectedOutputs,
        }
    }
}
</script>

<style scoped>

</style>