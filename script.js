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

const servicos = [
    { id: 1, nome: "Corte de Cabelo", preco: 45.00 },
    { id: 2, nome: "Barba", preco: 35.00 },
    { id: 3, nome: "Corte + Barba", preco: 70.00 },
    { id: 4, nome: "Sobrancelha", preco: 15.00 }
];

const barbeiros = [
    { id: 1, nome: "Mário", telefone: "5511941455171" }, 
    { id: 2, nome: "Marquinho", telefone: "5511943415447" }
];

const todosHorarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

const selectServico = document.getElementById('select-servico');
const selectBarbeiro = document.getElementById('select-barbeiro');
const selectHorario = document.getElementById('select-horario');
const selectPagamento = document.getElementById('select-pagamento');
const inputData = document.getElementById('input-data');
const formAgendamento = document.getElementById('form-agendamento');

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

async function gerarPagamentoMercadoPago(servico, cliente) {
    const access_token = "COLE_SEU_ACCESS_TOKEN_AQUI"; 

    const dadosPagamento = {
        items: [{ title: servico.nome, unit_price: servico.preco, quantity: 1, currency_id: "BRL" }],
        payer: { name: cliente.nome },
        back_urls: {
            success: window.location.href.replace("index.html", ""),
            failure: window.location.href.replace("index.html", "")
        },
        auto_return: "approved"
    };

    try {
        const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
            method: "POST",
            headers: { "Authorization": `Bearer ${access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify(dadosPagamento)
        });
        const data = await response.json();
        return data.init_point; 
    } catch (error) {
        return null;
    }
}

selectBarbeiro.addEventListener('change', atualizarHorariosDisponiveis);
inputData.addEventListener('change', atualizarHorariosDisponiveis);

init();

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
        let linkMP = null;
        if (metodoPagamento === 'pix') {
            linkMP = await gerarPagamentoMercadoPago(servico, { nome: nomeCliente });
        }

        await addDoc(collection(db, "agendamentos"), {
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
        
        let htmlComprovante = `<strong>Confirmado:</strong> ${nomeCliente}<br><strong>Serviço:</strong> ${servico.nome}<br><strong>Data:</strong> ${dataBR} às ${horarioEscolhido}<br>`;

        if (metodoPagamento === 'pix' && linkMP) {
            htmlComprovante += `<div style="background: #e1f5fe; padding: 15px; border-radius: 8px; margin-top: 15px;"><a href="${linkMP}" target="_blank" style="display: block; background: #009EE3; color: white; padding: 15px; border-radius: 6px; text-align: center; font-weight: bold; margin-top: 10px; text-decoration: none;">💳 PAGAR PIX AGORA</a></div>`;
        }

        let textoZap = `Olá ${barbeiro.nome}! Novo agendamento:\n\n👤 *Cliente:* ${nomeCliente}\n✂️ *Serviço:* ${servico.nome}\n📅 *Data:* ${dataBR} às ${horarioEscolhido}\n💰 *Pgto:* ${metodoPagamento.toUpperCase()}`;
        
        // Se for Pix, adiciona um lembrete para mandar a foto
        if (metodoPagamento === 'pix') {
            textoZap += `\n\n📄 *Comprovante:* [Anexe a foto do comprovante nesta conversa]`;
        }

        const linkWhatsApp = `https://wa.me/${barbeiro.telefone}?text=${encodeURIComponent(textoZap)}`;

        htmlComprovante += `<a href="${linkWhatsApp}" target="_blank" style="display: block; background: #25D366; color: white; padding: 15px; border-radius: 6px; text-align: center; font-weight: bold; margin-top: 20px; text-decoration: none;">📱 Avisar no WhatsApp</a>`;

        document.getElementById('texto-comprovante').innerHTML = htmlComprovante;
        formAgendamento.style.display = 'none'; 
        document.getElementById('comprovante').style.display = 'block'; 
    } catch (err) {
        alert("Erro. Tente novamente.");
        btnAgendar.disabled = false;
        btnAgendar.textContent = "Confirmar Agendamento";
    }
});