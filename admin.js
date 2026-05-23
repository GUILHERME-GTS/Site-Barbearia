import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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
        carregarServicos();
        carregarBarbeiros();
    }
});

// ============================================================
// ABA AGENDA
// ============================================================
async function cancelarAgendamento(id) {
    const confirmacao = confirm("Tem certeza que deseja cancelar este agendamento?");
    if (confirmacao) {
        try {
            await deleteDoc(doc(db, "agendamentos", id));
            alert("Agendamento cancelado com sucesso!");
            carregarAgenda();
        } catch (erro) {
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
            document.querySelector('h2').innerHTML = `Agenda - Faturamento: R$ 0,00`;
            return;
        }

        resultado.forEach((documento) => {
            const dados = documento.data();
            const id = documento.id;
            const valorServico = parseFloat(dados.valor) || 0;
            faturamentoTotal += valorServico;

            const divCard = document.createElement('div');
            divCard.className = 'card-agendamento';
            const corPgto = dados.pagamento === 'pix' ? '#25D366' : '#f3ad16';
            divCard.innerHTML = `
                <p><span>📅 Data:</span> ${dados.data} às ${dados.horario}</p>
                <p><span>👤 Cliente:</span> ${dados.cliente} (${dados.contato || 'Sem Tel'})</p>
                <p><span>✂️ Serviço:</span> ${dados.servico} (R$ ${valorServico.toFixed(2)})</p>
                <p><span>💰 Pgto:</span> <span style="color: ${corPgto}; font-weight: bold;">${dados.pagamento?.toUpperCase() || 'N/A'}</span></p>
                <button class="btn-cancelar" data-id="${id}">❌ Cancelar Agendamento</button>
            `;
            containerAgendamentos.appendChild(divCard);
        });

        document.querySelectorAll('.btn-cancelar').forEach(botao => {
            botao.addEventListener('click', () => cancelarAgendamento(botao.getAttribute('data-id')));
        });

        document.querySelector('h2').innerHTML = `Agenda - Faturamento: R$ ${faturamentoTotal.toFixed(2)}`;
    } catch (erro) {
        containerAgendamentos.innerHTML = '<p style="color: red; text-align: center;">Erro ao carregar os dados.</p>';
    }
}

document.getElementById('btn-filtrar').addEventListener('click', () => {
    const filtro = document.getElementById('filtro-data').value;
    if (!filtro) { alert("Escolha uma data para filtrar!"); return; }
    const dataBR = filtro.split('-').reverse().join('/');
    document.querySelectorAll('.card-agendamento').forEach(card => {
        card.style.display = card.querySelector('p').textContent.includes(dataBR) ? 'block' : 'none';
    });
});

document.getElementById('btn-todos').addEventListener('click', () => {
    document.querySelectorAll('.card-agendamento').forEach(card => card.style.display = 'block');
});

// ============================================================
// ABA GERENCIAR - SERVIÇOS
// ============================================================
async function carregarServicos() {
    const lista = document.getElementById('lista-servicos');
    lista.innerHTML = '<p style="color:#888; text-align:center;">Carregando...</p>';
    try {
        const snap = await getDocs(collection(db, "servicos"));
        lista.innerHTML = '';
        snap.forEach(documento => {
            const d = documento.data();
            const item = document.createElement('div');
            item.className = 'item-lista';
            item.innerHTML = `
                <span>${d.nome} — R$ ${Number(d.preco).toFixed(2)}</span>
                <button class="btn-remover" data-id="${documento.id}">Remover</button>
            `;
            lista.appendChild(item);
        });
        lista.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm("Remover este serviço?")) {
                    await deleteDoc(doc(db, "servicos", btn.getAttribute('data-id')));
                    carregarServicos();
                }
            });
        });
    } catch (erro) {
        lista.innerHTML = '<p style="color:red;">Erro ao carregar serviços.</p>';
    }
}

document.getElementById('btn-add-servico').addEventListener('click', async () => {
    const nome = document.getElementById('input-nome-servico').value.trim();
    const preco = document.getElementById('input-preco-servico').value.trim();
    if (!nome || !preco) { alert("Preencha o nome e o preço!"); return; }
    try {
        await addDoc(collection(db, "servicos"), { nome, preco: Number(preco) });
        document.getElementById('input-nome-servico').value = '';
        document.getElementById('input-preco-servico').value = '';
        carregarServicos();
        alert("Serviço adicionado com sucesso!");
    } catch (erro) {
        console.error(erro);
        alert("Erro ao adicionar serviço. Verifique se está logado.");
    }
});

// ============================================================
// ABA GERENCIAR - BARBEIROS
// ============================================================
async function carregarBarbeiros() {
    const lista = document.getElementById('lista-barbeiros');
    lista.innerHTML = '<p style="color:#888; text-align:center;">Carregando...</p>';
    try {
        const snap = await getDocs(collection(db, "barbeiros"));
        lista.innerHTML = '';
        snap.forEach(documento => {
            const d = documento.data();
            const item = document.createElement('div');
            item.className = 'item-lista';
            item.innerHTML = `
                <span>${d.nome} — ${d.telefone}</span>
                <button class="btn-remover" data-id="${documento.id}">Remover</button>
            `;
            lista.appendChild(item);
        });
        lista.querySelectorAll('.btn-remover').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm("Remover este barbeiro?")) {
                    await deleteDoc(doc(db, "barbeiros", btn.getAttribute('data-id')));
                    carregarBarbeiros();
                }
            });
        });
    } catch (erro) {
        lista.innerHTML = '<p style="color:red;">Erro ao carregar barbeiros.</p>';
    }
}

document.getElementById('btn-add-barbeiro').addEventListener('click', async () => {
    const nome = document.getElementById('input-nome-barbeiro').value.trim();
    const telefone = document.getElementById('input-tel-barbeiro').value.replace(/\D/g, '');
    if (!nome || !telefone) { alert("Preencha o nome e o telefone!"); return; }
    if (telefone.length < 10 || telefone.length > 11) { alert("Telefone inválido! Use DDD + número."); return; }
    try {
        await addDoc(collection(db, "barbeiros"), { nome, telefone });
        document.getElementById('input-nome-barbeiro').value = '';
        document.getElementById('input-tel-barbeiro').value = '';
        carregarBarbeiros();
        alert("Barbeiro adicionado com sucesso!");
    } catch (erro) {
        console.error(erro);
        alert("Erro ao adicionar barbeiro. Verifique se está logado.");
    }
});