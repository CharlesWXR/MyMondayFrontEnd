<template>
    <div>
        <a-typography-text strong>已选取 {{ selectedOutputs.data.length }} 个输出文件</a-typography-text>
        <a v-for='output in selectedOutputs.data' :key="output.id" @click='getAttachment(output.name)'>
            <div style="margin-top: 5px;">{{ output.name }}</div>
        </a>
    </div>
    <a-button @click="showModal" style="margin-top: 10px;">
        选取文件作为任务输出
    </a-button>
    <a-modal
        v-model:visible="modalVisible"
        :title="'选择输出文件： 已选中' + outputState.selectedRowKeys.length + '项'"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
    >
        <a-table 
            :row-selection="{
                selectedRowKeys: outputState.selectedRowKeys,
                onChange: onSelectChange,
            }"
            :columns="columns" 
            :data-source="outputState.outputs"
            :pagination="false"
            :scroll="{ y: 500 }"
            :row-key="attachment => attachment.id"
        >
            <template #bodyCell="{ column, text, record }">
                <template v-if="column.dataIndex === 'name'">
                    <a @click="getAttachment(record.path.split('/')[1])">{{ text }}</a>
                </template>
                <template v-if="column.dataIndex === 'version'">
                    {{ parseInt(text) + 1 }}
                </template>
            </template>
        </a-table>
    </a-modal>
</template>

<script>
import { reactive, getCurrentInstance, ref } from 'vue'
import { message } from 'ant-design-vue'
import { uniqBy } from 'lodash'

const columns = reactive([{
    title: '文件名称',
    dataIndex: 'name',
    filters: [{
    }],
    onFilter: (value, record) => record.name === value,
}, {
    title: '文件版本',
    dataIndex: 'version',
    sorter: {
        compare: (a,b) => a.version - b.version,
        multiple: 2,
    }
}])

export default {
    name: 'TaskDrawerOutput',
    props: ['taskID'],
    components: {
        
    },
    emits: [],
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
        },
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
        const outputState = reactive({
            selectedRowKeys: [],
            outputs: [],
            loading: false,
        })

        const showModal = () => {
            modalVisible.value = true
            $http.get('/api/attachment/' + props.taskID)
            .then(response => {
                let res = response.data
                if (res.code === 200) {
                    outputState.outputs = res.result
                    outputState.outputs.forEach((output, index, arr) => {
                        if (output.version > 0)
                            arr[index].name = output.name.replace(/-[\d]+(\.[^\.\W]+)$/, '$1')
                    })
                    columns[0].filters = uniqBy(outputState.outputs, 'name').map(item => ({text: item.name, value: item.name}))
                    outputState.selectedRowKeys = selectedOutputs.data.map(item => (item.id))
                }
                else {
                    message.warn("Unexpected error happened!")
                }
            })
        };

        const handleOk = () => {
            confirmLoading.value = true
            let params = {
                task_id: props.taskID,
                attachment_id: outputState.selectedRowKeys,
            }
            $http.put('/api/attachment/output', params)
            .then(response => {
                let res = response.data
                if (res.code === 200) {
                    $http.get('/api/attachment/output', {params: {task_id: props.taskID}})
                    .then (response => {
                        let res = response.data
                        if (res.code === 200) {
                            selectedOutputs.data = res.result
                        }
                        else
                            message.warn("Unexpected error happened")
                    })
                }

                modalVisible.value = false
                confirmLoading.value = false
            })
            .catch(() => {
                modalVisible.value = false
                confirmLoading.value = false
            })
        }

        const onSelectChange = (selectedRowKeys, selectedRows) => {
            outputState.selectedRowKeys = selectedRowKeys
        }

        return {
            columns,

            selectedOutputs,
            modalVisible,
            confirmLoading,
            showModal,
            handleOk,

            outputState,
            
            onSelectChange,
        }
    }
}
</script>

<style scoped>

</style>