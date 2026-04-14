// Importando o SDK do Firebase (Versão CDN para navegador)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Suas chaves de conexão (Puxadas do seu print do Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBpFhgPMtUffKzs_yKFhzPzvCe0WsTICQk",
  authDomain: "sistema-barbearia-neguinho.firebaseapp.com",
  projectId: "sistema-barbearia-neguinho",
  storageBucket: "sistema-barbearia-neguinho.firebasestorage.app",
  messagingSenderId: "743336103118",
  appId: "1:743336103118:web:1f413c59546e5644f3549f"
};

// Start no banco
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dados da Barbearia
const servicos = [
    { id: 1, nome: "Corte de Cabelo", preco: 45.00 },
    { id: 2, nome: "Barba", preco: 35.00 },
    { id: 3, nome: "Corte + Barba", preco: 70.00 },
    { id: 4, nome: "Sobrancelha", preco: 15.00 }
];

const barbeiros = [
    { id: 1, nome: "Mário", telefone: "5511998970012" }, 
    { id: 2, nome: "Marquinho", telefone: "5511943415447" }
];

const horariosDisponiveis = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00"
];

// Mapeando o DOM
const selectServico = document.getElementById('select-servico');
const selectBarbeiro = document.getElementById('select-barbeiro');
const selectHorario = document.getElementById('select-horario');
const formAgendamento = document.getElementById('form-agendamento');
const inputData = document.getElementById('input-data');

// Popula os selects via JS
function init() {
    servicos.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id; 
        opt.textContent = `${s.nome} - R$ ${s.preco.toFixed(2)}`;
        selectServico.appendChild(opt);
    });

    barbeiros.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.nome;
        selectBarbeiro.appendChild(opt);
    });

    horariosDisponiveis.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h; 
        opt.textContent = h;
        selectHorario.appendChild(opt);
    });

    const hoje = new Date();
    inputData.min = hoje.toISOString().split('T')[0];
    inputData.value = hoje.toISOString().split('T')[0];
}

init();

// Evento de envio
formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const idServico = parseInt(selectServico.value);
    const idBarbeiro = parseInt(selectBarbeiro.value);
    const dataEscolhida = inputData.value;
    const horarioEscolhido = selectHorario.value;
    const nomeCliente = document.getElementById('input-nome').value;
    const whatsappCliente = document.getElementById('input-whatsapp').value;

    const servico = servicos.find(s => s.id === idServico);
    const barbeiro = barbeiros.find(b => b.id === idBarbeiro);
    const dataBR = dataEscolhida.split('-').reverse().join('/');

    // DISPARO PRO FIREBASE
    try {
        await addDoc(collection(db, "agendamentos"), {
            cliente: nomeCliente,
            contato: whatsappCliente,
            servico: servico.nome,
            profissional: barbeiro.nome,
            data: dataBR,
            horario: horarioEscolhido,
            timestamp: new Date()
        });
        console.log("Feito! Gravado no Google.");
    } catch (err) {
        console.error("Erro ao salvar:", err);
    }

    // Feedback visual e Zap
    const textoZap = `Olá ${barbeiro.nome}! Novo agendamento:\n\n👤 *Cliente:* ${nomeCliente}\n✂️ *Serviço:* ${servico.nome}\n📅 *Data:* ${dataBR} às ${horarioEscolhido}`;
    const linkWhatsApp = `https://wa.me/${barbeiro.telefone}?text=${encodeURIComponent(textoZap)}`;

    document.getElementById('texto-comprovante').innerHTML = `
        <strong>Confirmado:</strong> ${nomeCliente}<br>
        <strong>Serviço:</strong> ${servico.nome}<br>
        <strong>Barbeiro:</strong> ${barbeiro.nome}<br>
        <strong>Data:</strong> ${dataBR} às ${horarioEscolhido}
        <a href="${linkWhatsApp}" target="_blank" style="display: block; background: #25D366; color: white; padding: 15px; border-radius: 6px; text-align: center; font-weight: bold; margin-top: 20px; text-decoration: none;">
            📱 Confirmar no WhatsApp
        </a>
    `;

    formAgendamento.style.display = 'none'; 
    document.getElementById('comprovante').style.display = 'block'; 
});