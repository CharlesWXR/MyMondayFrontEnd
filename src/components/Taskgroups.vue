<template>
    <a-collapse v-for="(taskgroup, index) in taskgroups" :key="taskgroup.id" v-model:activeKey="activeKey" :bordered="false">
        <a-collapse-panel :key="taskgroup.id">
            <template #header>
                <a-divider style="font-size: 2rem;">{{ taskgroup.description }}</a-divider>
            </template>
            <a-typography-paragraph style="text-align: center;">简介：{{ taskgroup.description }}</a-typography-paragraph>

            <a-table 
                :columns="columns" 
                :data-source="taskgroup.tasks" 
                :row-key="record => record.id" 
                :pagination="false"
                @resizeColumn="handleResizeColumn"
                bordered 
            >
                <template #bodyCell="{ column, text, record }">
                    <!-- 任务状态 -->
                    <template v-if="column.dataIndex === 'state'">
                        <a-dropdown @visibleChange="statusDropdownVisibilityChange(record.id, index)">
                            <a class='ant-dropdown-link' @click.prevent>
                                <a-badge 
                                    :status="taskStatusMap[record.state].status"
                                    :color="taskStatusMap[record.state].color"
                                    :text="taskStatusMap[record.state].text" />
                                <down-outlined />
                            </a>
                            <template #overlay>
                                <a-menu @click="onChangeTaskState">
                                    <a-menu-item v-for="state in changeStatusMap[record.state]" :key="state">
                                        <a>{{ taskStatusMap[state].text }}</a>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </template>
                    <!-- 任务名 -->
                    <template v-else-if="column.dataIndex === 'name'">
                        <div class="editable-cell">
                            <div v-if="editName" class="editable-cell-input-wrapper">
                                <a-input v-model:value="editableData[record.id].name" @pressEnter="save(record.id, index, 'name')" />
                                <check-outlined class="editable-cell-icon-check" @click="save(record.id, index, 'name')" />
                            </div>
                            <div v-else class="editable-cell-text-wrapper">
                                {{ text || ' ' }}
                                <edit-outlined class="editable-cell-icon" @click="edit(record.id, index, 'name')" />
                            </div>
                        </div>
                    </template>
                    <!-- 初始化时间 -->
                    <template v-else-if="column.dataIndex === 'init_time'">
                        <span>{{ formatDate(record.init_time) }}</span>
                    </template>
                    <template v-else-if="column.dataIndex === 'ddl'">
                        <a-date-picker
                            :allow-clear="false"
                            :show-today="false"
                            :inputReadOnly="true"
                            :show-now="false"
                            format='YYYY年MM月DD日 HH:mm:ss'
                            show-time
                            :disabled-date="disabledDate"
                            :placeholder="datePlaceholder(record.ddl)" 
                            @change="onChange"
                            @focus="edit(record.id, index, 'ddl')"
                        />
                    </template>
                    <!-- 任务发起者 -->
                    <template v-else-if="column.dataIndex === 'initiators'">
                        <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
                            <div v-for='(initiator, i) in record.initiators' :key='initiator.id'>
                                <a @click="showUserDrawer(record.id, index, i)">
                                    <a-tooltip :title="initiator.name" placement="top">
                                        <a-avatar v-if='initiator.avatar_path' :scr='initiator.avatar_path' />
                                        <a-avatar v-else style="backgroud-color: #1890ff">
                                            <template #icon><user-outlined /></template>
                                        </a-avatar>
                                    </a-tooltip>
                                </a>
                            </div>
                        </a-avatar-group>
                        <a-drawer
                            title="用户信息"
                            placement="right"
                            :visible="userDrawerVisible"
                            @close="onUserDrawerClose"
                            size="large"
                        >  
                            <div style="justify-content: center; display: flex; padding: 15%; align-items: center;">
                                <a-avatar v-if='selectedInitiator.data.avatar_path' :scr='selectedInitiator.data.avatar_path' :size="180" />  
                                <a-avatar v-else style="backgroud-color: #1890ff" :size="180">
                                    <template #icon><user-outlined /></template>
                                </a-avatar>
                            </div>
                            <a-descriptions bordered>
                                <a-descriptions-item :span='2' label='姓名'>{{ selectedInitiator.data.name }}</a-descriptions-item>
                                <a-descriptions-item :span='2' label='学号/工号'>{{ selectedInitiator.data.staff_id }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='邮箱'>{{  selectedInitiator.data.email }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='QQ'>{{  selectedInitiator.data.qq }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='联系电话'>{{  selectedInitiator.data.phone }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='所在部门'>{{ getDepartmentName(selectedInitiator.data.department_id) }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='职务'>{{  selectedInitiator.data.title }}</a-descriptions-item>
                            </a-descriptions>
                        </a-drawer>
                    </template>
                    <!-- 任务接受者 -->
                    <template v-else-if="column.dataIndex === 'accepters'">
                        <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
                            <div v-for='(initiator, i) in record.initiators' :key='initiator.id'>
                                <a @click="showAccepterDrawer(record.id, index, i)">
                                    <a-tooltip :title="initiator.name" placement="top">
                                        <a-avatar v-if='initiator.avatar_path' :scr='initiator.avatar_path' />
                                        <a-avatar v-else style="backgroud-color: #1890ff">
                                            <template #icon><user-outlined /></template>
                                        </a-avatar>
                                    </a-tooltip>
                                </a>
                            </div>
                        </a-avatar-group>
                        <a-drawer
                            title="用户信息"
                            placement="right"
                            :visible="accpterDrawerVisible"
                            @close="onAccpterDrawerClose"
                            size="large"
                        >  
                            <div style="justify-content: center; display: flex; padding: 15%; align-items: center;">
                                <a-avatar v-if='selectedAccepter.data.avatar_path' :scr='selectedAccepter.data.avatar_path' :size="180" />  
                                <a-avatar v-else style="backgroud-color: #1890ff" :size="180">
                                    <template #icon><user-outlined /></template>
                                </a-avatar>
                            </div>
                            <a-descriptions bordered>
                                <a-descriptions-item :span='2' label='姓名'>{{ selectedAccepter.data.name }}</a-descriptions-item>
                                <a-descriptions-item :span='2' label='学号/工号'>{{ selectedAccepter.data.staff_id }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='邮箱'>{{  selectedAccepter.data.email }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='QQ'>{{  selectedAccepter.data.qq }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='联系电话'>{{  selectedAccepter.data.phone }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='所在部门'>{{ getDepartmentName(selectedAccepter.data.department_id) }}</a-descriptions-item>
                                <a-descriptions-item :span='3' label='职务'>{{  selectedAccepter.data.title }}</a-descriptions-item>
                            </a-descriptions>
                        </a-drawer>
                    </template>
                </template>
            </a-table>
        </a-collapse-panel>
    </a-collapse>
</template>

<script>
    import { ref, getCurrentInstance, reactive, computed } from 'vue'
    import { CheckOutlined, EditOutlined, UserOutlined, DownOutlined } from '@ant-design/icons-vue'
    import { cloneDeep } from 'lodash-es'
    import dayjs from 'dayjs'

    let customParseFormat = require('dayjs/plugin/customParseFormat')
    dayjs.extend(customParseFormat)

    const columns = ref([
    {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        resizable: true,
        width: 100
    }, {
        title: '任务名',
        dataIndex: 'name',
        key: 'name',
        resizable: true,
        width: 150,
    }, {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        ellipsis: true,
        resizable: true,
        width: 200,
    }, {
        title: '发起时间',
        dataIndex: 'init_time',
        key: 'init_time',
        resizable: true,
        width: 150,
    }, {
        title: '发起人',
        dataIndex: 'initiators',
        key: 'initiators',
        resizable: true,
        width: 150
    }, {
        title: '截止时间',
        dataIndex: 'ddl',
        key: 'ddl',
        resizable: true,
        width: 250
    }, {
        title: '优先级',
        dataIndex: 'priority',
        key: 'priority',
        resizable: true,
        width: 100
    }, {
        title: '接受者',
        dataIndex: 'acceptors',
        key: 'acceptors',
        resizable: true,
        width: 150
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
    
    const changeStatusMap = ref([
        [],
        [2],
        [],
        [4, 7],
        [3, 7],
        [6, 7],
        [7],
        [0],
    ])

    export default {
        name: "Taskgroups",
        props: ['taskgroups'],
        components: {
            CheckOutlined,
            EditOutlined,
            UserOutlined,
            DownOutlined,
        },
        methods: {
            formatDate: function(stringDate) {
                let m = dayjs(stringDate, 'YYYY-MM-DD HH:mm:ss')
                if (m.isValid())
                    return m.format("YYYY年MM月D日 HH:mm:ss")
                else
                    return ""
            },
            datePlaceholder: function(stringDate) {
                let m = dayjs(stringDate, 'YYYY-MM-DD HH:mm:ss')
                if (m.isValid())
                    return m.format("YYYY年MM月D日 HH:mm:ss")
                else
                    return "请选择截止日期"
            },
            getDepartmentName: function(departmentID) {
                let res = this.$store.state.departments.filter((item) => item.id == departmentID)[0]
                return res ? res.name : ""
            },
        },
        setup() {
            const { appContext } = getCurrentInstance();

            const activeKey = ref(['1']);
            const editableData = reactive({})

            let selectedTaskID;
            let selectedTaskgroupIndex;
            const editName = reactive(ref(false));
            
            const save = (taskID, taskgroupIndex, colName) => {
                appContext.config.globalProperties.$store.dispatch(
                    'updateTask',
                    {
                        colName: colName,
                        taskgroupIndex: taskgroupIndex,
                        taskID: taskID,
                        data: editableData[taskID]
                    }
                )
                editName = false
                delete editableData[taskID]
            }

            const edit = (taskID, taskgroupIndex, colName) => {
                const taskgroups = appContext.config.globalProperties.$store.state.taskgroups
                const tasks = taskgroups[taskgroupIndex].tasks
                editableData[taskID] = cloneDeep(tasks.filter(item => taskID === item.id)[0]);
                selectedTaskID = taskID
                selectedTaskgroupIndex = taskgroupIndex
                editName = (colName === 'name')
            }

            const handleResizeColumn = (w, column) => {
                column.width = w
            }

            const disabledDate = current => {
                // Can not select days before today and today
                return current && current < dayjs().subtract(24, 'hour').endOf('day');
            };

            const onChange = (value, dateString) => {
                editableData[selectedTaskID].ddl = value.format("YYYY-MM-DD HH:mm:ss")
                save(selectedTaskID, selectedTaskgroupIndex, 'ddl')
            };


            const selectedInitiator = reactive({})
            const userDrawerVisible = reactive(ref(false));

            const showUserDrawer = (taskID, taskgroupIndex, initiatorIndex) => {
                const taskgroups = appContext.config.globalProperties.$store.state.taskgroups
                selectedInitiator["data"] = cloneDeep(((taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]).initiators[initiatorIndex])
                userDrawerVisible.value = true
            };

            const onUserDrawerClose = () => {
                userDrawerVisible.value = false
            }


            const statusDropdownVisibilityChange = (taskID, taskgroupIndex) => {
                selectedTaskID = taskID
                selectedTaskgroupIndex = taskgroupIndex
            }

            const onChangeTaskState = (event) => {
                edit(selectedTaskID, selectedTaskgroupIndex, 'state')
                if (event.key == 7 
                    && (editableData[selectedTaskID].type & 2) == 1 
                    && (editableData[selectedTaskID].state == 3 || editableData[selectedTaskID].state == 4 || editableData[selectedTaskID].state == 6)
                    )
                    editableData[selectedTaskID].state = 5
                else
                    editableData[selectedTaskID].state = event.key
                save(selectedTaskID, selectedTaskgroupIndex, 'state')
            }


            const accepterDrawerVisible = reactive(ref(false))
            const selectedAccepter = reactive({})

            const showAccepterDrawer = (taskID, taskgroupIndex, accepterIndex) => {
                const taskgroups = appContext.config.globalProperties.$store.state.taskgroups
                selectedAccepter["data"] = cloneDeep(((taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]).accepters[accepterIndex])
                accepterDrawerVisible.value = true
            };
             
            const onAccepterDrawerClose = () => {
                accepterDrawerVisible.value = false
            }


            return {
                activeKey,
                columns,
                editableData,
                editName,
                save,
                edit,
                handleResizeColumn,
                disabledDate,
                onChange,
                taskStatusMap,
                statusDropdownVisibilityChange,
                changeStatusMap,
                onChangeTaskState,
                
                userDrawerVisible,
                selectedInitiator,
                showUserDrawer,
                onUserDrawerClose,

                accepterDrawerVisible,
                selectedAccepter,
                showAccepterDrawer,
                onAccepterDrawerClose,
            }
        }
    }
</script>

<style scoped lang="less">
    .editable-cell {
        position: relative;
        .editable-cell-input-wrapper,
        .editable-cell-text-wrapper {
            padding-right: 24px;
        }

        .editable-cell-text-wrapper {
            padding: 5px 24px 5px 5px;
        }

        .editable-cell-icon,
        .editable-cell-icon-check {
            position: absolute;
            right: 0;
            width: 20px;
            cursor: pointer;
        }

        .editable-cell-icon {
            margin-top: 4px;
            display: none;
        }

        .editable-cell-icon-check {
            line-height: 28px;
        }

        .editable-cell-icon:hover,
        .editable-cell-icon-check:hover {
            color: #108ee9;
        }

        .editable-add-btn {
            margin-bottom: 8px;
        }
    }

    .editable-cell:hover .editable-cell-icon {
        display: inline-block;
    }
</style>