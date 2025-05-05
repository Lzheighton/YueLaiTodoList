import { $ } from '../../utils/dom';
import { AuthMode } from '../../models/auth';
import { AuthService } from '../../services/authService';

export class AuthComponent {
  private authService: AuthService;
  private currentMode: AuthMode = AuthMode.LOGIN;
  private countdownTimer: number | null = null;
  
  // DOM元素引用
  private modal = $('loginModalDiv');
  private closeButton = $('closeModalDiv');
  private loginTab = $('loginTabBtn');
  private registerTab = $('registerTabBtn');
  private form = $('authForm');
  private firstInput = $('firstInput');
  private firstLabel = $('firstTipLabel');
  private codeInput = $('verificationCodeInput');
  private submitBtn = $('submitBtn');
  private getCodeBtn = $('getCodeBtn');
  private formTitle = $('formTitle');
  private rememberMeContainer = $('rememberMeContainerDiv');
  private openLoginBtn = $('openLoginBtn');
  private userInfo = $('userInfo');
  private userUuid = $('userUuid');
  private logoutBtn = $('logoutBtn');
  
  constructor(authService: AuthService) {
    this.authService = authService;
    this.initializeEventListeners();
    this.updateLoginStatus();
  }
  
  private initializeEventListeners(): void {
    // 打开登录模态框
    this.openLoginBtn.addEventListener('click', () => this.openModal());
    
    // 关闭模态框
    this.closeButton.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });
    
    // 切换登录/注册模式
    this.loginTab.addEventListener('click', () => this.setAuthMode(AuthMode.LOGIN));
    this.registerTab.addEventListener('click', () => this.setAuthMode(AuthMode.REGISTER));
    
    // 获取验证码
    this.getCodeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.requestVerificationCode();
    });
    
    // 提交认证表单
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitAuthForm();
    });
    
    // 登出
    this.logoutBtn.addEventListener('click', () => this.logout());
  }
  
  // 设置认证模式（登录/注册）
  private setAuthMode(mode: AuthMode): void {
    this.currentMode = mode;
    
    if (mode === AuthMode.LOGIN) {
      // 更新UI为登录模式
      this.loginTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
      this.registerTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
      this.registerTab.classList.add('text-gray-500');
      
      this.formTitle.textContent = '登录到悦来待办';
      this.submitBtn.textContent = '登录';
      this.firstLabel.textContent = '用户uuid';
      this.firstInput.placeholder = '请输入用户uuid';
      this.rememberMeContainer.classList.remove('hidden');
    } else {
      // 更新UI为注册模式
      this.registerTab.classList.add('border-b-2', 'border-blue-500', 'text-blue-600');
      this.loginTab.classList.remove('border-b-2', 'border-blue-500', 'text-blue-600');
      this.loginTab.classList.add('text-gray-500');
      
      this.formTitle.textContent = '加入悦来待办';
      this.submitBtn.textContent = '注册';
      this.firstLabel.textContent = '邮箱地址';
      this.firstInput.placeholder = '请输入邮箱地址';
      this.rememberMeContainer.classList.add('hidden');
    }
  }
  
  // 请求验证码
  private async requestVerificationCode(): Promise<void> {
    const identifier = this.firstInput.value;
    
    // 验证输入
    if (!this.validateIdentifier(identifier)) {
      return;
    }
    
    try {
      await this.authService.sendVerificationCode(this.currentMode, identifier);
      this.startCountdown();
    } catch (error) {
      alert(`验证码请求失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
  
  // 验证标识符(邮箱或UUID)
  private validateIdentifier(identifier: string): boolean {
    if (this.currentMode === AuthMode.LOGIN) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!identifier || !uuidRegex.test(identifier)) {
        alert('请输入有效的uuid');
        return false;
      }
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!identifier || !emailRegex.test(identifier)) {
        alert('请输入有效的邮箱地址');
        return false;
      }
    }
    return true;
  }
  
  // 提交认证表单
  private async submitAuthForm(): Promise<void> {
    const identifier = this.firstInput.value;
    const code = this.codeInput.value;
    
    if (!code) {
      alert('请输入验证码');
      return;
    }
    
    try {
      let authData;
      
      if (this.currentMode === AuthMode.LOGIN) {
        authData = await this.authService.login(identifier, code);
      } else {
        authData = await this.authService.register(identifier, code);
      }
      
      // 保存用户信息
      localStorage.setItem('token', authData.token);
      localStorage.setItem('uuid', authData.uuid);
      
      // 刷新页面以应用登录状态
      window.location.reload();
    } catch (error) {
      alert(`${this.currentMode === AuthMode.LOGIN ? '登录' : '注册'}失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
  
  // 登出
  private logout(): void {
    this.authService.logout();
    this.updateLoginStatus();
    window.location.reload();
  }
  
  // 开始倒计时
  private startCountdown(): void {
    // 清除之前的倒计时
    this.clearCountdown();
    
    let countdown = 60;
    this.getCodeBtn.disabled = true;
    this.getCodeBtn.textContent = `${countdown}秒后重新获取`;
    
    this.countdownTimer = window.setInterval(() => {
      countdown--;
      this.getCodeBtn.textContent = `${countdown}秒后重新获取`;
      
      if (countdown <= 0) {
        this.clearCountdown();
      }
    }, 1000);
  }
  
  // 清除倒计时
  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    
    this.getCodeBtn.disabled = false;
    this.getCodeBtn.textContent = '获取验证码';
  }
  
  // 打开模态框
  private openModal(): void {
    this.modal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    this.setAuthMode(AuthMode.LOGIN); // 默认显示登录界面
  }
  
  // 关闭模态框
  private closeModal(): void {
    this.modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    this.clearCountdown();
    this.form.reset(); // 清空表单
  }
  
  // 更新登录状态
  public updateLoginStatus(): void {
    const isLoggedIn = this.authService.isLoggedIn();
    const uuid = localStorage.getItem('uuid');
    
    if (isLoggedIn && uuid) {
      this.openLoginBtn.classList.add('hidden');
      this.userInfo.classList.remove('hidden');
      this.userUuid.textContent = uuid;
    } else {
      this.openLoginBtn.classList.remove('hidden');
      this.userInfo.classList.add('hidden');
    }
  }
}