<template>
    <a-button type='dashed' style='height: 50px' @click="createNewTaskgroup">
        <plus-outlined />
    </a-button>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import qs from 'qs'
import { message } from 'ant-design-vue'

export default {
    name: 'CreateTaskgroupButton',
    components: {
        PlusOutlined,
    },
    methods: {
        createNewTaskgroup: function() {
            let params = {
                taskgroup_name: "新工作组",
                workspace_id: this.$store.state.selectedWorkspaceID[0],
            }
            this.$http.put('/api/taskgroup', qs.stringify(params))
            .then(response => {
                let res = response.data
                if (res.code == 200) {
                    let playload = {
                        workspace_id: this.$store.state.selectedWorkspaceID[0]
                    }
                    this.$store.dispatch({
                        type:'refreshTaskgroups', 
                        params: playload
                    })
                }
                else
                    message.warn("Unexpected error happened")
            })
        }
    }
}
</script>

<style>

</style>