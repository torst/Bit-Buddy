import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { WriteTodoPage } from '../write-todo/write-todo';
import { EditTodoPage } from '../edit-todo/edit-todo';
import { AlertProvider } from '../../providers/alert/alert';
import { TodoProvider } from '../../providers/todo/todo';
import { Todo } from '../../models/models';



@Component({
  selector: 'page-todo',
  templateUrl: 'todo.html',
})
export class TodoPage {

  todoObj: any;
  gotData: Boolean = false;
  todoFirebaseCallback: any;
  todoList: Todo[];
  user: any;
  todoObservable: any;

  constructor(
    public navCtrl: NavController,
    public alertProvider: AlertProvider,
    public ref: ChangeDetectorRef,
    public todoProvider: TodoProvider,
  ) {
    this.gotData = false;
  }

  ionViewDidLoad() {
    this.todoObservable = this.todoProvider.getTodos().subscribe(data => {
      this.todoList = data;
      this.gotData = true;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
  }


  writeTodo() {
    this.navCtrl.push(WriteTodoPage);
  }

  editTodo(todo) {
    this.navCtrl.push(EditTodoPage, todo);
  }

  deleteTodo(todo) {
   this.todoProvider.deleteTodo(todo);
   this.alertProvider.alert('Good Job!', 1500);
 }


  ionViewWillUnload() {
    this.todoObservable.unsubscribe();
  }

}
