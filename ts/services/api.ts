import axios from 'axios'

//YuelaiTodo后端实例
export const yueLaiGroup = axios.create({
    baseURL: 'https://demo.yuelaigroup.com:8500/api/v1',
    timeout: 3000,
});

//请求拦截器，自动添加请求头的Authorization字段
yueLaiGroup.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})