import { yueLaiGroup } from './api';
import { todo } from '../models/todo';
import { $ } from '../utils/dom';

//本地维护数组，作为状态管理和离线缓存
let todos: todo[] = [];

//待办提交部分
const errorContainerDiv = $('errorContainerDiv');
//整个待办清单的无序列表
const todoUl = $('todoUl');
const todoInput = $('todoInput');
const dateInput = $('dateInput');
const todoForm = $('todoForm');
//无待办状态
const emptyDiv = $('emptyDiv');

export function setupTodoListeners(){
    updateEmptyState();

    //初始化todolist，本地存储有就从本地拉取，没有用空数组传入进行
    if(localStorage.getItem('token')){
        loadTodos();
    }else{
        renderTodoList([]);
    }

    //回车键提交支持
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    //提交整个todo
    todoForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        addTodo();
    });
}

//初始化todo数据
function loadTodos() {
  const token = localStorage.getItem('token');
  yueLaiGroup
    .get('/todo/my')
    .then((res) => {
      //response正常，直接加载获取到的todo
      todos = res.data.data;
      renderTodoList(todos);
    })
    .catch(() => {
      //! 离线状态，从LocalStorage获取缓存的todo
      const cachedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      todos = cachedTodos;
      renderTodoList(todos);
    });
}

//通过传入todo数组刷新当前页面的todolist
function renderTodoList(todos: todo[]): void {
  todoUl.innerHTML = '';

  if (todos.length === 0) {
    updateEmptyState();
    return;
  }

  for (let i = 0; i < todos.length; ++i) {
    const todoText = todos[i].todolist;
    const dateText = todos[i].deadline;

    //li设置为flex容器，内容两端对齐
    const todoItem = document.createElement('li');
    todoItem.className = 'flex justify-between items-center px-6 py-4';

    //使用dataset设定id
    todoItem.dataset.id = todos[i].id.toString();

    //左侧，待办内容
    const todoSpan = document.createElement('span');
    todoSpan.textContent = todoText;
    todoItem.appendChild(todoSpan);

    //每个待办的容器
    const todoDiv = document.createElement('div');
    todoDiv.className = 'flex items-center gap-3';
    todoItem.append(todoDiv);

    //截止日期
    const dateSpan = document.createElement('span');
    dateSpan.textContent = '截至:' + dateText;
    dateSpan.className = 'text-gray-500 text-sm';
    todoDiv.appendChild(dateSpan);

    //删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '删除';
    deleteBtn.className =
      'bg-blue-500 hover:bg-red-500 text-white font-bold py-1 px-3 rounded transition duration-200';
    todoDiv.appendChild(deleteBtn);

    deleteBtn.addEventListener('click', (e) => {
      const li = (e.target as HTMLElement).closest('li');
      //从dataset属性中获取id
      if(li && li.dataset.id){
        deleteTodo(parseInt(li.dataset.id));
      }
    });

    todoUl.appendChild(todoItem);
  }

  updateEmptyState();
}

//添加待办
function addTodo() {
  // 获取用户输入
  // trim方法用于去除字符串首尾的空白字符，返回新字符串
  const todoText = todoInput.value.trim();
  const rawDateValue = dateInput.value.trim();

  if (!(validInput(todoInput) && validInput(dateInput))) return;

  // 格式化日期为"2006-01-02 15:04:05"格式
  let dateText;
  try {
    // 从datetime-local输入创建日期对象
    const dateObj = new Date(rawDateValue);

    // 格式化为指定格式
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    dateText = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error('日期格式转换错误:', e);
    showError('日期格式无效');
    return;
  }

  //todo 输入框刷新
  todoInput.value = '';
  dateInput.value = '';

  let token = localStorage.getItem('token');

  //发送POST请求，添加todo
  yueLaiGroup
    .post(
      '/todo/add',
      {
        deadline: dateText,
        todolist: todoText,
      }
    )
    .then((res) => {
      if (res.data.code !== 2000) {
        alert(
          '添加请求出现错误！请反馈管理员，有效的错误信息：' +
            res.data.code +
            ':' +
            res.data.message
        );
      }
      todos = res.data.data;
      console.log(todos);
      localStorage.setItem('todos', JSON.stringify(todos));
      renderTodoList(todos);
    })
    .finally(() => {
      todoInput.focus();
      updateEmptyState();
    });
}

//删除待办
function deleteTodo(id: number):void {
  yueLaiGroup.post('/todo/del', { id })
  .then(res => {
    if(res.data.code === 2000){
      loadTodos();
    }else{
      alert('删除请求出现错误！请反馈管理员，有效的错误信息：' + 
        res.data.code +
          ':' +
        res.data.message
      );
    }
  })
}

//检查当前todo列表是否为空,每次对于DOM的调整都需要调用进行判断
function updateEmptyState() {
  if (todoUl.querySelectorAll('li').length === 0) {
    emptyDiv.classList.remove('hidden');
  } else {
    emptyDiv.classList.add('hidden');
  }
}

//判断输入是否为空
function validInput(input: HTMLInputElement): boolean {
  if (!input.value.trim()) {
    showError('输入字段为空');
    //为高频事件添加防抖
    //通过延迟执行来优化高频事件处理（键盘输入，窗口缩放）
    //只有在事件停止触发后经过预定时间，才会执行一次处理函数
    input.classList.add('shake-error');
    setTimeout(() => input.classList.remove('shake-error'), 500);
    return false;
  }
  clearError();
  return true;
}

function showError(msg: string): void {
  errorContainerDiv.textContent = msg;
  errorContainerDiv.style.display = 'block';
  todoInput.setAttribute('aria-invalid', 'true');
}

function clearError(): void {
  errorContainerDiv.style.display = 'none';
  todoInput.removeAttribute('aria-invalid');
}
