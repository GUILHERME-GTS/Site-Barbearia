import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
const auth = getAuth(app);

const containerAgendamentos = document.getElementById('lista-agendamentos');

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
    } else {
        carregarAgenda(); 
    }
});

async function carregarAgenda() {
    let faturamentoTotal = 0;

    try {
        const regraBusca = query(collection(db, "agendamentos"), orderBy("timestamp", "desc"));
        const resultado = await getDocs(regraBusca);
        
        containerAgendamentos.innerHTML = ''; 

        if (resultado.empty) {
            containerAgendamentos.innerHTML = '<p style="text-align: center;">Nenhum agendamento encontrado.</p>';
            return;
        }

        resultado.forEach((doc) => {
            const dados = doc.data();
            
            const valorServico = parseFloat(dados.valor) || 0;
            faturamentoTotal += valorServico;

            const divCard = document.createElement('div');
            divCard.className = 'card-agendamento';
            
            const corPgto = dados.pagamento === 'pix' ? '#25D366' : '#f3ad16';
            const statusLabel = dados.status === 'pago' ? '✅ Pago' : '⏳ Pendente';

            divCard.innerHTML = `
                <p><span>📅 Data:</span> ${dados.data} às ${dados.horario}</p>
                <p><span>👤 Cliente:</span> ${dados.cliente} (${dados.contato || 'Sem Tel'})</p>
                <p><span>✂️ Serviço:</span> ${dados.servico} (R$ ${valorServico.toFixed(2)})</p>
                <p><span>💰 Pagamento:</span> <span style="color: ${corPgto}; font-weight: bold;">${dados.pagamento?.toUpperCase() || 'N/A'}</span></p>
                <p><span>📌 Status:</span> <strong>${statusLabel}</strong></p>
            `;
            
            containerAgendamentos.appendChild(divCard);
        });

        const titulo = document.querySelector('h2');
        if (titulo) {
            titulo.innerHTML = `Agenda - Faturamento: R$ ${faturamentoTotal.toFixed(2)}`;
        }
    } catch (erro) {
        console.error("Erro ao carregar a agenda:", erro);
        containerAgendamentos.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar os dados.</p>';
    }
}