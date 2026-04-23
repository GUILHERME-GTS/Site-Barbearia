import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFhgPMtUffKzs_yKFhzPzvCe0WsTICQk",
  authDomain: "sistema-barbearia-neguinho.firebaseapp.com",
  projectId: "sistema-barbearia-neguinho",
  storageBucket: "sistema-barbearia-neguinho.firebasestorage.app",
  messagingSenderId: "743336103118",
  appId: "1:743336103118:web:1f413c59546e5644f3549f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById('form-login');
const msgErro = document.getElementById('msg-erro');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const senha = document.getElementById('login-senha').value;

    // Tenta logar no Firebase
    signInWithEmailAndPassword(auth, email, senha)
        .then((userCredential) => {
            // Sucesso! Vai para a tela do Admin
            window.location.href = "admin.html";
        })
        .catch((error) => {
            // Erro (Senha errada ou usuário não existe)
            msgErro.style.display = 'block';
            console.error("Erro no login:", error.code);
        });
});