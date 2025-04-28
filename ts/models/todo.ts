//待办事项类型定义，数据模型

//维护一个待办事项的数组，其中的每个待办都是对象，存储截止时间和待办内容
export interface todo {
    deadline: string
    todolist: string
    id: number
    [properties: string]:any
}