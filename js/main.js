//从HTML页面获取DOM元素引用
const ul = document.getElementById('todoUl');
const todoInput = document.getElementById('todoInput');

function addTodo(){
    // 获取用户输入
    const todoText = todoInput.value.trim();
    // trim方法来自字符串，用于去除字符串首尾的空白字符，返回新字符串
    if(todoText === ''){
        todoInput.style.borderColor = 'red';
        showError("输入字段为空！");
        return;
    }
    todoInput.value = "";

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

function showError(msg){
    const errorDiv = document.createElement('div');
    errorDiv.className = 'Error';
    errorDiv.textContent = msg;
    todoInput.parentNode.appendChild(errorDiv);
}