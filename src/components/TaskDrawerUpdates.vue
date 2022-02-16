<template>
    <a-comment>
        <template #avatar>
            <a-avatar v-if='user && user.avatar_path' :scr='user.avatar_path' />
            <a-avatar v-else style="backgroud-color: #1890ff">
                <template #icon><user-outlined /></template>
            </a-avatar>
        </template>
        <template #content>
        <a-form-item>
            <a-textarea v-model:value="value" :rows="4" />
        </a-form-item>
        <a-form-item>
            <a-upload :file-list="fileList" :remove="handleRemove" :before-upload="beforeUpload">
                <a-button>
                    <upload-outlined></upload-outlined>
                    选择附件
                </a-button>
            </a-upload>
        </a-form-item>
        <a-form-item>
            <a-button html-type="submit" :loading="submitting" type="primary" @click="formUpload">
                发布更新
            </a-button>
        </a-form-item>
        </template>
    </a-comment>
    <a-list
        class='comment-list'
        :header='`${updates.data.length} 条更新记录`'
        item-layout='horizontal'
        :data-source='updates.data'
    >
        <template #renderItem="{ item }">
            <a-list-item>
                <a-comment :author="item.user.name">
                    <template #avatar>
                        <a-avatar v-if='item.user.avatar_path' :scr='item.user.avatar_path' />
                        <a-avatar v-else style="backgroud-color: #1890ff">
                            <template #icon><user-outlined /></template>
                        </a-avatar>
                    </template>
                    <template #actions>
                        <span key='comment-basic-reply-to'>回复</span>
                    </template>
                    <template #content>
                        <p>
                            {{ item.content }}
                        </p>
                        <div v-if='item.attachments && item.attachments.length > 0'>
                            <a-divider />
                            <strong>附件：</strong>
                            <div v-for="attachment in item.attachments" :key="attachment.id">
                                <a @click='getAttachment(attachment.name)'>
                                    {{ attachment.name }}
                                </a>
                            </div>
                        </div>
                    </template>
                    <template #datetime>
                        <a-tooltip :title="item.time">
                            <span>{{ dayjs(item.time, "YYYY-MM-DD HH:mm:ss").fromNow() }}</span>
                        </a-tooltip>
                    </template>
                    <a-comment v-for='reply in item.replies' :key='reply.id' :author="reply.user.name">
                        <template #avatar>
                            <a-avatar v-if='reply.user.avatar_path' :scr='reply.user.avatar_path' />
                            <a-avatar v-else style="backgroud-color: #1890ff">
                                <template #icon><user-outlined /></template>
                            </a-avatar>        
                        </template>
                        <template #content>
                            <p>
                                {{ reply.content }}
                            </p>
                        </template>
                        <template #datetime>
                            <a-tooltip :title="reply.time">
                                <span>{{ dayjs(reply.time, "YYYY-MM-DD HH:mm:ss").fromNow() }}</span>
                            </a-tooltip>
                        </template>
                    </a-comment>
                </a-comment>
            </a-list-item>
        </template>
    </a-list>
</template>

<script>
import { reactive, getCurrentInstance, ref } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined, UploadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)

export default {
    name: 'TaskDrawerUpdates',
    props: ['taskID'],
    components: {
        UserOutlined,
        UploadOutlined,
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
    computed: {

    },
    setup(props) {
        const { appContext } = getCurrentInstance();
        const $store = appContext.config.globalProperties.$store
        const $http = appContext.config.globalProperties.$http
        const $router = appContext.config.globalProperties.$router
        
        const user = reactive(ref($store.state.user))
        const updateUser = () => {
            if (user.value === null) {
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


        const value = ref('')
        const submitting = ref(false)

        const updates = reactive({
            data: []
        })

        const updateUpdates = () => {
            $http.get('/api/comment', {params: {task_id: props.taskID}})
            .then (response => {
                let res = response.data
                if (res.code === 200) {
                    updates.data = res.result
                }
                else {
                    message.info('Unknown error happened')
                }
            })
            .catch (() => {
                message.error("Unexpected error happened")
            })
        }

        updateUser()
        updateUpdates()

        const fileList = ref([]);

        const handleRemove = file => {
            const index = fileList.value.indexOf(file);
            const newFileList = fileList.value.slice();
            newFileList.splice(index, 1);
            fileList.value = newFileList;
        };

        const beforeUpload = file => {
            fileList.value = [...fileList.value, file];
            return false;
        };

        const formUpload = () => {
            let formData = new FormData();
            formData.set('user_id', user.value.id)
            formData.set('task_id', props.taskID)
            formData.set('content', value.value)
            fileList.value.forEach(file => {
                formData.append('attachments', file)
            })
            submitting.value = true

            $http.post('/api/comment', formData)
            .then(response => {
                updateUpdates()
            })

            submitting.value = false
        };


        return {
            user,
            updateUser,

            value,
            submitting,

            dayjs,
            updates,
            updateUpdates,

            fileList,
            handleRemove,
            beforeUpload,
            formUpload,

        }
    }
}
</script>

<style>

</style>