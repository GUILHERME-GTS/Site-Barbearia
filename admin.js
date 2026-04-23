import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Suas chaves de conexão
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

const containerAgendamentos = document.getElementById('lista-agendamentos');

async function carregarAgenda() {
    try {
        // Busca os dados ordenados do mais recente para o mais antigo
        const regraBusca = query(collection(db, "agendamentos"), orderBy("timestamp", "desc"));
        const resultado = await getDocs(regraBusca);
        
        containerAgendamentos.innerHTML = ''; // Limpa a mensagem de "Carregando..."

        if (resultado.empty) {
            containerAgendamentos.innerHTML = '<p style="text-align: center;">Nenhum agendamento encontrado.</p>';
            return;
        }

        // Para cada agendamento no banco, cria um "Card" na tela
        resultado.forEach((doc) => {
            const dados = doc.data();
            
            const divCard = document.createElement('div');
            divCard.className = 'card-agendamento';
            
            divCard.innerHTML = `
                <p><span>📅 Data:</span> ${dados.data} às ${dados.horario}</p>
                <p><span>👤 Cliente:</span> ${dados.cliente} (${dados.contato})</p>
                <p><span>✂️ Serviço:</span> ${dados.servico}</p>
                <p><span>💈 Barbeiro:</span> ${dados.profissional}</p>
            `;
            
            containerAgendamentos.appendChild(divCard);
        });

    } catch (erro) {
        console.error("Erro ao carregar a agenda:", erro);
        containerAgendamentos.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar os dados. Verifique o console.</p>';
    }
}

// Roda a função assim que a página abre
carregarAgenda();