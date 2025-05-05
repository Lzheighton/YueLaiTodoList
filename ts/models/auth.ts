//用户登录/注册部分的TS模型

//用于判断模态窗口登录还是注册
export enum AuthMode{
    LOGIN = 'login',
    REGISTER = 'register'
}

export interface AuthCredentials{
    identifier: string;//用户uuid（登录）或邮箱（注册）
    code:string;//验证码
}