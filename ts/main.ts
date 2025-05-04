import { setupAuthListeners } from './services/authService';
import { checkLoginStatus } from './services/authService'
import { TodoService } from './services/todoService';
import { TodoComponent } from './components/todo/todoList';

document.addEventListener('DOMContentLoaded', () => {
  //DOM加载完毕，进行初始化

  //初始化服务层
  const todoService = new TodoService();

  //初始化组件
  const todoComponent = new TodoComponent();
  
  setupAuthListeners();
  checkLoginStatus();
});