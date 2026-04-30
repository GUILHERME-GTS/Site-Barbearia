import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpFhgPMtUffKzs_yKFhzPzvCe0WsTICQk",
  authDomain: "sistema-barbearia-neguinho.firebaseapp.com",
  projectId: "sistema-barbearia-neguinho",
  storageBucket: "sistema-barbearia-neguinho.firebasestorage.app",
  messagingSenderId: "743336103118",
  appId: "1:743336103118:web:1f413c59546e5644f3549f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Extrai o ID da URL (ex: cancelar.html?id=12345ABC)
const parametrosDaUrl = new URLSearchParams(window.location.search);
const idAgendamento = parametrosDaUrl.get('id');

const btnCancelar = document.getElementById('btn-confirmar-cancelamento');
const msgStatus = document.getElementById('msg-status');
const areaBotoes = document.getElementById('area-botoes');

btnCancelar.addEventListener('click', async () => {
    if (!idAgendamento) {
        msgStatus.style.display = 'block';
        msgStatus.style.color = '#ff4d4d';
        msgStatus.textContent = "Erro: Link de cancelamento inválido.";
        return;
    }

    btnCancelar.disabled = true;
    btnCancelar.textContent = "Cancelando...";

    try {
        await deleteDoc(doc(db, "agendamentos", idAgendamento));
        
        areaBotoes.style.display = 'none';
        msgStatus.style.display = 'block';
        msgStatus.style.color = '#25D366';
        msgStatus.innerHTML = "✅ Agendamento cancelado com sucesso!<br><br><a href='index.html' style='color: #333;'>Voltar ao início</a>";
    } catch (erro) {
        console.error("Erro ao cancelar:", erro);
        msgStatus.style.display = 'block';
        msgStatus.style.color = '#ff4d4d';
        msgStatus.textContent = "Erro ao tentar cancelar. Tente novamente.";
        btnCancelar.disabled = false;
        btnCancelar.textContent = "Sim, quero cancelar";
    }
});