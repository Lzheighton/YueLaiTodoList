//从HTML页面获取DOM元素
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');

function addTodo(){
    // 获取用户输入
    const todoText = todoInput.value.trim();
    // .value是DOM元素的属性，用于获取或设置该元素的值
    // trim方法来自字符串，用于去除字符串首尾的空白字符，返回新字符串
    if(todoText === null){
        alert("输入字段为空！");
        return;
    }

    //当输入待办后在无序列表中添加元素
    const li = document.createElement('li');
    li.innerHTML = `
        ${todoList}
        <button class="deleteBtn">删除</button>
    `;

    todoList.appendChild(li);

    //清空输入框
    todoInput.value = '';

    //绑定删除事件，条件监听
    li.querySelector('.deleteBtn').addEventListener('click', ()=>{
        li.remove();
    });
}