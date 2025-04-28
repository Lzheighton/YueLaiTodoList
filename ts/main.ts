import { setupTodoListeners } from './services/todoService';
import { setupAuthListeners } from './services/authService';
import { checkLoginStatus } from './services/authService'

document.addEventListener('DOMContentLoaded', () => {
  //DOM加载完毕，进行初始化
  setupTodoListeners();
  setupAuthListeners();
  checkLoginStatus();
});