<template>
    <div class="logo">
        <el-image :src="require('@/assets/img/main-logo.png')" fit="scale-down"/>
    </div>
    <a-menu v-model:selectedKeys="selected.key" mode="inline" theme="dark">
        <a-menu-item v-for="department in departments" :key="department.id">
            <a-tooltip placement="right">
                <template #title>
                    <span>简介：{{ loadDescription(department.description) }}</span>
                </template>
                <menu-unfold-outlined />
                <span>{{ department.name }}</span>
            </a-tooltip>
        </a-menu-item>
    </a-menu>
</template>

<script>
    import { MenuUnfoldOutlined } from '@ant-design/icons-vue';
    import { defineComponent, ref, reactive, getCurrentInstance, computed } from 'vue';

    export default defineComponent({
        name: 'SideNavbar',
        components: {
            MenuUnfoldOutlined,
        },
        methods:{
            loadDescription(des) {
                if(typeof(des) === undefined || des === null || typeof des !== 'String' || des.length == 0)
                    return "无"
                else
                    return des
            },
        },
        created() {
            this.$watch(
                () => this.selected.key,
                (newVal, oldVal) => {
                    if(newVal != this.$store.state.selectedDepartmentID) {
                        if (typeof(newVal) != undefined && newVal !== null && newVal.length > 0) {
                            this.$store.dispatch({
                                type: 'setPresentDepartment',
                                selectedDepartmentID: newVal
                            })
                        }
                    }
                }
            )
        },
        computed: {
            departments() {
                return this.$store.state.departments
            },
        },
        data() {
            return {
                
            }
        },
        setup() {
            const { appContext } = getCurrentInstance();
            
            const selected = reactive({
                key: ref([2])
            })

            return {
                selected
            }
        }
    });
</script>

<style scoped>
    .logo {
        height: 160px;
        display: flex;
        padding: 15%;
        justify-content: center;
        vertical-align: middle;
    }
</style>