"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dom_1 = require("./utils/dom");
//待办提交部分
const errorContainerDiv = (0, dom_1.$)('errorContainerDiv');
//整个待办清单的无序列表
const todoUl = (0, dom_1.$)('todoUl');
const todoInput = (0, dom_1.$)('todoInput');
const dateInput = (0, dom_1.$)('dateInput');
const todoForm = (0, dom_1.$)('todoForm');
//无待办状态
const emptyDiv = (0, dom_1.$)('emptyDiv');
//登录部分
//用户登录按钮，不登录默认仅网页上呈现
const openLoginBtn = (0, dom_1.$)('openLoginBtn');
//模态窗口
const loginModalDiv = (0, dom_1.$)('loginModalDiv');
const closeModalDiv = (0, dom_1.$)('closeModalDiv');
//登录表单
const authForm = (0, dom_1.$)('authForm');
const formTitle = (0, dom_1.$)('formTitle');
//登录和注册分页按钮
const loginTabBtn = (0, dom_1.$)('loginTabBtn');
const registerTabBtn = (0, dom_1.$)('registerTabBtn');
//确认,接受验证码按钮
const submitBtn = (0, dom_1.$)('submitBtn');
const getCodeBtn = (0, dom_1.$)('getCodeBtn');
const verificationCodeInput = (0, dom_1.$)('verificationCodeInput');
//记住我
//todo 激活js长轮询保持登录状态
const rememberMeContainerDiv = (0, dom_1.$)('rememberMeContainerDiv');
//首个输入框，根据登录/注册改变
const firstTipLabel = (0, dom_1.$)('firstTipLabel');
const firstInput = (0, dom_1.$)('firstInput');
//YuelaiTodo后端实例
const yueLaiGroup = axios_1.default.create({
    baseURL: 'https://demo.yuelaigroup.com:8500/api/v1',
    timeout: 3000,
});
//事件监听器们
document.addEventListener('DOMContentLoaded', () => {
    //DOM加载完毕，进行初始化
    updateEmptyState();
    checkLoginStatus();
    todoForm === null || todoForm === void 0 ? void 0 : todoForm.addEventListener('submit', (e) => {
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
    });
    //点击背景时关闭模态窗口
    loginModalDiv.addEventListener('click', (e) => {
        if (e.target === loginModalDiv) {
            loginModalDiv.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    });
    // 切换到登录页
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
        const firstValue = (0, dom_1.$)('firstInput').value;
        if (isLogin) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!firstValue || !uuidRegex.test(firstValue)) {
                alert('请输入有效的uuid');
                return;
            }
        }
        else {
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
                    alert('验证码请求出现错误！请反馈管理员，有效的错误信息：' +
                        res.data.code +
                        ':' +
                        res.data.message);
                }
            });
        }
        else {
            yueLaiGroup
                .post('/auth/send', {
                mail: firstValue,
                uuid: null,
            })
                .then((res) => {
                timer();
                if (res.data.code !== 2000) {
                    alert('验证码请求出现错误！请反馈管理员，有效的错误信息：' +
                        res.data.code +
                        ':' +
                        res.data.message);
                }
            });
        }
    });
    //登出当前用户
    (0, dom_1.$)('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('uuid');
        //todo cookie的删除需要注意
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        //更新登录状态
        checkLoginStatus();
        window.location.reload();
    });
    //回车键提交支持
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter')
            addTodo();
    });
    //提交表单
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstValue = (0, dom_1.$)('firstInput').value;
        const code = verificationCodeInput.value;
        if (isLogin) {
            yueLaiGroup
                .post('/login', {
                code: code,
                uuid: firstValue,
            })
                .then((res) => {
                if (res.data.code !== 2000) {
                    alert('登录请求出现错误！请反馈管理员，有效的错误信息：' +
                        res.data.code +
                        ':' +
                        res.data.message);
                }
                document.cookie = 'token=' + encodeURIComponent(res.data.data.token);
                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            });
        }
        else {
            yueLaiGroup
                .post('/register', {
                code: code,
                mail: firstValue,
            })
                .then((res) => {
                if (res.data.code !== 2000) {
                    alert('注册请求出现错误！请反馈管理员，有效的错误信息：' +
                        res.data.code +
                        ':' +
                        res.data.message);
                }
                document.cookie = 'token=' + encodeURIComponent(res.data.data.token);
                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            });
        }
    });
});
//登录状态变量，用于跟踪登录模态窗口的状态
let isLogin = true;
//再次获取验证码计时器，封装为函数
function timer() {
    let countdown = 300;
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
//检查登录状态
function checkLoginStatus() {
    const openLoginBtn = (0, dom_1.$)('openLoginBtn');
    const userInfo = (0, dom_1.$)('userInfo');
    const userUuid = (0, dom_1.$)('userUuid');
    const uuid = localStorage.getItem('uuid');
    if (uuid) {
        //当前localstorage存在uuid，已登录状态
        openLoginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userUuid.textContent = uuid;
    }
    else {
        openLoginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}
//检查当前todo列表是否为空,每次对于DOM的调整都需要调用进行判断
function updateEmptyState() {
    if (todoUl.querySelectorAll('li').length === 0) {
        emptyDiv.classList.remove('hidden');
    }
    else {
        emptyDiv.classList.add('hidden');
    }
}
function addTodo() {
    // 获取用户输入
    // trim方法用于去除字符串首尾的空白字符，返回新字符串
    const todoText = todoInput.value.trim();
    const dateText = dateInput.value.trim();
    if (!validInput(todoInput))
        return;
    if (!validInput(dateInput))
        return;
    todoInput.value = '';
    dateInput.value = '';
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
    todoUl.appendChild(todoItem);
    deleteBtn.addEventListener('click', () => {
        todoItem.remove();
        updateEmptyState();
    });
    todoInput.focus();
    updateEmptyState();
}
//判断输入是否为空
function validInput(input) {
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
function showError(msg) {
    errorContainerDiv.textContent = msg;
    errorContainerDiv.style.display = 'block';
    todoInput.setAttribute('aria-invalid', 'true');
}
function clearError() {
    errorContainerDiv.style.display = 'none';
    todoInput.removeAttribute('aria-invalid');
}
