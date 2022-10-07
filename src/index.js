// Firebase
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { getDatabase, ref, child, get, set } from "firebase/database";
import { getPerformance } from "firebase/performance";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVYFXkvxHP20zbqR0no1EEBpFmuNGKkwE",
  authDomain: "quote-site-beta.firebaseapp.com",
  databaseURL: "https://quote-site-beta-default-rtdb.firebaseio.com",
  projectId: "quote-site-beta",
  storageBucket: "quote-site-beta.appspot.com",
  messagingSenderId: "536424659041",
  appId: "1:536424659041:web:20be251b8a0056c69c1220"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and get a reference to the service
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Performance Monitoring and get a reference to the service
const perf = getPerformance(app);

// Auth
document.getElementById("login").addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithRedirect(auth, provider);
});

// Show Quotes
function showQuotes(quotes) {
  document.getElementById("quotes").innerHTML = '';
  quotes.forEach(element => {
    var node = document.createElement("li");
    var textnode=document.createTextNode(element);
    node.appendChild(textnode);
    document.getElementById("quotes").appendChild(node);
  });
}
// Add Quote
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  let quote = document.getElementById("addQuoteText").value;
  const uid = JSON.parse(sessionStorage.getItem("user")).uid;
  let quotes = JSON.parse(sessionStorage.getItem("quotes"));
  quotes.push(quote);
  const db = getDatabase();
  set(ref(db, uid + `/quotes`), quotes);
  sessionStorage.setItem("quotes", JSON.stringify(quotes));
  showQuotes(quotes);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Setup the UI
    // document.getElementById("logout").style.display = "";
    document.getElementById("user").style.display = "";
    sessionStorage.setItem("user", JSON.stringify(user));
    document.getElementById("img").src = user.photoURL;
    document.getElementById("name").innerText = user.displayName;
    document.getElementById("email").innerText = user.email;

    // Get the quotes
    const dbRef = ref(getDatabase());
    get(child(dbRef, user.uid + `/quotes`)).then((snapshot) => {
      if (snapshot.exists()) {
        sessionStorage.setItem("quotes", JSON.stringify(snapshot.val()));
        showQuotes(snapshot.val());
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  } else {
    document.getElementById("login").style.display = "";
  }
});