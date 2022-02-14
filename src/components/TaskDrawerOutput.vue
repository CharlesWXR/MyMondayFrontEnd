<template>
    <div>
        <a-typography-text strong>已选取 {{ selectedOutputs.data.length }} 个输出文件</a-typography-text>
        <a v-for='output in selectedOutputs.data' :key="output.id" @click='getAttachment(output.name)'>
            <div>{{ output.name }}</div>
        </a>
    </div>
    <a-button @click="showModal">
        选取文件作为任务输出
    </a-button>
    <a-modal
        v-model:visible="modalVisible"
        title="Title"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
    >
        <a-table :row-selection="rowSelection" :columns="columns" :data-source="data">
            <template #bodyCell="{ column, text }">
                <template v-if="column.dataIndex === 'name'">
                    <a>{{ text }}</a>
                </template>
            </template>
        </a-table>
    </a-modal>
</template>

<script>
import { reactive, getCurrentInstance, ref } from 'vue'
import { message } from 'ant-design-vue'

const columns = [{
    title: '文件名称',
    dataIndex: 'name',
}, {
    title: '文件版本',
    dataIndex: 'version',
}]

export default {
    name: 'TaskDrawerOutput',
    props: ['taskID'],
    components: {
        
    },
    methods: {
        getAttachment(attachmentName) {
            this.$http.get('/api/attachment', 
            {
                params: {attachment_name: attachmentName}, 
                responseType: 'blob'
            })
            .then(response => {
                let blob = new Blob([response.data], {type: 'application/octet-stream'})
                let objectUrl = URL.createObjectURL(blob)
                var downloadElement = document.createElement("a")
                downloadElement.href = objectUrl
                downloadElement.download = attachmentName
                document.body.appendChild(downloadElement)
                downloadElement.click()
                document.body.removeChild(downloadElement)
                URL.revokeObjectURL(objectUrl)
            })
        }
    },
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

        const modalVisible = ref(false)
        const confirmLoading = ref(false)
        
        const showModal = () => {
            modalVisible.value = true;
        };

        const handleOk = () => {
            confirmLoading.value = true;
            setTimeout(() => {
                modalVisible.value = false;
                confirmLoading.value = false;
            }, 2000);
        };


        const outputState = reactive({
            selectedRowKeys: [],
            loading: false,
        })
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User',
                // Column configuration not to be checked
                name: record.name,
            }),
        };

        return {
            columns,

            selectedOutputs,
            modalVisible,
            confirmLoading,
            showModal,
            handleOk,

            outputState,
            rowSelection,
        }
    }
}
</script>

<style scoped>

</style>