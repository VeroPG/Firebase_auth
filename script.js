// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsQ9Dbu9-YL8rhsLKsbVwdrCYyqNah8uQ",
  authDomain: "fir-firebase-789bc.firebaseapp.com",
  projectId: "fir-firebase-789bc",
  storageBucket: "fir-firebase-789bc.appspot.com",
  messagingSenderId: "364650381243",
  appId: "1:364650381243:web:85c736d3cca1c1ac0a0e9e",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
//Initialize Auth
const auth = getAuth();//ini modulo
const user = auth.currentUser;
//Initialize DDBB
const db = getFirestore(app);
//Initialize cloudstore
const storage = getStorage();

const signUpForm = document.getElementById("signup-form");// selectores DOM
const loginForm = document.getElementById("login-form");
const logout = document.getElementById("logout");
const userData = document.getElementById("user-data");

//SignUp function
signUpForm.addEventListener("submit", async (e) => {// evento para registro
  e.preventDefault();
  const signUpEmail = document.getElementById("signup-email").value;
  const signUpPassword = document.getElementById("signup-pass").value;
  const signUpUser = document.getElementById("signup-user").value;
  const usersRef = collection(db, "users");
  const signUpImg = document.getElementById("signup-picture").files[0];
  const storageRef = ref(storage, signUpImg.name);// referencia a bucket. Nombre para crear ref
  let publicImageUrl;
  try {
    //Create auth user
    await createUserWithEmailAndPassword(
      auth,
      signUpEmail,
      signUpPassword
    ).then((userCredential) => {
      console.log("User registered");
      const user = userCredential.user;
      signUpForm.reset();// borra form
    });
    //Upload file to cloud storage
    await uploadBytes(storageRef, signUpImg).then(async (snapshot) => { //sube foto
      console.log("Uploaded a blob or file!");
      publicImageUrl = await getDownloadURL(storageRef);
    });
    //Create document in DB
    await setDoc(doc(usersRef, signUpEmail), {// objeto usuario
      username: signUpUser,
      email: signUpEmail,
      profile_picture: publicImageUrl,
    });
  } catch (error) {
    console.log("Error: ", error);
  }
});

//Login function
loginForm.addEventListener("submit", async (e) => { 
  e.preventDefault();
  const loginEmail = document.getElementById("login-email").value;
  const loginPassword = document.getElementById("login-pass").value;
  //Call the collection in the DB
  const docRef = doc(db, "users", loginEmail);// ref a db
  //Search a document that matches with our ref
  const docSnap = await getDoc(docRef);//obtiene doc

  signInWithEmailAndPassword(auth, loginEmail, loginPassword)
    .then((userCredential) => {
      console.log("User authenticated");
      const user = userCredential.user;
      loginForm.reset();// borra form
    })
    .then(() => {
      if (docSnap.exists()) {// si existe pinta en el dom
        userData.style.cssText =
          "background-color: #73AB84;width: 50%;margin: 2rem auto;padding: 1rem;border-radius: 5px;display: flex;flex-direction: column;align-items: center";
        userData.innerHTML = `<h3>User Data</h3>
                              <p>Username: ${docSnap.data().username}</p>
                              <p>Email: ${docSnap.data().email}</p>
                              <img src=${
                                docSnap.data().profile_picture
                              } alt='User profile picture'>`;
      } else {
        console.log("No such document!");
      }
    })
    .catch((error) => {
      document.getElementById("msgerr").innerHTML = "Invalid user or password";
      const errorCode = error.code;
      const errorMessage = error.message;
    });
});

//Logout function
logout.addEventListener("click", () => {// Utiliza metodo sign out y borra form
  signOut(auth)
    .then(() => {
      console.log("Logout user");
      userData.style.cssText = "";
      userData.innerHTML = ``;
    })
    .catch((error) => {
      console.log("Error: ", error);
    });
});

//Observe the user's state
auth.onAuthStateChanged((user) => {//escucha estado usuario
  if (user) {
    console.log("Logged user");
  } else {
    console.log("No logged user");
  }
});
