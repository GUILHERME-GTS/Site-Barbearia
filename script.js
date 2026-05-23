import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

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

let servicos = [];
let barbeiros = [];
const todosHorarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

const selectServico = document.getElementById('select-servico');
const selectBarbeiro = document.getElementById('select-barbeiro');
const selectHorario = document.getElementById('select-horario');
const inputData = document.getElementById('input-data');
const formAgendamento = document.getElementById('form-agendamento');

async function init() {
    try {
        selectServico.innerHTML = '<option value="">Carregando...</option>';
        selectBarbeiro.innerHTML = '<option value="">Carregando...</option>';
        servicos = []; barbeiros = [];

        const snapServ = await getDocs(collection(db, "servicos"));
        selectServico.innerHTML = '<option value="">O que vamos fazer?</option>';
        snapServ.forEach(doc => {
            const d = doc.data();
            servicos.push({ id: doc.id, ...d });
            const opt = document.createElement('option');
            opt.value = doc.id;
            opt.textContent = `${d.nome} - R$ ${Number(d.preco).toFixed(2)}`;
            selectServico.appendChild(opt);
        });

        const snapBarb = await getDocs(collection(db, "barbeiros"));
        selectBarbeiro.innerHTML = '<option value="">Escolha seu Barbeiro:</option>';
        snapBarb.forEach(doc => {
            const d = doc.data();
            barbeiros.push({ id: doc.id, ...d });
            const opt = document.createElement('option');
            opt.value = doc.id; opt.textContent = d.nome;
            selectBarbeiro.appendChild(opt);
        });

        const hoje = new Date();
        inputData.min = hoje.toISOString().split('T')[0];
        inputData.value = hoje.toISOString().split('T')[0];
        atualizarHorariosDisponiveis();
    } catch (err) { console.error(err); }
}

async function atualizarHorariosDisponiveis() {
    const dataBR = inputData.value.split('-').reverse().join('/');
    const idBarb = selectBarbeiro.value;
    const barb = barbeiros.find(b => b.id === idBarb);
    if (!barb || !dataBR) return;

    selectHorario.innerHTML = '<option value="">Verificando horários...</option>';
    try {
        const q = query(collection(db, "agendamentos"), where("data", "==", dataBR), where("profissional", "==", barb.nome));
        const snap = await getDocs(q);
        const ocupados = [];
        snap.forEach(doc => ocupados.push(doc.data().horario));
        const disponiveis = todosHorarios.filter(h => !ocupados.includes(h));
        selectHorario.innerHTML = '<option value="">Escolha um horário...</option>';
        disponiveis.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h; opt.textContent = h;
            selectHorario.appendChild(opt);
        });
    } catch (err) { console.error(err); }
}

selectBarbeiro.addEventListener('change', atualizarHorariosDisponiveis);
inputData.addEventListener('change', atualizarHorariosDisponiveis);
init();

formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-agendar');
    btn.disabled = true; btn.textContent = "Agendando...";

    const serv = servicos.find(s => s.id === selectServico.value);
    const barb = barbeiros.find(b => b.id === selectBarbeiro.value);
    const dataBR = inputData.value.split('-').reverse().join('/');
    const hora = selectHorario.value;
    const nome = document.getElementById('input-nome').value;
    const zap = document.getElementById('input-whatsapp').value.replace(/\D/g, '');
    const pgto = document.getElementById('select-pagamento').value;

    // Validação do WhatsApp
    if (zap.length < 10 || zap.length > 11) {
        alert("⚠️ Digite um WhatsApp válido com DDD! Ex: 11999999999");
        btn.disabled = false;
        btn.textContent = "CONFIRMAR AGENDAMENTO";
        return;
    }

    try {
        const docRef = await addDoc(collection(db, "agendamentos"), {
            cliente: nome, contato: zap, servico: serv.nome, valor: serv.preco, profissional: barb.nome,
            data: dataBR, horario: hora, pagamento: pgto, status: "pendente", timestamp: new Date()
        });

        let urlBase = window.location.href.split('index.html')[0].split('#')[0];
        if (urlBase.includes('127.0.0.1') || urlBase.includes('localhost')) urlBase = "https://guilherme-gts.github.io/Site-Barbearia/";
        const linkCancela = `${urlBase}cancelar.html?id=${docRef.id}`;

        const div = "==========================";
        let msg = `✂️ *BARBEARIA DO NEGUINHO* ✂️\n\n👤 *CLIENTE:* ${nome}\n📞 *TEL:* ${zap}\n${div}\n`;
        msg += `📆 *DATA:* ${dataBR}\n⏰ *HORA:* ${hora}\n\n💈 *BARBEIRO:* ${barb.nome}\n✂️ *SERVIÇO:* ${serv.nome}\n💰 *VALOR:* R$ ${Number(serv.preco).toFixed(2)}\n💳 *PGTO:* ${pgto.toUpperCase()}\n${div}\n\n❌ *CANCELAR:* ${linkCancela}`;

        const linkZap = `https://wa.me/${barb.telefone}?text=${encodeURIComponent(msg)}`;

        document.getElementById('texto-comprovante').innerHTML = `
            <h3 style="color:#25D366">✓ Agendado com Sucesso!</h3>
            <p style="color:#fff; margin: 15px 0;">Tudo certo para dia <strong>${dataBR}</strong> às <strong>${hora}</strong>.</p>
            <a href="${linkZap}" target="_blank" style="display:inline-block; background:#25D366; color:white; padding:15px 25px; border-radius:8px; text-decoration:none; font-weight:bold;">📱 ENVIAR NO WHATSAPP</a>
        `;
        formAgendamento.style.display = 'none';
        document.getElementById('comprovante').style.display = 'block';
    } catch (err) { alert("Erro ao salvar."); btn.disabled = false; btn.textContent = "CONFIRMAR AGENDAMENTO"; }
});

// PWA
let promptInstala;
const boxInstala = document.getElementById('install-container');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstala = e; if(boxInstala) boxInstala.style.display = 'block'; });
document.getElementById('btn-install')?.addEventListener('click', () => { if(promptInstala) { promptInstala.prompt(); promptInstala = null; boxInstala.style.display = 'none'; } });
document.getElementById('btn-close-install')?.addEventListener('click', () => boxInstala.style.display = 'none');
