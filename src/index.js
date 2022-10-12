import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  getDatabase,
  ref,
  child,
  get,
  set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAVYFXkvxHP20zbqR0no1EEBpFmuNGKkwE",
  authDomain: "quote-site-beta.firebaseapp.com",
  databaseURL: "https://quote-site-beta-default-rtdb.firebaseio.com",
  projectId: "quote-site-beta",
  storageBucket: "quote-site-beta.appspot.com",
  messagingSenderId: "536424659041",
  appId: "1:536424659041:web:20be251b8a0056c69c1220",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase();

// Auth
// Open new login box
document.getElementById("loginOpen").addEventListener("click", () => {
  document.getElementById("login").style.display = "block";
});
// Close box
document.getElementById("loginClose").addEventListener("click", () => {
  document.getElementById("login").style.display = "none";
});

document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider).then(() => {
    window.location.reload();
  });
});
const email = document.getElementById("email").value
const password = document.getElementById("password").value
document.getElementById("loginBtn").addEventListener("click", () => {
  signInWithEmailAndPassword(auth, email, password).then(() => {
    window.location.reload();
  });
});
document.getElementById("logout").addEventListener("click", () => {
  auth.signOut();
});

// Show Quotes
function showQuotes(quotes) {
  // eslint-disable-next-line no-param-reassign
  quotes = quotes.reverse();
  document.getElementById("quotes").innerHTML = "";
  quotes.forEach((quote) => {
    const node = document.createElement("div");
    if (quote.author !== undefined) {
      node.innerHTML = `<p class="text">${quote.quote} - ${quote.author}</p>
      <div class="action edit"><svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z"/></svg></div>
      <div class="action delete"><svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="M13.05 42q-1.25 0-2.125-.875T10.05 39V10.5H8v-3h9.4V6h13.2v1.5H40v3h-2.05V39q0 1.2-.9 2.1-.9.9-2.1.9Zm21.9-31.5h-21.9V39h21.9Zm-16.6 24.2h3V14.75h-3Zm8.3 0h3V14.75h-3Zm-13.6-24.2V39Z"/></svg></div>
      `;
    } else {
      node.innerHTML = `<p class="text">${quote.quote}</p>
      <div class="action edit"><svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z"/></svg></div>
      <div class="action delete"><svg xmlns="http://www.w3.org/2000/svg" height="48" width="48" viewBox="0 0 48 48"><path fill="black" d="M13.05 42q-1.25 0-2.125-.875T10.05 39V10.5H8v-3h9.4V6h13.2v1.5H40v3h-2.05V39q0 1.2-.9 2.1-.9.9-2.1.9Zm21.9-31.5h-21.9V39h21.9Zm-16.6 24.2h3V14.75h-3Zm8.3 0h3V14.75h-3Zm-13.6-24.2V39Z"/></svg></div>
      `;
    }
    node.className = "quote";
    document.getElementById("quotes").appendChild(node);
  });
}

// Open new quote box
document.getElementById("new").addEventListener("click", () => {
  document.getElementById("addQuote").style.display = "block";
});
// Close box
document.getElementById("addQuoteClose").addEventListener("click", () => {
  document.getElementById("addQuote").style.display = "none";
});

// Add Quote
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const quote = document.getElementById("addQuoteText").value;
  if (quote !== "") {
    const author = document.getElementById("addQuoteAuthor").value;
    const user = auth.currentUser;
    let quotes = JSON.parse(sessionStorage.getItem("quotes"));
    quotes = quotes.filter((el) => el !== null);
    if (author !== "") {
      quotes.push({
        quote,
        author,
      });
    } else {
      quotes.push({
        quote,
      });
    }
    set(ref(db, `${user.uid}/quotes`), quotes);
    sessionStorage.setItem("quotes", JSON.stringify(quotes));
    showQuotes(quotes);
    document.getElementById("addQuoteText").value = "";
    document.getElementById("addQuoteAuthor").value = "";
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("logout").style.display = "";

    // Get the quotes
    const dbRef = ref(getDatabase());
    get(child(dbRef, `${user.uid}/quotes`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          sessionStorage.setItem("quotes", JSON.stringify(snapshot.val()));
          showQuotes(snapshot.val());
        } else {
          const quotes = [{ quote: "This is your first quote.", author: "It has an author!" }];
          set(ref(db, `${user.uid}/quotes`), quotes);
          sessionStorage.setItem("quotes", JSON.stringify(quotes));
        }
      });
  } else {
    document.getElementById("login").style.display = "";
  }
});
