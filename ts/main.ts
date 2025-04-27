import axios from 'axios';
import { $ } from './utils/dom';

//待办提交部分
const errorContainerDiv = $('errorContainerDiv');
//整个待办清单的无序列表
const todoUl = $('todoUl');
const todoInput = $('todoInput');
const dateInput = $('dateInput');
const todoForm = $('todoForm');
//无待办状态
const emptyDiv = $('emptyDiv');

//登录部分
//用户登录按钮，不登录默认仅网页上呈现
const openLoginBtn = $('openLoginBtn');

//模态窗口
const loginModalDiv = $('loginModalDiv');
const closeModalDiv = $('closeModalDiv');

//登录表单
const authForm = $('authForm');
const formTitle = $('formTitle');

//登录和注册分页按钮
const loginTabBtn = $('loginTabBtn');
const registerTabBtn = $('registerTabBtn');

//确认,接受验证码按钮
const submitBtn = $('submitBtn');
const getCodeBtn = $('getCodeBtn');

const verificationCodeInput = $('verificationCodeInput');

//记住我
//todo 激活js长轮询保持登录状态
const rememberMeContainerDiv = $('rememberMeContainerDiv');

//首个输入框，根据登录/注册改变
const firstTipLabel = $('firstTipLabel');
const firstInput = $('firstInput');

//YuelaiTodo后端实例
const yueLaiGroup = axios.create({
  baseURL: 'https://demo.yuelaigroup.com:8500/api/v1',
  timeout: 3000,
});

//事件监听器们
document.addEventListener('DOMContentLoaded', () => {
  //DOM加载完毕，进行初始化
  updateEmptyState();
  checkLoginStatus();
  if(localStorage.getItem('token')){
    loadTodos();
  }else{
    renderTodoList([]);
  }

  todoForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    addTodo();
  });

  //用户登录，打开模态窗口
  openLoginBtn.addEventListener('click', () => {
    loginModalDiv.classList.remove('hidden');
    //overflow-hidden,原子类特殊属性，用于控制元素内容超出其容器边界时的行为
    //防止用户在打开模态窗口时滚动背景内容
    document.body.classList.add('overflow-hidden');
  });

  //关闭模态窗口
  closeModalDiv.addEventListener('click', () => {
    loginModalDiv.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    clearCountdownTimer();
  });

  //点击背景时关闭模态窗口
  loginModalDiv.addEventListener('click', (e) => {
    if (e.target === loginModalDiv) {
      loginModalDiv.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    }
    clearCountdownTimer();
  });

  //切换到登录页
  loginTabBtn.addEventListener('click', function () {
    loginTabBtn.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
    registerTabBtn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
    registerTabBtn.classList.add('text-gray-500');

    isLogin = true;

    formTitle.textContent = '登录到悦来待办';
    submitBtn.textContent = '登录';
    firstTipLabel.textContent = '用户uuid';
    firstInput.placeholder = '请输入用户uuid';
    rememberMeContainerDiv.classList.remove('hidden');
  });

  //切换到注册页面
  registerTabBtn.addEventListener('click', () => {
    registerTabBtn.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
    loginTabBtn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
    loginTabBtn.classList.add('text-gray-500');

    isLogin = false;

    formTitle.textContent = '加入悦来待办';
    submitBtn.textContent = '注册';
    firstTipLabel.textContent = '邮箱地址';
    firstInput.placeholder = '请输入邮箱地址';
    rememberMeContainerDiv.classList.add('hidden');
  });

  //发送验证码
  getCodeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const firstValue = $('firstInput').value;

    if (isLogin) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!firstValue || !uuidRegex.test(firstValue)) {
        alert('请输入有效的uuid');
        return;
      }
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!firstValue || !emailRegex.test(firstValue)) {
        alert('请输入有效的邮箱地址');
        return;
      }
    }

    //分情况发送请求，是否为登录状态
    if (isLogin) {
      yueLaiGroup
        .post('/auth/send', {
          mail: null,
          uuid: firstValue,
        })
        .then((res) => {
          timer();
          if (res.data.code !== 2000) {
            alert(
              '验证码请求出现错误！请反馈管理员，有效的错误信息：' +
                res.data.code +
                ':' +
                res.data.message
            );
          }
        });
    } else {
      yueLaiGroup
        .post('/auth/send', {
          mail: firstValue,
          uuid: null,
        })
        .then((res) => {
          timer();
          if (res.data.code !== 2000) {
            alert(
              '验证码请求出现错误！请反馈管理员，有效的错误信息：' +
                res.data.code +
                ':' +
                res.data.message
            );
          }
        });
    }
  });

  //登出当前用户
  $('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('uuid');
    localStorage.removeItem('token');

    //更新登录状态
    checkLoginStatus();

    window.location.reload();
  });

  //回车键提交支持
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  //提交表单
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstValue = $('firstInput').value;
    const code = verificationCodeInput.value;
    if (isLogin) {
      yueLaiGroup
        .post('/login', {
          code: code,
          uuid: firstValue,
        })
        .then((res) => {
          if (res.data.code !== 2000) {
            alert(
              '登录请求出现错误！请反馈管理员，有效的错误信息：' +
                res.data.code +
                ':' +
                res.data.message
            );
          }

          localStorage.setItem('token', res.data.data.token)
          localStorage.setItem('uuid', res.data.data.uuid);
          window.location.reload();
        });
    } else {
      yueLaiGroup
        .post('/register', {
          code: code,
          mail: firstValue,
        })
        .then((res) => {
          if (res.data.code !== 2000) {
            alert(
              '注册请求出现错误！请反馈管理员，有效的错误信息：' +
                res.data.code +
                ':' +
                res.data.message
            );
          }

          localStorage.setItem('token', res.data.data.token);
          localStorage.setItem('uuid', res.data.data.uuid);
          window.location.reload();
        });
    }
  });
});

let isLogin:boolean = true;
let countdownTimer: number | null = null;

//维护一个待办事项的数组，其中的每个待办都是对象，存储截止时间和待办内容
interface todo {
  deadline: string
  todolist: string
  id: number
  [properties: string]:any
}

//本地维护数组，作为状态管理和离线缓存
let todos:todo[] = [];

//初始化todo数据
function loadTodos(){
  const token = localStorage.getItem('token');
  yueLaiGroup.get('/todo/my', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
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
function renderTodoList(todos:todo[]):void {
  todoUl.innerHTML = '';

  if(todos.length === 0){
    updateEmptyState();
    return;
  }

  for(let i = 0; i < todos.length; ++i){
    const todoText = todos[i].todolist;
    const dateText = todos[i].deadline;

    //li设置为flex容器，内容两端对齐
    const todoItem = document.createElement('li');
    todoItem.className = 'flex justify-between items-center px-6 py-4';
    
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

    deleteBtn.addEventListener('click', () => {
      deleteTodo();
    })

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

  let token = localStorage.getItem('token')

  //发送POST请求，添加todo
  yueLaiGroup
        .post('/todo/add', {
            deadline: dateText,
            todolist: todoText
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
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
          window.location.reload();
        })
}

//删除待办
function deleteTodo(){

}

//再次获取验证码计时器，封装为函数
function timer() {
  //清除可能存在的旧计时器
  if(countdownTimer !== null){
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  let countdown = 60;
  getCodeBtn.disabled = true;
  getCodeBtn.textContent = `${countdown}秒后重新获取`;

  const timer = setInterval(() => {
    countdown--;
    getCodeBtn.textContent = `${countdown}秒后重新获取`;

    if (countdown <= 0) {
      clearInterval(timer);
      getCodeBtn.disabled = false;
      getCodeBtn.textContent = '获取验证码';
    }
  }, 1000);
}

//清除定时器的函数
function clearCountdownTimer():void {
  if(countdownTimer !== null){
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  if(getCodeBtn){
    getCodeBtn.disabled = false;
    getCodeBtn.textContent = "获取验证码";
  }
}

//检查登录状态
function checkLoginStatus() {
  const openLoginBtn = $('openLoginBtn');
  const userInfo = $('userInfo');
  const userUuid = $('userUuid');

  const uuid = localStorage.getItem('uuid');

  if (uuid) {
    //当前localstorage存在uuid，已登录状态
    openLoginBtn.classList.add('hidden');
    userInfo.classList.remove('hidden');
    userUuid.textContent = uuid;
  } else {
    openLoginBtn.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
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