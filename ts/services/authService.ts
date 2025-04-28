import { $ } from '../utils/dom';
import { yueLaiGroup } from './api';

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

export function setupAuthListeners() {
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

          localStorage.setItem('token', res.data.data.token);
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
}

let isLogin: boolean = true;
let countdownTimer: number | null = null;

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
function clearCountdownTimer(): void {
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
export function checkLoginStatus() {
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
