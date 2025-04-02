//从HTML页面获取DOM元素引用
const ul = document.getElementById('todoUl');
const todoInput = document.getElementById('todoInput');
const errorContainer = document.getElementById('todoInput-error');

function addTodo(){
    // 获取用户输入
    const todoText = todoInput.value.trim();
    // trim方法来自字符串，用于去除字符串首尾的空白字符，返回新字符串
    if(!validInput()) return;
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
      todoItem.remove();
    })

    todoInput.focus();
}

function validInput(){
    if(!todoInput.value.trim()){
        showError('输入字段为空');
        todoInput.classList.add('shake-error');
        setTimeout(()=> todoInput.classList.remove('shake-error'), 500);
        return false
    }
    clearError()
    return true;
}

function showError(msg){
    errorContainer.textContent = msg;
    errorContainer.style.display = 'block';
    todoInput.setAttribute('aria-invalid', 'true');
}

function clearError(){
    errorContainer.style.display = 'none';
    todoInput.removeAttribute('aria-invalid');
}

todoInput.addEventListener('keypress', (e)=>{
    if(e.key === 'Enter') addTodo();
})