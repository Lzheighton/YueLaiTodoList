import { TodoService } from './services/todoService';
import { AuthService } from './services/authService';
import { TodoComponent } from './components/todo/todoList';
import { AuthComponent } from './components/auth/authComponent';

document.addEventListener('DOMContentLoaded', () => {
  //DOM加载完毕，进行初始化

  //初始化服务层
  const todoService = new TodoService();
  const authService = new AuthService();

  //初始化组件
  const authComponent = new AuthComponent(authService);
  const todoComponent = new TodoComponent();
});