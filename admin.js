import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

// FUNÇÃO PARA CANCELAR (EXCLUIR) O AGENDAMENTO
async function cancelarAgendamento(id) {
    const confirmacao = confirm("Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.");
    
    if (confirmacao) {
        try {
            await deleteDoc(doc(db, "agendamentos", id));
            alert("Agendamento cancelado com sucesso!");
            carregarAgenda();
        } catch (erro) {
            console.error("Erro ao cancelar:", erro);
            alert("Erro ao tentar cancelar o agendamento.");
        }
    }
}

async function carregarAgenda() {
    let faturamentoTotal = 0;

    try {
        const regraBusca = query(collection(db, "agendamentos"), orderBy("timestamp", "desc"));
        const resultado = await getDocs(regraBusca);
        
        containerAgendamentos.innerHTML = ''; 

        if (resultado.empty) {
            containerAgendamentos.innerHTML = '<p style="text-align: center;">Nenhum agendamento encontrado.</p>';
            const titulo = document.querySelector('h2');
            if (titulo) titulo.innerHTML = `Agenda - Faturamento: R$ 0,00`;
            return;
        }

        resultado.forEach((documento) => {
            const dados = documento.data();
            const id = documento.id;
            
            const valorServico = parseFloat(dados.valor) || 0;
            faturamentoTotal += valorServico;

            const divCard = document.createElement('div');
            divCard.className = 'card-agendamento';
            divCard.style.position = 'relative';
            
            const corPgto = dados.pagamento === 'pix' ? '#25D366' : '#f3ad16';

            divCard.innerHTML = `
                <p><span>📅 Data:</span> ${dados.data} às ${dados.horario}</p>
                <p><span>👤 Cliente:</span> ${dados.cliente} (${dados.contato || 'Sem Tel'})</p>
                <p><span>✂️ Serviço:</span> ${dados.servico} (R$ ${valorServico.toFixed(2)})</p>
                <p><span>💰 Pgto:</span> <span style="color: ${corPgto}; font-weight: bold;">${dados.pagamento?.toUpperCase() || 'N/A'}</span></p>
                <button class="btn-cancelar" data-id="${id}" style="background: #ff4d4d; color: white; margin-top: 10px; padding: 8px; font-size: 13px; width: auto; display: inline-block;">
                    ❌ Cancelar Agendamento
                </button>
            `;
            
            containerAgendamentos.appendChild(divCard);
        });

        document.querySelectorAll('.btn-cancelar').forEach(botao => {
            botao.addEventListener('click', () => {
                const idAgendamento = botao.getAttribute('data-id');
                cancelarAgendamento(idAgendamento);
            });
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

// FILTRO POR DATA
document.getElementById('btn-filtrar').addEventListener('click', () => {
    const filtro = document.getElementById('filtro-data').value;
    if (!filtro) {
        alert("Escolha uma data para filtrar!");
        return;
    }
    const dataBR = filtro.split('-').reverse().join('/');
    const cards = document.querySelectorAll('.card-agendamento');
    cards.forEach(card => {
        const textoData = card.querySelector('p').textContent;
        card.style.display = textoData.includes(dataBR) ? 'block' : 'none';
    });
});

document.getElementById('btn-todos').addEventListener('click', () => {
    const cards = document.querySelectorAll('.card-agendamento');
    cards.forEach(card => card.style.display = 'block');
});
