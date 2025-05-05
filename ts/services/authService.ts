import { yueLaiGroup } from './api';
import { AuthMode } from '../models/auth';

export class AuthService {
  //发送验证码,分情况发送请求，是否为登录状态
  async sendVerificationCode(mode: AuthMode, identifier: string): Promise<void> {
    if (mode === AuthMode.LOGIN) {
      yueLaiGroup
        .post('/auth/send', {
          mail: null,
          uuid: identifier,
        })
        .then((res) => {
          if (res.data.code !== 2000) {
            throw new Error('登录过程出现问题！' + res.data.code + ':' + res.data.message);
          }
        });
    } else {
      yueLaiGroup
        .post('/auth/send', {
          mail: identifier,
          uuid: null,
        })
        .then((res) => {
          if (res.data.code !== 2000) {
            throw new Error('注册过程出现问题！' + res.data.code + ':' + res.data.message);
          }
        });
    }
  }

  async login(uuid:string, code:string): Promise<{token: string, uuid:string}>{
    return yueLaiGroup
      .post('/login', {
        code: code,
        uuid: uuid,
      })
      .then((res) => {
        if (res.data.code !== 2000) {
          throw new Error('登录过程出现问题！' + res.data.code + ':' + res.data.message);
        }
        return res.data.data;
      });
  }

  async register(mail:string, code:string): Promise<{token: string, uuid:string}>{
    return yueLaiGroup
      .post('/register', {
        code: code,
        mail: mail,
      })
      .then((res) => {
        if (res.data.code !== 2000) {
          throw new Error('注册过程出现问题！' + res.data.code + ':' + res.data.message);
        }
        return res.data.data;
      });
  }

  isLoggedIn():boolean{
    return Boolean(localStorage.getItem('token') && localStorage.getItem('uuid'));
  }

  logout():void {
    localStorage.removeItem('uuid');
    localStorage.removeItem('token');
  }
}
