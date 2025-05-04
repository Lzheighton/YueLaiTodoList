//处理待办列表渲染和事件监听器
import { $ } from '../../utils/dom';
import { todo } from '../../models/todo';
import { TodoService } from '../../services/todoService';

export class TodoComponent {
  private TodoService: TodoService;

  //待办提交部分
  private errorContainerDiv = $('errorContainerDiv');
  //整个待办清单的无序列表
  private todoUl = $('todoUl');
  private todoInput = $('todoInput');
  private dateInput = $('dateInput');
  private todoForm = $('todoForm');
  //无待办状态
  private emptyDiv = $('emptyDiv');

  //构造函数，绑定服务层，初始化监听器
  constructor() {
    this.TodoService = new TodoService();
    this.setupTodoListeners();
  }

  async setupTodoListeners() {
    this.updateEmptyState();

    //初始化todolist，本地存储有就从本地拉取，没有用空数组传入进行
    if (localStorage.getItem('token')) {
      const todos = await this.TodoService.loadTodos();
      this.renderTodoList(todos);
    } else {
      this.renderTodoList([]);
    }

    //回车键提交支持
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });

    //提交整个todo
    this.todoForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTodo();
    });
  }

  //添加待办
  private async addTodo() {
    // 获取用户输入
    // trim方法用于去除字符串首尾的空白字符，返回新字符串
    const todoText = this.todoInput.value.trim();
    const rawDateValue = this.dateInput.value.trim();

    if (!(this.validInput(this.todoInput) && this.validInput(this.dateInput))) return;

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
      this.showError('日期格式无效');
      return;
    }

    //请求成功后更新UI
    try {
      await this.TodoService.addTodoToApi(todoText, dateText);
      const todos = await this.TodoService.loadTodos();
      this.renderTodoList(todos);
    } catch (e: any) {
      this.showError(e.message);
    }

    //todo 输入框刷新
    this.todoInput.value = '';
    this.dateInput.value = '';
  }

  //通过传入todo数组刷新当前页面的todolist
  renderTodoList(todos: todo[]):void{
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
      deleteBtn.addEventListener('click', async (e) => {
        const li = (e.target as HTMLElement).closest('li');
        //从dataset属性中获取id
        if (li && li.dataset.id) {
          try{
            await this.TodoService.deleteTodo(parseInt(li.dataset.id));
            const todos = await this.TodoService.loadTodos();
            this.renderTodoList(todos);
          }catch(e:any){
            this.showError(e.message);
          }
          
        }
      });

      this.todoUl.appendChild(todoItem);
    }

    this.updateEmptyState();
  }

  //检查当前todo列表是否为空,每次对于DOM的调整都需要调用进行判断
  updateEmptyState() {
    if (this.todoUl.querySelectorAll('li').length === 0) {
      this.emptyDiv.classList.remove('hidden');
    } else {
      this.emptyDiv.classList.add('hidden');
    }
  }

  //判断输入是否有效
  validInput(input: HTMLInputElement): boolean {
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
  showError(msg: string): void {
    this.errorContainerDiv.textContent = msg;
    this.errorContainerDiv.style.display = 'block';
    this.todoInput.setAttribute('aria-invalid', 'true');
  }

  //清除当前错误
  clearError(): void {
    this.errorContainerDiv.style.display = 'none';
    this.todoInput.removeAttribute('aria-invalid');
  }
}
