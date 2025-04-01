//从HTML页面获取DOM元素
const ul = document.querySelector('ul');
const todoInput = document.querySelector('input');

function addTodo(){
    // 获取用户输入
    const todoText = todoInput.value.trim();
    // trim方法来自字符串，用于去除字符串首尾的空白字符，返回新字符串
    todoInput.value = "";
    if(todoText === null){
        alert("输入字段为空！");
        return;
    }

    const todoItem = document.createElement('li');
    const todoListText = document.createElement('span');
    const deleteBtn = document.createElement('button');

    todoItem.appendChild(todoListText);
    todoListText.textContent = todoText;
    todoItem.appendChild(deleteBtn);
    deleteBtn.textContent = '删除';
    ul.appendChild(todoItem);

    deleteBtn.addEventListener('click', ()=>{
      ul.removeChild(todoItem);
    })

    todoInput.focus();
}