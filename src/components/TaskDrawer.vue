<template>
    <a-tabs v-model:activeKey="activeKey" @change="tabChange">
        <a-tab-pane :key='1' tab='更新记录'>
            <task-drawer-updates :taskID="task.id"></task-drawer-updates>
        </a-tab-pane>
        <a-tab-pane :key='outputTabKey' tab='输出文件'>
            <task-drawer-output :taskID="task.id"></task-drawer-output>
        </a-tab-pane>
        <a-tab-pane :key='3' tab='任务设置'>
            <task-drawer-setting :task="task"></task-drawer-setting>
        </a-tab-pane>
    </a-tabs>
</template>

<script>
import TaskDrawerUpdates from "./TaskDrawerUpdates.vue"
import TaskDrawerOutput from "./TaskDrawerOutput.vue"
import TaskDrawerSetting from "./TaskDrawerSetting.vue"

export default {
    name: 'TaskDrawer',
    components: {
        TaskDrawerUpdates,
        TaskDrawerOutput,
        TaskDrawerSetting,
    },
    props: ['task'],
    data() {
        return {
            activeKey: 1,
            outputTabKey: 0,
        }
    },
    methods: {
        tabChange: function() {
            if (this.activeKey <= 0) {
                this.outputTabKey--
                this.activeKey = this.outputTabKey
            }
        }
    }
}
</script>

<style scoped>

</style>