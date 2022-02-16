<template>
    <div>
        <a-typography-title :level='5'>任务类型</a-typography-title>
        <a-checkbox-group v-model:value="typeValue" name="taskTypeCheckboxes" :options="typeOptions" @change="changeType" />
    </div>
    <div v-if="showDependencySetter">
        <a-divider />
        <a-typography-title :level='5'>设置前置任务</a-typography-title>
        <div>
            <strong>已添加的前置任务：</strong>
            <div v-for="task in dependencies" :key="task.id" style='margin-top: 5px;'>
                <strong>{{ task.name }}（
                    <a-badge 
                        :status="taskStatusMap[task.state].status"
                        :color="taskStatusMap[task.state].color"
                        :text="taskStatusMap[task.state].text" 
                    />
                ）:</strong>
                <span>{{ task.description }}</span>
                <div>截止时间：{{ task.ddl }}</div>
            </div>
        </div>
        <div style='margin-top: 10px;'>
            <a-button type='primary' @click="showModal">选取前置任务</a-button>
        </div>
    </div>
    <a-modal
        v-model:visible="modalVisible"
        :title="'选择前置任务： 已选中' + selectedRowKeys.length + '项'"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
    >
        <a-table 
            :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: onSelectChange,
            }"
            :columns="columns" 
            :data-source="tasks"
            :pagination="false"
            :scroll="{ y: 500 }"
            :row-key="task => task.id"
        >
            
        </a-table>
    </a-modal>
</template>

<script>
import { ref, reactive, getCurrentInstance, toRefs } from "vue"
import { message } from 'ant-design-vue'
import { indexOf } from 'lodash'
import dayjs from 'dayjs'

const typeOptions = [{
    label: '需要输出文件',
    value: '1',
}, {
    label: '需要审核',
    value: '2',
}, {
    label: '存在前置任务',
    value: '4',
}]

const columns = reactive([{
    title: '部门',
    dataIndex: 'department',
    filters: [{
        text: '新媒体创意中心',
        value: '新媒体创意中心',
    }, {
        text: '班团中心',
        value: '班团中心',
    }, {
        text: '办公室',
        value: '办公室',
    }, {
        text: '暖风志协',
        value: '暖风志协',
    }, {
        text: '心海社',
        value: '心海社',
    }, {
        text: '学业发展中心',
        value: '学业发展中心',
    }, {
        text: '文化中心',
        value: '文化中心',
    }],
    onFilter: (value, record) => record.department === value,
}, {
    title: '工作区',
    dataIndex: 'workspace',
}, {
    title: '任务名称',
    dataIndex: 'name',
}, {
    title: '任务发起时间',
    dataIndex: 'init_time',
    sorter: {
        compare: (a, b) => {
            return a < b ? -1 : 1
        }
    }
}])

const taskStatusMap = ref([
        {
            status: 'default',
            color: 'gray',
            text: '已归档',
        },
        {
            status: 'default',
            color: '#2db7f5',
            text: '已初始化',
        },
        {
            status: 'warning',
            color: 'gold',
            text: '未分配',
        },
        {
            status: 'processing',
            color: 'purple',
            text: '挂起中',
        },
        {
            status: 'processing',
            color: 'blue',
            text: '处理中',
        },
        {
            status: 'default',
            color: 'magenta',
            text: '等待审核',
        }, 
        {
            status: 'processing',
            color: 'purple',
            text: '审核退回',
        },
        {
            status: 'success',
            color: '',
            text: '已完成',
        }
    ])
    
export default {
    name: "TaskDrawerSetting",
    props: ['task'],
    computed: {
        showDependencySetter () {
            return indexOf(this.typeValue, "4") != -1
        }
    },
    setup(props) {
        const { appContext } = getCurrentInstance();
        const $store = appContext.config.globalProperties.$store
        const $http = appContext.config.globalProperties.$http

        const typeValue = ref([])

        for (let i = 1; i <= props.task.type; i *= 2) {
            if ((i & props.task.type) != 0)
                typeValue.value.push(i.toString())
        }

        const changeType = () => {
            let count = 0
            typeValue.value.forEach(item => {
                count += parseInt(item)
            })
            let params = {
                task_id: props.task.id,
                attr: 'type',
                new_val: count
            }
            $http.put('/api/task/', params)
            .then (response => {
                let res = response.data
                if (res.code === 200) {
                    message.info("更新成功")
                    let playload = {
                        workspace_id: $store.state.selectedWorkspaceID[0]
                    }
                    $store.dispatch({
                        type:'refreshTaskgroups', 
                        params: playload
                    })
                }
                else
                    message.error(`Unexpected error happened: ${res.msg}`)
            })
        }

        const dependencies = ref([])
        $http.get('/api/dependency/' + props.task.id)
        .then(response => {
            let res = response.data
            if (res.code === 200)
                dependencies.value = res.result
            else
                message.warn("Unexpected error happened")
        })


        const modalVisible = ref(false)
        const confirmLoading = ref(false)
        const dependencyState = reactive({
            selectedRowKeys: [],
            tasks: [],
            loading: false,
        })

        const showModal = () => {
            modalVisible.value = true
            $http.get('api/task')
            .then(response => {
                let res = response.data
                if (res.code === 200) {
                    let departments = $store.state.departments
                    dependencyState.tasks = res.result
                    dependencyState.tasks.forEach((task, index, arr) => {
                        $http.get('/api/taskgroup/workspace', {params: {taskgroup_id: task.taskgroup_id}})
                        .then(response => {
                            let r= response.data
                            let found = false
                            for (let i = 0; i < departments.length && !found; i++) {
                                for (let j = 0; j < departments[i].workspaces.length; j++) {
                                    if (departments[i].workspaces[j].id === r.result) {
                                        arr[index]["workspace"] = departments[i].workspaces[j].name
                                        arr[index]["department"] = departments[i].name
                                        found = true
                                    }
                                }
                            }
                            dependencyState.selectedRowKeys = dependencies.value.map(item => item.id)
                        })
                    })
                }
                else {
                    message.warn("Unexpected error happened!")
                }
            })
        };

        const handleOk = () => {
            confirmLoading.value = true
            let params = {
                task_id: props.task.id,
                dependency_id: dependencyState.selectedRowKeys,
            }
            $http.put('/api/dependency', params)
            .then(response => {
                let res = response.data
                if (res.code === 200) {
                    $http.get('/api/dependency/' + props.task.id)
                    .then (response => {
                        let res = response.data
                        if (res.code === 200) {
                            message.info("Success!")
                            dependencies.value = res.result
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
            dependencyState.selectedRowKeys = selectedRowKeys
        }

        return {
            indexOf,
            dayjs,

            typeOptions,

            typeValue,
            changeType,

            dependencies,

            columns,
            ...toRefs(dependencyState),
            modalVisible,
            confirmLoading,
            showModal,
            handleOk,
            onSelectChange,

            taskStatusMap,
        }
    }
}
</script>

<style>

</style>