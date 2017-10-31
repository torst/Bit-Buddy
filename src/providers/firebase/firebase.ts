import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as firebase from 'firebase/app';
import { AngularFirestore,  AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Todo } from '../../models/models';
import { Platform, AlertController } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import 'rxjs/add/operator/map';

@Injectable()

export class FirebaseProvider {

  user: any;
  todoList: Observable<Todo[]>;
  todoCollection: AngularFirestoreCollection<Todo>;

  constructor(
    public http: Http,
    public db: AngularFirestore,
    public platform: Platform,
    public facebook: Facebook,
    private googlePlus: GooglePlus,
    private alertCtrl: AlertController,
  ) {
    firebase.auth().onAuthStateChanged(user => {
      this.user = user;
      if (user) {
        this.todoCollection = db.collection<Todo>(`todos/${ user.uid }/user-todos`);
      }
    });

  }

  // Auth methods

  loggedIn() {
    return this.user;
  }

  loginByFacebook(callback) {

    // for android and ios
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.facebook.login(['email'])
      .then( response => {
        const facebookCredential = firebase.auth.FacebookAuthProvider
          .credential(response.authResponse.accessToken);

          firebase.auth().signInWithCredential(facebookCredential)
          .then( success => {
            callback(null);
          }).catch((error) => {
            callback(error);
            this.handleError(error);
          });
      }).catch((error) => {
        callback(error);
        this.handleError(error);
      });
    } else {
      // For browser

      let provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
       callback(null);
      }).catch((error) => {
        callback(error);
        this.handleError(error);
       });
    }
  }

  loginByGoogle(callback) {

    // For Android and Ios.
    if (this.platform.is('android') || this.platform.is('ios')) {
      this.googlePlus.login({
        'webClientId': '935417274512-sf04s8s7ctkhpdj2t9aieold7uitmkh9.apps.googleusercontent.com',
        'offline': true
      }).then( res => {
        firebase.auth().signInWithCredential(firebase.auth.GoogleAuthProvider.credential(res.idToken))
          .then( success => {
            callback(null);
          }).catch((error) => {
            callback(error);
            this.handleError(error);
          });
      }).catch((error) => {
        callback(error);
        this.handleError(error);
      });
    } else {
      // For Browser

      let provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        callback(null);
      }).catch((error) => {
        callback(error);
        this.handleError(error);
       });
    }
  }


  // Todo Methods

  getTodos() {
    return this.db.collection<Todo>(`todos/${ this.user.uid }/user-todos`, ref => ref.orderBy("deadline")).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Todo;
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }

  addTodo(data) {
    this.todoCollection.add(data);
  }

  deleteTodo(todo) {
    this.todoCollection.doc(todo.id).delete();
  }

  editTodo(id, data) {
    this.todoCollection.doc(id).update(data);
  }

  handleError(error) {
    let alert = this.alertCtrl.create({
      title: 'Error',
      subTitle: `${ error.message }`,
      buttons: ['Dismiss']
    });
    alert.present();
  }

}
