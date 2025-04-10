//待办提交部分

//根据id从HTML中获取DOM元素引用
const errorContainer = document.getElementById('todoInput-error');
const ul = document.getElementById('todoUl');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const emptyState = document.getElementById('emptyState');

//登录部分

//用户登录按钮，不登录默认仅网页上呈现
const openLoginBtn = document.getElementById('openLoginBtn');

//整个模态窗口
const loginModal = document.getElementById('loginModal');
const closeModal = document.getElementById('closeModal');

//整个表单
const authForm = document.getElementById('authForm');
const formTitle = document.getElementById('formTitle');

//登录和注册分页
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');

//确认按钮
const submitBtn = document.getElementById('submitBtn');
const getCodeBtn = document.getElementById('getCodeBtn');

//记住我，激活js长轮询保持登录状态
const rememberMeContainer = document.getElementById('rememberMeContainer');

//首个输入框，根据登录/注册改变
const firstTip = document.getElementById('firstTip');
const firstInput = document.getElementById('firstInput');

//YuelaiTodo后端实例
const yueLaiGroup = axios.create({
    baseURL: 'https://demo.yuelaigroup.com:8500/api/v1',
    setTimeout: 3000
})

//事件监听器们
document.addEventListener('DOMContentLoaded', () => {
    //DOM加载完毕
    updateEmptyState();
    checkLoginStatus();
});

//登录状态变量，用于跟踪模态窗口状态
var isLogin = true;

//用户登录，打开模态窗口
openLoginBtn.addEventListener('click', () => {
    loginModal.classList.remove('hidden');
    //overflow-hidden,原子类特殊属性，用于控制元素内容超出其容器边界时的行为
    //防止用户在打开模态窗口时滚动背景内容
    document.body.classList.add('overflow-hidden');
});

//关闭模态窗口
closeModal.addEventListener('click', () => {
    loginModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
});

//点击背景时关闭模态窗口
loginModal.addEventListener('click', (e) => {
    if(e.target === loginModal) {
        loginModal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
});

// 切换到登录页
loginTab.addEventListener('click', function() {
    loginTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
    registerTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
    registerTab.classList.add('text-gray-500');

    isLogin = true;

    formTitle.textContent = '登录到悦来待办';
    submitBtn.textContent = '登录';
    firstTip.textContent = '用户uuid';
    firstInput.placeholder = '请输入用户uuid';
    rememberMeContainer.classList.remove('hidden');
});

//切换到注册页面
registerTab.addEventListener('click', () => {
    registerTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
    loginTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
    loginTab.classList.add('text-gray-500');

    isLogin = false;

    formTitle.textContent = '加入悦来待办';
    submitBtn.textContent = '注册';
    firstTip.textContent = '邮箱地址';
    firstInput.placeholder = '请输入邮箱地址';
    rememberMeContainer.classList.add('hidden');
})

//发送验证码
getCodeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const firstValue = document.getElementById('firstInput').value;

    if(isLogin) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if(!firstValue || !uuidRegex.test(firstValue)) {
            alert("请输入有效的uuid");
            return;
        }
    }else{
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!firstValue || !emailRegex.test(firstValue)) {
            alert("请输入有效的邮箱地址");
            return;
        }
    }

    //分情况发送请求，是否为登录状态
    if(isLogin) {
        yueLaiGroup.post('/auth/send', {
            mail: null,
            uuid: firstValue
        })
            .then(res => {
                timer();
                if(res.data.code !== 2000){
                    alert('验证码请求出现错误！请反馈管理员，有效的错误信息：' + res.data.code + ':' + res.data.message);
                }
            })
    }else{
        yueLaiGroup.post('/auth/send', {
            mail: firstValue,
            uuid: null
        })
            .then(res => {
                timer();
                if(res.data.code !== 2000){
                    alert('验证码请求出现错误！请反馈管理员，有效的错误信息：' + res.data.code + ':' + res.data.message);
                }
            })
    }
})

//再次获取验证码计时器，封装为函数
function timer(){
    let countdown = 300;
    getCodeBtn.disabled = true;
    getCodeBtn.textContent = `${countdown}秒后重新获取`;

    const timer = setInterval(() => {
        countdown--;
        getCodeBtn.textContent = `${countdown}秒后重新获取`;

        if(countdown <= 0) {
            clearInterval(timer);
            getCodeBtn.diabled = false;
            getCodeBtn.textContent = '获取验证码';
        }
    }, 1000)
}

//提交表单
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const firstValue = document.getElementById('firstInput').value;
    const code = document.getElementById('verificationCode').value;
    if(isLogin) {
        yueLaiGroup.post('/login', {
            code: code,
            uuid: firstValue,
        })
            .then(res => {
                if(res.data.code !== 2000){
                    alert('登录请求出现错误！请反馈管理员，有效的错误信息：' + res.data.code + ':' + res.data.message);
                }

                document.cookie = 'token=' + encodeURIComponent(res.data.data.token);

                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            })
    }else{
        yueLaiGroup.post('/register', {
            code: code,
            mail: firstValue,
        })
            .then(res => {
                if(res.data.code !== 2000){
                    alert('注册请求出现错误！请反馈管理员，有效的错误信息：' + res.data.code + ':' + res.data.message);
                }

                document.cookie = 'token=' + encodeURIComponent(res.data.data.token);

                localStorage.setItem('uuid', res.data.data.uuid);
                window.location.reload();
            })
    }
})

//检查登录状态
function checkLoginStatus(){
    const openLoginBtn = document.getElementById('openLoginBtn');
    const userInfo = document.getElementById('userInfo');
    const userUuid = document.getElementById('userUuid');

    const uuid = localStorage.getItem('uuid');

    if(uuid){
        //当前localstorage存在uuid，已登录状态
        openLoginBtn.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userUuid.textContent = uuid;
    }else{
        openLoginBtn.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

//登出当前用户
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('uuid');
    localStorage.removeItem('token');

    //更新登录状态
    checkLoginStatus();

    window.location.reload();
})

//回车键提交支持
todoInput.addEventListener('keypress', (e)=>{
    if(e.key === 'Enter') addTodo();
})

//检查当前todo列表是否为空,每次对于DOM的调整都需要调用进行判断
function updateEmptyState() {
    if(ul.querySelectorAll('li').length === 0) {
        emptyState.classList.remove('hidden');
    }else{
        emptyState.classList.add('hidden');
    }
}

function addTodo(){
    // 获取用户输入
    // trim方法用于去除字符串首尾的空白字符，返回新字符串
    const todoText = todoInput.value.trim();
    const dateText = dateInput.value.trim();

    if(!validInput(todoInput)) return;
    if(!validInput(dateInput)) return;
    todoInput.value = "";
    dateInput.value = "";

    //li设置为flex容器，内容两端对齐
    const todoItem = document.createElement('li');
    todoItem.className = "flex justify-between items-center px-6 py-4";

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
    deleteBtn.className = 'bg-blue-500 hover:bg-red-500 text-white font-bold py-1 px-3 rounded transition duration-200';
    todoDiv.appendChild(deleteBtn);

    ul.appendChild(todoItem);

    deleteBtn.addEventListener('click', ()=>{
      todoItem.remove();
      updateEmptyState();
    })

    todoInput.focus();
    updateEmptyState();
}

//判断输入是否为空
function validInput(input){
    if(!input.value.trim()){
        showError('输入字段为空');
        //为高频事件添加防抖
        //通过延迟执行来优化高频事件处理（键盘输入，窗口缩放）
        //只有在事件停止触发后经过预定时间，才会执行一次处理函数
        input.classList.add('shake-error');
        setTimeout(()=> input.classList.remove('shake-error'), 500);
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