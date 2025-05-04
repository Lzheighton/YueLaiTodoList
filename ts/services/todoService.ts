import { yueLaiGroup } from './api';
import { todo } from '../models/todo';

//? 服务层逻辑：只包含API调用和数据处理

export class TodoService{
  private todos:todo[] = [];

  //发送POST请求，添加todo
  addTodoToApi(todoText:string, dateText:string): Promise<todo[]>{
    return yueLaiGroup
    .post(
      '/todo/add',
      {
        deadline: dateText,
        todolist: todoText,
      }
    )
    .then((res) => {
      if (res.data.code !== 2000) {
          throw new Error(res.data.code + res.data.message)
        }
        return res.data.data;
      })
  }

  //初始化todo数据
  loadTodos(): Promise<todo[]> {
    return yueLaiGroup
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
      })
  }

  //通过传入id 删除todo
  deleteTodo(id: number):void {
    yueLaiGroup.post('/todo/del', { id })
    .then(res => {
      if(res.data.code !== 2000){
        throw new Error(res.data.code + res.data.message)
      }
    })
  }
}