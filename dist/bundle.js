/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./ts/components/todo/todoList.ts":
/*!****************************************!*\
  !*** ./ts/components/todo/todoList.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TodoComponent = void 0;
//处理待办列表渲染和事件监听器
const dom_1 = __webpack_require__(/*! ../../utils/dom */ "./ts/utils/dom.ts");
const todoService_1 = __webpack_require__(/*! ../../services/todoService */ "./ts/services/todoService.ts");
class TodoComponent {
    //构造函数，绑定服务层，初始化监听器
    constructor() {
        //待办提交部分
        this.errorContainerDiv = (0, dom_1.$)('errorContainerDiv');
        //整个待办清单的无序列表
        this.todoUl = (0, dom_1.$)('todoUl');
        this.todoInput = (0, dom_1.$)('todoInput');
        this.dateInput = (0, dom_1.$)('dateInput');
        this.todoForm = (0, dom_1.$)('todoForm');
        //无待办状态
        this.emptyDiv = (0, dom_1.$)('emptyDiv');
        this.TodoService = new todoService_1.TodoService();
        this.setupTodoListeners();
    }
    setupTodoListeners() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.updateEmptyState();
            //初始化todolist，本地存储有就从本地拉取，没有用空数组传入进行
            if (localStorage.getItem('token')) {
                const todos = yield this.TodoService.loadTodos();
                this.renderTodoList(todos);
            }
            else {
                this.renderTodoList([]);
            }
            //回车键提交支持
            this.todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter')
                    this.addTodo();
            });
            //提交整个todo
            (_a = this.todoForm) === null || _a === void 0 ? void 0 : _a.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTodo();
            });
        });
    }
    //添加待办
    addTodo() {
        return __awaiter(this, void 0, void 0, function* () {
            // 获取用户输入
            // trim方法用于去除字符串首尾的空白字符，返回新字符串
            const todoText = this.todoInput.value.trim();
            const rawDateValue = this.dateInput.value.trim();
            if (!(this.validInput(this.todoInput) && this.validInput(this.dateInput)))
                return;
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
            }
            catch (e) {
                this.showError('日期格式无效');
                return;
            }
            //请求成功后更新UI
            try {
                yield this.TodoService.addTodoToApi(todoText, dateText);
                const todos = yield this.TodoService.loadTodos();
                this.renderTodoList(todos);
            }
            catch (e) {
                this.showError(e.message);
            }
            //todo 输入框刷新
            this.todoInput.value = '';
            this.dateInput.value = '';
        });
    }
    //通过传入todo数组刷新当前页面的todolist
    renderTodoList(todos) {
        this.todoUl.innerHTML = '';
        if (todos.length === 0) {
            this.updateEmptyState();
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
            //! 多个事件监听器会拖慢运行速度，需要根据id进行事件委托
            deleteBtn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
                const li = e.target.closest('li');
                //从dataset属性中获取id
                if (li && li.dataset.id) {
                    try {
                        yield this.TodoService.deleteTodo(parseInt(li.dataset.id));
                        const todos = yield this.TodoService.loadTodos();
                        this.renderTodoList(todos);
                    }
                    catch (e) {
                        this.showError(e.message);
                    }
                }
            }));
            this.todoUl.appendChild(todoItem);
        }
        this.updateEmptyState();
    }
    //检查当前todo列表是否为空,每次对于DOM的调整都需要调用进行判断
    updateEmptyState() {
        if (this.todoUl.querySelectorAll('li').length === 0) {
            this.emptyDiv.classList.remove('hidden');
        }
        else {
            this.emptyDiv.classList.add('hidden');
        }
    }
    //判断输入是否有效
    validInput(input) {
        if (!input.value.trim()) {
            this.showError('输入字段为空');
            //为高频事件添加防抖
            //通过延迟执行来优化高频事件处理（键盘输入，窗口缩放）
            //只有在事件停止触发后经过预定时间，才会执行一次处理函数
            input.classList.add('shake-error');
            setTimeout(() => input.classList.remove('shake-error'), 500);
            return false;
        }
        this.clearError();
        return true;
    }
    //在输入框附近展示错误
    showError(msg) {
        this.errorContainerDiv.textContent = msg;
        this.errorContainerDiv.style.display = 'block';
        this.todoInput.setAttribute('aria-invalid', 'true');
    }
    //清除当前错误
    clearError() {
        this.errorContainerDiv.style.display = 'none';
        this.todoInput.removeAttribute('aria-invalid');
    }
}
exports.TodoComponent = TodoComponent;


/***/ }),

/***/ "./ts/services/api.ts":
/*!****************************!*\
  !*** ./ts/services/api.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.yueLaiGroup = void 0;
//YuelaiTodo后端实例
exports.yueLaiGroup = axios.create({
    baseURL: 'https://demo.yuelaigroup.com:8500/api/v1',
    timeout: 3000,
});
//请求拦截器，自动添加请求头的Authorization字段
exports.yueLaiGroup.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


/***/ }),

/***/ "./ts/services/authService.ts":
/*!************************************!*\
  !*** ./ts/services/authService.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setupAuthListeners = setupAuthListeners;
exports.checkLoginStatus = checkLoginStatus;
const dom_1 = __webpack_require__(/*! ../utils/dom */ "./ts/utils/dom.ts");
const api_1 = __webpack_require__(/*! ./api */ "./ts/services/api.ts");
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
function setupAuthListeners() {
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
            api_1.yueLaiGroup
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
            api_1.yueLaiGroup
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
        localStorage.removeItem('token');
        //更新登录状态
        checkLoginStatus();
        window.location.reload();
    });
    //提交表单
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstValue = (0, dom_1.$)('firstInput').value;
        const code = verificationCodeInput.value;
        if (isLogin) {
            api_1.yueLaiGroup
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
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            });
        }
        else {
            api_1.yueLaiGroup
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
                localStorage.setItem('token', res.data.data.token);
                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            });
        }
    });
}
let isLogin = true;
let countdownTimer = null;
//再次获取验证码计时器，封装为函数
function timer() {
    //清除可能存在的旧计时器
    if (countdownTimer !== null) {
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
function clearCountdownTimer() {
    if (countdownTimer !== null) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }
    if (getCodeBtn) {
        getCodeBtn.disabled = false;
        getCodeBtn.textContent = '获取验证码';
    }
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


/***/ }),

/***/ "./ts/services/todoService.ts":
/*!************************************!*\
  !*** ./ts/services/todoService.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TodoService = void 0;
const api_1 = __webpack_require__(/*! ./api */ "./ts/services/api.ts");
//? 服务层逻辑：只包含API调用和数据处理
class TodoService {
    constructor() {
        this.todos = [];
    }
    //发送POST请求，添加todo
    addTodoToApi(todoText, dateText) {
        return api_1.yueLaiGroup
            .post('/todo/add', {
            deadline: dateText,
            todolist: todoText,
        })
            .then((res) => {
            if (res.data.code !== 2000) {
                throw new Error(res.data.code + res.data.message);
            }
            return res.data.data;
        });
    }
    //初始化todo数据
    loadTodos() {
        return api_1.yueLaiGroup
            .get('/todo/my')
            .then((res) => {
            //response正常，直接加载获取到的todo
            this.todos = res.data.data;
            return this.todos;
        })
            .catch(() => {
            //! 离线状态，从LocalStorage获取缓存的todo，加载失败不抛出错误
            const cachedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
            this.todos = cachedTodos;
            return this.todos;
        });
    }
    //通过传入id 删除todo
    deleteTodo(id) {
        api_1.yueLaiGroup.post('/todo/del', { id })
            .then(res => {
            if (res.data.code !== 2000) {
                throw new Error(res.data.code + res.data.message);
            }
        });
    }
}
exports.TodoService = TodoService;


/***/ }),

/***/ "./ts/utils/dom.ts":
/*!*************************!*\
  !*** ./ts/utils/dom.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.$ = $;
//工具函数，用于判定从DOM取得的元素是否为空，简化代码
//泛型升级，用于匹配不同类型的DOM元素（按钮，输入，选择等等）
function $(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Element with id ${id} not found`);
    return el;
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!********************!*\
  !*** ./ts/main.ts ***!
  \********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
const authService_1 = __webpack_require__(/*! ./services/authService */ "./ts/services/authService.ts");
const authService_2 = __webpack_require__(/*! ./services/authService */ "./ts/services/authService.ts");
const todoService_1 = __webpack_require__(/*! ./services/todoService */ "./ts/services/todoService.ts");
const todoList_1 = __webpack_require__(/*! ./components/todo/todoList */ "./ts/components/todo/todoList.ts");
document.addEventListener('DOMContentLoaded', () => {
    //DOM加载完毕，进行初始化
    //初始化服务层
    const todoService = new todoService_1.TodoService();
    //初始化组件
    const todoComponent = new todoList_1.TodoComponent();
    (0, authService_1.setupAuthListeners)();
    (0, authService_2.checkLoginStatus)();
});

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map