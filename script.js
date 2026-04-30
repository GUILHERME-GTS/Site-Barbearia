import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// 1. CONFIGURAÇÃO DO SEU FIREBASE
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

// 2. DADOS DOS PROFISSIONAIS E SERVIÇOS
const servicos = [
    { id: 1, nome: "Corte de Cabelo", preco: 45.00 },
    { id: 2, nome: "Barba", preco: 35.00 },
    { id: 3, nome: "Corte + Barba", preco: 70.00 },
    { id: 4, nome: "Sobrancelha", preco: 15.00 }
];

const barbeiros = [
    { id: 1, nome: "Mário", telefone: "5511998970012" }, 
    { id: 2, nome: "Marquinho", telefone: "5511943415447" },
    { id: 3, nome: "Guilherme TESTES", telefone: "5511941455171" }
];

const todosHorarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

// 3. SELEÇÃO DE ELEMENTOS
const selectServico = document.getElementById('select-servico');
const selectBarbeiro = document.getElementById('select-barbeiro');
const selectHorario = document.getElementById('select-horario');
const selectPagamento = document.getElementById('select-pagamento');
const inputData = document.getElementById('input-data');
const formAgendamento = document.getElementById('form-agendamento');

// 4. INICIALIZAÇÃO DA INTERFACE
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

    const hoje = new Date();
    inputData.min = hoje.toISOString().split('T')[0];
    inputData.value = hoje.toISOString().split('T')[0];
    
    atualizarHorariosDisponiveis();
}

// 5. FILTRO DINÂMICO DE HORÁRIOS (EVITA OVERBOOKING)
async function atualizarHorariosDisponiveis() {
    const dataBR = inputData.value.split('-').reverse().join('/');
    const idBarbeiro = parseInt(selectBarbeiro.value);
    const barbeiro = barbeiros.find(b => b.id === idBarbeiro);

    if (!barbeiro || !dataBR) return;

    selectHorario.innerHTML = '<option value="">Consultando agenda...</option>';

    try {
        const q = query(collection(db, "agendamentos"), 
                  where("data", "==", dataBR), 
                  where("profissional", "==", barbeiro.nome));
        
        const querySnapshot = await getDocs(q);
        const ocupados = [];
        querySnapshot.forEach((doc) => ocupados.push(doc.data().horario));

        const disponiveis = todosHorarios.filter(h => !ocupados.includes(h));

        selectHorario.innerHTML = '<option value="">Escolha o horário...</option>';
        disponiveis.forEach(h => {
            const opt = document.createElement('option');
            opt.value = h;
            opt.textContent = h;
            selectHorario.appendChild(opt);
        });
    } catch (err) {
        console.error("Erro ao ler agenda:", err);
    }
}

// 6. EVENTOS DE MUDANÇA
selectBarbeiro.addEventListener('change', atualizarHorariosDisponiveis);
inputData.addEventListener('change', atualizarHorariosDisponiveis);

init();

// 7. ENVIO DO FORMULÁRIO
formAgendamento.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    
    const btnAgendar = document.getElementById('btn-agendar');
    btnAgendar.disabled = true;
    btnAgendar.textContent = "Processando...";

    const idServico = parseInt(selectServico.value);
    const idBarbeiro = parseInt(selectBarbeiro.value);
    const dataBR = inputData.value.split('-').reverse().join('/');
    const horarioEscolhido = selectHorario.value;
    const nomeCliente = document.getElementById('input-nome').value;
    const whatsappCliente = document.getElementById('input-whatsapp').value;
    const metodoPagamento = selectPagamento.value;

    const servico = servicos.find(s => s.id === idServico);
    const barbeiro = barbeiros.find(b => b.id === idBarbeiro);

    try {
        // Salva no Firestore
        const docRef = await addDoc(collection(db, "agendamentos"), {
            cliente: nomeCliente,
            contato: whatsappCliente,
            servico: servico.nome,
            valor: servico.preco,
            profissional: barbeiro.nome,
            data: dataBR,
            horario: horarioEscolhido,
            pagamento: metodoPagamento,
            status: "pendente",
            timestamp: new Date()
        });

        // Define a URL base para o link de cancelamento
        let urlBase = window.location.href.split('index.html')[0].split('#')[0];
        if (urlBase.includes('127.0.0.1') || urlBase.includes('localhost')) {
            urlBase = "https://guilherme-gts.github.io/Site-Barbearia/";
        }
        const linkCancelamento = `${urlBase}cancelar.html?id=${docRef.id}`;
        
        // FORMATAÇÃO DA MENSAGEM PARA WHATSAPP
        const divisor = "==========================";
        let textoZap = `✂️ *BARBEARIA DO NEGUINHO* ✂️\n`;
        textoZap += `_Sua agenda digital_\n\n`;
        textoZap += `🗓️ *MEU AGENDAMENTO*\n\n`;
        textoZap += `👤 *CLIENTE:* ${nomeCliente}\n`;
        textoZap += `📞 *TEL:* ${whatsappCliente}\n`;
        textoZap += `${divisor}\n`;
        textoZap += `📆 *DIA:* ${dataBR}\n`;
        textoZap += `⏰ *HORA:* ${horarioEscolhido}\n\n`;
        textoZap += `💈 *BARBEIRO:* ${barbeiro.nome}\n`;
        textoZap += `✂️ *SERVIÇO:* ${servico.nome}\n`;
        textoZap += `💰 *VALOR:* R$ ${servico.preco.toFixed(2)}\n`;
        textoZap += `💳 *PGTO:* ${metodoPagamento.toUpperCase()}\n`;
        textoZap += `${divisor}\n\n`;
        
        if (metodoPagamento === 'pix') {
            textoZap += `✅ *COMPROVANTE:* [Anexe o print aqui]\n\n`;
        }

        textoZap += `❌ *PARA CANCELAR:*\n`;
        textoZap += `${linkCancelamento}\n\n`;
        textoZap += `_Comprovante gerado pelo site_`;

        const linkWhatsApp = `https://wa.me/${barbeiro.telefone}?text=${encodeURIComponent(textoZap)}`;

        // ATUALIZA A TELA COM O RESULTADO
        document.getElementById('texto-comprovante').innerHTML = `
            <strong>Confirmado com sucesso!</strong><br>
            <strong>Cliente:</strong> ${nomeCliente}<br>
            <strong>Data:</strong> ${dataBR} às ${horarioEscolhido}<br>
            <br>
            <a href="${linkWhatsApp}" target="_blank" style="display: block; background: #25D366; color: white; padding: 15px; border-radius: 6px; text-align: center; font-weight: bold; margin-top: 10px; text-decoration: none;">
                📱 ENVIAR NO WHATSAPP
            </a>
            <p style="font-size: 11px; color: #777; margin-top: 10px;">Clique no botão acima para avisar o barbeiro.</p>
        `;

        formAgendamento.style.display = 'none'; 
        document.getElementById('comprovante').style.display = 'block'; 

    } catch (err) {
        console.error("Erro fatal ao salvar agendamento:", err);
        alert("Erro técnico ao salvar. Verifique sua conexão.");
        btnAgendar.disabled = false;
        btnAgendar.textContent = "Confirmar Agendamento";
    }
});