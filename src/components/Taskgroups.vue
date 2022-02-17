<template>
    <a-collapse v-for="(taskgroup, index) in taskgroups" :key="taskgroup.id" v-model:activeKey="activeKey" :bordered="false">
        <a-collapse-panel :key="taskgroup.id">
            <template #header>
                <a-divider>
                    <a-typography-title :level="3" class="editable-cell">
                        <div v-if="editableTaskgroupNames && editableTaskgroupNames[taskgroup.id]" class="editable-cell-input-wrapper">
                            <a-input v-model:value="editableTaskgroupNames[taskgroup.id]" @pressEnter="saveTaskgroupName(taskgroup.id)" />
                            <check-outlined class="editable-cell-icon-check" @click="saveTaskgroupName(taskgroup.id)" />
                        </div>
                        <div v-else class="editable-cell-text-wrapper">
                            {{ taskgroup.name || ' ' }}
                            <edit-outlined class="editable-cell-icon" @click="editTaskgroupName(taskgroup.id, taskgroup.name)" />
                        </div>
                    </a-typography-title>
                </a-divider>
                
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
                            <div v-if="editName && editableData[record.id]" class="editable-cell-input-wrapper">
                                <a-input v-model:value="editableData[record.id].name" @pressEnter="save(record.id, index, 'name')" />
                                <check-outlined class="editable-cell-icon-check" @click="save(record.id, index, 'name')" />
                            </div>
                            <div v-else class="editable-cell-text-wrapper">
                                <a @click='showTaskDetailDrawer(record.id, index)'>
                                    {{ text || ' ' }}
                                </a>
                                <edit-outlined class="editable-cell-icon" @click="edit(record.id, index, 'name')" />
                            </div>
                        </div>
                    </template>
                    <!-- 初始化时间 -->
                    <template v-else-if="column.dataIndex === 'init_time'">
                        <span>{{ formatDate(record.init_time) }}</span>
                    </template>
                    <!-- 截止日期 -->
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
                             <a-tooltip title="添加用户" placement="top">
                                 <a @click="showAddInitiatorDrawer(record.id, index)">
                                    <a-avatar style="background-color: #1890ff">
                                        <template #icon><plus-outlined /></template>
                                    </a-avatar>
                                 </a>
                            </a-tooltip>
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
                        <!-- 添加任务发起人drawer -->
                        <a-drawer
                            title="添加任务发起人"
                            placement="right"
                            :visible="addInitDrawerVisible"
                            @close="onAddinitiatorDrawerClose"
                            size="large"
                            :key="record.id"
                        >
                            <template #extra>
                                <a-button type='primary' style="margin-right: 10px" @click="onAddinitiatorDrawerSave(record.id)">保存修改</a-button>
                                <a-button @click="onAddinitiatorDrawerClose">放弃修改</a-button>
                            </template>
                            <a-select
                                v-model:value="initiatorValue"
                                mode="multiple"
                                label-in-value
                                placeholder="选择需要添加的用户"
                                style="width: 100%"
                                :filter-option="false"
                                :not-found-content="initiatorFetching ? undefined : null"
                                :options="initiatorData"
                                @search="fetchAccepters"
                            >
                                <template v-if="initiatorFetching" #notFoundContent>
                                    <a-spin size="small" />
                                </template>
                            </a-select>
                        </a-drawer>
                    </template>
                    <!-- 优先级 -->
                    <template v-else-if="column.dataIndex === 'priority'">
                        <a-dropdown  @visibleChange="statusDropdownVisibilityChange(record.id, index)">
                            <a class="ant-dropdown-link" @click.prevent>
                                <a-tag :color="taskPriorityMap[record.priority].color">{{ taskPriorityMap[record.priority].msg }}</a-tag>
                            </a>
                            <template #overlay>
                                <a-menu @click="onChangePriority">
                                    <!--a-menu-item v-for="(priority, index) in taskPriorityMap" :key="index">
                                        <a-tag :color="priority.color">{{ priority.msg }}</a-tag>
                                    </a-menu-item -->
                                    <!-- 循环展开提高渲染效率 -->
                                    <a-menu-item :key="0">
                                        <a-tag color="cyan">个人事务</a-tag>
                                    </a-menu-item>
                                    <a-menu-item :key="1">
                                        <a-tag color="blue">班级事务</a-tag>
                                    </a-menu-item>
                                    <a-menu-item :key="2">
                                        <a-tag color="orange">学生会事务</a-tag>
                                    </a-menu-item>
                                    <a-menu-item :key="3">
                                        <a-tag color="pink">年级事务</a-tag>
                                    </a-menu-item>
                                    <a-menu-item :key="4">
                                        <a-tag color="green">学院事务</a-tag>
                                    </a-menu-item>
                                    <a-menu-item :key="5">
                                        <a-tag color="purple">校级事务</a-tag>
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                    </template>
                    <!-- 任务接受者 -->
                    <template v-else-if="column.dataIndex === 'accepters'">
                        <a-avatar-group :max-count="2" :max-style="{ color: '#f56a00', backgroundColor: '#fde3cf' }">
                            <a-tooltip title="添加用户" placement="top">
                                 <a @click="showAddAccepterDrawer(record.id, index)">
                                    <a-avatar style="background-color: #1890ff">
                                        <template #icon><plus-outlined /></template>
                                    </a-avatar>
                                 </a>
                            </a-tooltip>
                            <div v-for='(accepter, i) in record.accepters' :key='accepter.id'>
                                <a @click="showAccepterDrawer(record.id, index, i)">
                                    <a-tooltip :title="accepter.name" placement="top">
                                        <a-avatar v-if='accepter.avatar_path' :scr='accepter.avatar_path' />
                                        <a-avatar v-else style="backgroud-color: #1890ff">
                                            <template #icon><user-outlined /></template>
                                        </a-avatar>
                                    </a-tooltip>
                                </a>
                            </div>
                        </a-avatar-group>         
                    </template>
                </template>
            </a-table>
            <a-button type='primary' @click="createNewTask(taskgroup.id)">创建新任务</a-button>
            <!-- 添加任务发起人drawer -->
            <a-drawer
                title="添加任务接受者"
                placement="right"
                :visible="addAccepterDrawerVisible"
                @close="onAddAccepterDrawerClose"
                size="large"
            >
                <template #extra>
                    <a-button type='primary' style="margin-right: 10px" @click="onAddAccepterDrawerSave">保存修改</a-button>
                    <a-button @click="onAddAccepterDrawerClose">放弃修改</a-button>
                </template>
                <a-select
                    v-model:value="accepterValue"
                    mode="multiple"
                    label-in-value
                    placeholder="选择需要添加的用户"
                    style="width: 100%"
                    :filter-option="false"
                    :not-found-content="accepterFetching ? undefined : null"
                    :options="accepterData"
                    @search="fetchAccepters"
                >
                    <template v-if="accepterFetching" #notFoundContent>
                        <a-spin size="small" />
                    </template>
                </a-select>                  
            </a-drawer>
            <!-- 任务详细信息drawer -->
            <a-drawer
                title="任务详细信息"
                placement="right"
                :visible="detailDrawerVisibility"
                @close="onDetailDrawerClose"
                size="large"
                :key="selectedTaskID"
            >
                <a-typography-title :level='2'>{{ editableData[selectedTaskID].name }}</a-typography-title>
                <div class="editable-cell">
                    <div v-if="editDes" class="editable-cell-input-wrapper">
                        <a-input v-model:value="editableData[selectedTaskID].description" @pressEnter="saveDescription" />
                        <check-outlined class="editable-cell-icon-check" @click="saveDescription" />
                    </div>
                    <div v-else class="editable-cell-text-wrapper">
                        {{ editableData[selectedTaskID].description || ' ' }}
                        <edit-outlined class="editable-cell-icon" @click="editDescription" />
                    </div>
                </div>
                <a-divider />
                <task-drawer :task="editableData[selectedTaskID]"/>
            </a-drawer>
            <!-- 接受者用户信息drawer -->
            <a-drawer
                title="用户信息"
                placement="right"
                :visible="accepterDrawerVisible"
                @close="onAccepterDrawerClose"
                size="large"
            >  
                <div style="justify-content: center; display: flex; padding: 15%; align-items: center;">
                    <a-avatar v-if='selectedUser.data.avatar_path' :scr='selectedUser.data.avatar_path' :size="180" />  
                    <a-avatar v-else style="backgroud-color: #1890ff" :size="180">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                </div>
                <a-descriptions bordered>
                    <a-descriptions-item :span='2' label='姓名'>{{ selectedUser.data.name }}</a-descriptions-item>
                    <a-descriptions-item :span='2' label='学号/工号'>{{ selectedUser.data.staff_id }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='邮箱'>{{  selectedUser.data.email }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='QQ'>{{  selectedUser.data.qq }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='联系电话'>{{  selectedUser.data.phone }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='所在部门'>{{ getDepartmentName(selectedUser.data.department_id) }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='职务'>{{  selectedUser.data.title }}</a-descriptions-item>
                </a-descriptions>
            </a-drawer>
            <!-- 任务发起人用户信息drawer -->
            <a-drawer
                title="用户信息"
                placement="right"
                :visible="userDrawerVisible"
                @close="onUserDrawerClose"
                size="large"
            >  
                <div style="justify-content: center; display: flex; padding: 15%; align-items: center;">
                    <a-avatar v-if='selectedUser.data.avatar_path' :scr='selectedUser.data.avatar_path' :size="180" />  
                    <a-avatar v-else style="backgroud-color: #1890ff" :size="180">
                        <template #icon><user-outlined /></template>
                    </a-avatar>
                </div>
                <a-descriptions bordered>
                    <a-descriptions-item :span='2' label='姓名'>{{ selectedUser.data.name }}</a-descriptions-item>
                    <a-descriptions-item :span='2' label='学号/工号'>{{ selectedUser.data.staff_id }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='邮箱'>{{  selectedUser.data.email }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='QQ'>{{  selectedUser.data.qq }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='联系电话'>{{  selectedUser.data.phone }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='所在部门'>{{ getDepartmentName(selectedUser.data.department_id) }}</a-descriptions-item>
                    <a-descriptions-item :span='3' label='职务'>{{  selectedUser.data.title }}</a-descriptions-item>
                </a-descriptions>
            </a-drawer>
        </a-collapse-panel>
    </a-collapse>
</template>

<script>
    import { ref, getCurrentInstance, reactive, toRefs, watch } from 'vue'
    import { CheckOutlined, EditOutlined, UserOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons-vue'
    import { message } from 'ant-design-vue'
    import { cloneDeep, debounce } from 'lodash-es'
    import qs from 'qs'
    import dayjs from 'dayjs'
    import TaskDrawer from "@/components/TaskDrawer.vue"

    let customParseFormat = require('dayjs/plugin/customParseFormat')
    dayjs.extend(customParseFormat)

    const columns = ref([
    {
        title: '状态',
        dataIndex: 'state',
        key: 'state',
        resizable: true,
        width: 130
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
        dataIndex: 'accepters',
        key: 'accepters',
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

    const taskPriorityMap = ref([
        {
            msg: '个人事务',
            color: 'cyan',
        }, {
            msg: '班级事务',
            color: 'blue',
        }, {
            msg: '学生会事务',
            color: 'orange',
        }, {
            msg: '年级事务',
            color: 'pink',
        }, {
            msg: '学院事务',
            color: 'green',
        }, {
            msg: '校级事务',
            color: 'purple',
        }
    ])
    
    export default {
        name: "Taskgroups",
        props: ['taskgroups'],
        components: {
            CheckOutlined,
            EditOutlined,
            UserOutlined,
            DownOutlined,
            PlusOutlined,
            TaskDrawer,
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
        setup(props) {
            const { appContext } = getCurrentInstance();
            const $store = appContext.config.globalProperties.$store
            const $http = appContext.config.globalProperties.$http

            const activeKey = ref(['1']);
            const editableData = reactive({})

            const selectedTaskID = ref(1);
            let selectedTaskgroupIndex;
            const editName = reactive(ref(false));
            
            const save = (taskID, taskgroupIndex, colName) => {
                $store.dispatch(
                    'updateTask',
                    {
                        taskID: taskID,
                        colName: colName,
                        data: editableData[taskID][colName],
                    }
                )
                editName.value = false
                delete editableData[taskID]
            }

            const edit = (taskID, taskgroupIndex, colName) => {
                const taskgroups = $store.state.taskgroups
                const tasks = taskgroups[taskgroupIndex].tasks
                editableData[taskID] = cloneDeep(tasks.filter(item => taskID === item.id)[0]);
                selectedTaskID.value = taskID
                selectedTaskgroupIndex = taskgroupIndex
                editName.value = (colName === 'name')
            }

            const handleResizeColumn = (w, column) => {
                column.width = w
            }

            const disabledDate = current => {
                // Can not select days before today and today
                return current && current < dayjs().subtract(24, 'hour').endOf('day');
            };

            const onChange = (value, dateString) => {
                editableData[selectedTaskID.value].ddl = value.format("YYYY-MM-DD HH:mm:ss")
                save(selectedTaskID.value, selectedTaskgroupIndex, 'ddl')
            };


            const userDrawerVisible = reactive(ref(false));

            const showUserDrawer = (taskID, taskgroupIndex, initiatorIndex) => {
                const taskgroups = $store.state.taskgroups
                selectedUser["data"] = cloneDeep(((taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]).initiators[initiatorIndex])
                userDrawerVisible.value = true
            };

            const onUserDrawerClose = () => {
                userDrawerVisible.value = false
            }


            const statusDropdownVisibilityChange = (taskID, taskgroupIndex) => {
                selectedTaskID.value = taskID
                selectedTaskgroupIndex = taskgroupIndex
            }

            const onChangeTaskState = (event) => {
                edit(selectedTaskID.value, selectedTaskgroupIndex, 'state')
                console.log(event.key, editableData[selectedTaskID.value].type & 2)
                if (event.key == 7 
                    && (editableData[selectedTaskID.value].type & 2) == 2 
                    && (editableData[selectedTaskID.value].state == 3 || editableData[selectedTaskID.value].state == 4 || editableData[selectedTaskID.value].state == 6)
                    )
                    editableData[selectedTaskID.value].state = 5
                else
                    editableData[selectedTaskID.value].state = event.key
                save(selectedTaskID.value, selectedTaskgroupIndex, 'state')
            }


            const accepterDrawerVisible = reactive(ref(false))
            const selectedUser = reactive({})
            const showAccepterDrawer = (taskID, taskgroupIndex, accepterIndex) => {
                const taskgroups = $store.state.taskgroups
                selectedTaskID.value = taskID
                selectedUser["data"] = cloneDeep(((taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]).accepters[accepterIndex])
                accepterDrawerVisible.value = true
            };
             
            const onAccepterDrawerClose = () => {
                accepterDrawerVisible.value = false
            }


            const addInitDrawerVisible = reactive(ref(false))
            const initiatorAdderState = reactive({
                initiatorData: [],
                initiatorValue: [],
                initiatorFetching: false,
            })
            const showAddInitiatorDrawer = (taskID, taskgroupIndex) => {
                const taskgroups = $store.state.taskgroups
                initiatorAdderState.initiatorData = cloneDeep(((taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]).initiators)
                    .map(user => ({
                        label: `${ user.name }`,
                        value: user.id,
                    }))
                initiatorAdderState.initiatorValue = cloneDeep(initiatorAdderState.initiatorData)
                addInitDrawerVisible.value = true
            }

            const onAddinitiatorDrawerClose = () => {
                addInitDrawerVisible.value = false
            }

            const onAddinitiatorDrawerSave = (taskID) => {
                let params = {
                    task_id: taskID,
                    initiators: initiatorAdderState.initiatorValue.map(user => (user.value))
                }
                $http.put("/api/task/initiator", params)
                .then(response => {
                    let res = response.data
                    if (res.code !== 200)
                        message.warning("Fail to update initiators")
                    else {
                        message.info("Update successed")
                        let playload = {
                            workspace_id: $store.state.selectedWorkspaceID[0]
                        }
                        $store.dispatch({
                            type:'refreshTaskgroups', 
                            params: playload
                        })
                    }
                })
                .catch(() => {
                    message.error("Fail to update initiators")
                })

                addInitDrawerVisible.value = false
            }

        
            const addAccepterDrawerVisible = reactive(ref(false))
            const accepterAdderState = reactive({
                accepterData: [],
                accepterValue: [],
                accepterFetching: false,
            })
            const selectedTaskState = ref(0)
            const showAddAccepterDrawer = (taskID, taskgroupIndex) => {
                selectedTaskID.value = taskID
                const taskgroups = $store.state.taskgroups
                let task = (taskgroups[taskgroupIndex].tasks).filter(item => taskID === item.id)[0]
                accepterAdderState.accepterData = cloneDeep(task.accepters.map(user => ({
                        label: `${ user.name }`,
                        value: user.id,
                    })
                ))
                selectedTaskState.value = task.state
                accepterAdderState.accepterValue = cloneDeep(accepterAdderState.accepterData)
                addAccepterDrawerVisible.value = true
            }
            const onAddAccepterDrawerClose = () => {
                addAccepterDrawerVisible.value = false
            }
            const onAddAccepterDrawerSave = () => {
                let params = {
                    task_id: selectedTaskID.value,
                    accepters: accepterAdderState.accepterValue.map(user => (user.value))
                }
                $http.put("/api/task/accepter", params)
                .then(response => {
                    let res = response.data
                    if (res.code !== 200)
                        message.warning("Fail to update initiators")
                    else {
                        message.info("Update successed")
                        let playload = {
                            workspace_id: $store.state.selectedWorkspaceID[0]
                        }
                        if (params.accepters.length > 0 && selectedTaskState.value === 2) {
                            $store.dispatch(
                                'updateTask',
                                {
                                    taskID: selectedTaskID.value,
                                    colName: 'state',
                                    data: 3,
                                }
                            )
                        }
                        else if (params.accepters.length == 0) {
                            $store.dispatch(
                                'updateTask',
                                {
                                    taskID: selectedTaskID.value,
                                    colName: 'state',
                                    data: 2,
                                }
                            )
                        }
                            
                        $store.dispatch({
                            type:'refreshTaskgroups', 
                            params: playload
                        })
                    }
                })
                .catch(() => {
                    message.error("Fail to update initiators")
                })

                addAccepterDrawerVisible.value = false
            }


            let lastFetchContent = "";
            const fetchAccepters = debounce((value) => {
                value = value.trim()
                if (value !== lastFetchContent && value !== '') {
                    lastFetchContent = value
                    initiatorAdderState.initiatorData = []
                    accepterAdderState.accepterData= []
                    initiatorAdderState.initiatorFetching = true
                    accepterAdderState.accepterFetching = true
                    $http.get("/api/user", { params: { identity: value } })
                    .then(response => {
                        let res = response.data
                        if (res.result) {
                            initiatorAdderState.initiatorData = res.result.map(user => ({
                                label: `${ user.name }`,
                                value: user.id,
                            }))
                            accepterAdderState.accepterData = cloneDeep(initiatorAdderState.initiatorData)
                        }
                        initiatorAdderState.initiatorFetching = false
                        accepterAdderState.accepterFetching = false
                    })
                }
            }, 300)


            const onChangePriority = ({key}) => {
                $store.dispatch(
                    'updateTask',
                    {
                        taskID: selectedTaskID.value,
                        colName: 'priority',
                        data: key,
                    }
                )
            }


            const detailDrawerVisibility = reactive(ref(false))
            const showTaskDetailDrawer = (taskID, taskgroupIndex) => {
                edit(taskID, taskgroupIndex, "Detail")
                detailDrawerVisibility.value = true
            }

            const onDetailDrawerClose = () => {            
                detailDrawerVisibility.value = false
            }

            const editDes = reactive(ref(false))
            const editDescription = () => {
                editDes.value = true
            }

            const saveDescription = () => {
                $store.dispatch(
                    'updateTask',
                    {
                        taskID: selectedTaskID.value,
                        colName: 'description',
                        data: editableData[selectedTaskID.value].description,
                    }
                )
                editDes.value = false
            }

            const createNewTask = (taskgroupID) => {
                updateUser()
                let params = {
                    name: '新任务',
                    type: 0,
                    state: 2,
                    taskgroup_id: taskgroupID,
                    task_initiators: [$store.state.user.id],
                }

                $http.post('/api/task', params)
                .then(response => {
                    let res = response.data
                    if (res.code === 200) {
                        let playload = {
                            workspace_id: $store.state.selectedWorkspaceID[0]
                        }
                        $store.dispatch({
                            type:'refreshTaskgroups', 
                            params: playload
                        })
                    }
                    else
                        message.warn("Unexpected error happened")
                })
            }

            const updateUser = () => {
                if ($store.state.user === null) {
                    if (sessionStorage.getItem('user') !== null) {
                        $store.commit({
                            type: 'setUser',
                            user: JSON.parse(sessionStorage.getItem('user'))
                        })
                    }
                    else {
                        message.warn("登录超时！")
                        setTimeout(() => {
                            $router.push("/")
                        }, 1000)
                    }
                }
            }

            const editableTaskgroupNames = reactive({})

            const editTaskgroupName = (taskgroupID, taskgroupName) => {
                editableTaskgroupNames[taskgroupID] = taskgroupName
            }
            const saveTaskgroupName = (taskgroupID) => {
                $http.put("/api/taskgroup/" + taskgroupID, 
                qs.stringify({attr: "name", new_val: editableTaskgroupNames[taskgroupID]}))
                .then(response => {
                    let res = response.data
                    if (res.code === 200) {
                        let playload = {
                            workspace_id: $store.state.selectedWorkspaceID[0]
                        }
                        $store.dispatch({
                            type:'refreshTaskgroups', 
                            params: playload
                        })
                    }
                })
                delete editableTaskgroupNames[taskgroupID]
            }
                        

            return {
                activeKey,
                columns,
                taskPriorityMap,

                editableData,
                editName,
                selectedTaskID,

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
                showUserDrawer,
                onUserDrawerClose,

                accepterDrawerVisible,
                selectedUser,
                showAccepterDrawer,
                onAccepterDrawerClose,

                addInitDrawerVisible,
                showAddInitiatorDrawer,
                onAddinitiatorDrawerClose,
                onAddinitiatorDrawerSave,
                fetchAccepters,
                ...toRefs(initiatorAdderState),

                addAccepterDrawerVisible,
                showAddAccepterDrawer,
                onAddAccepterDrawerClose,
                onAddAccepterDrawerSave,
                ...toRefs(accepterAdderState),

                onChangePriority,

                detailDrawerVisibility,
                showTaskDetailDrawer,
                onDetailDrawerClose,

                editDes,
                editDescription,
                saveDescription,

                createNewTask,
                updateUser,

                editableTaskgroupNames,
                editTaskgroupName,
                saveTaskgroupName,
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