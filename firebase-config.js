(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyCRi5ggezJ2XCOnSTzEQBxUHql370ItXCM',
    authDomain: 'emiliana-chat.firebaseapp.com',
    projectId: 'emiliana-chat',
    storageBucket: 'emiliana-chat.firebasestorage.app',
    messagingSenderId: '482463357881',
    appId: '1:482463357881:web:72c27d73b39623643f7468',
    measurementId: 'G-5XRMVZVVNL'
  };
  if (!window.firebase) return;
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.auth = firebase.auth();
})();
