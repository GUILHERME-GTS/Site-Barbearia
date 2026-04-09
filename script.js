// Dados temporários até conectar com um banco de verdade (Firebase/Node)
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

// Horários fixos da barbearia
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

// Popula os selects dinamicamente
function preencherServicos() {
    servicos.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id; 
        opt.textContent = `${s.nome} - R$ ${s.preco.toFixed(2)}`;
        selectServico.appendChild(opt);
    });
}

function preencherBarbeiros() {
    barbeiros.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.id;
        opt.textContent = b.nome;
        selectBarbeiro.appendChild(opt);
    });
}

function preencherHorarios() {
    horariosDisponiveis.forEach(h => {
        const opt = document.createElement('option');
        opt.value = h; 
        opt.textContent = h;
        selectHorario.appendChild(opt);
    });
}

// Trava pra impedir data no passado
function configurarDataMinima() {
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    
    inputData.min = hojeFormatado;
    inputData.value = hojeFormatado; // já deixa pré-preenchido
}

// Init
preencherServicos();
preencherBarbeiros();
preencherHorarios();
configurarDataMinima();

// Disparo do formulário pro WhatsApp
formAgendamento.addEventListener('submit', (e) => {
    e.preventDefault(); 

    // Pega os IDs do form e converte pra número
    const idServico = parseInt(selectServico.value);
    const idBarbeiro = parseInt(selectBarbeiro.value);
    
    const dataEscolhida = inputData.value;
    const horarioEscolhido = selectHorario.value;
    const nomeCliente = document.getElementById('input-nome').value;
    const whatsappCliente = document.getElementById('input-whatsapp').value;

    // Acha os objetos completos nas listas
    const servico = servicos.find(s => s.id === idServico);
    const barbeiro = barbeiros.find(b => b.id === idBarbeiro);
    
    // console.log(servico, barbeiro); // debug

    // Formata data pro padrão BR
    const dataBR = dataEscolhida.split('-').reverse().join('/');

    // Resumo na tela pro cliente conferir
    const msgTela = `
        <strong>Cliente:</strong> ${nomeCliente} (${whatsappCliente})<br>
        <strong>Serviço:</strong> ${servico.nome} (R$ ${servico.preco.toFixed(2)})<br>
        <strong>Profissional:</strong> ${barbeiro.nome}<br>
        <strong>Data:</strong> ${dataBR} às ${horarioEscolhido}
    `;

    // Monta o texto e o link do Zap
    const textoZap = `Olá ${barbeiro.nome}! Temos um novo agendamento no site:\n\n👤 *Cliente:* ${nomeCliente} (${whatsappCliente})\n✂️ *Serviço:* ${servico.nome}\n📅 *Data:* ${dataBR} às ${horarioEscolhido}\n💰 *Valor:* R$ ${servico.preco.toFixed(2)}`;
    
    const linkWhatsApp = `https://wa.me/${barbeiro.telefone}?text=${encodeURIComponent(textoZap)}`;

    const btnZap = `
        <a href="${linkWhatsApp}" target="_blank" style="display: block; background-color: #25D366; color: white; text-decoration: none; padding: 15px; border-radius: 6px; text-align: center; font-weight: bold; margin-top: 20px; transition: 0.3s; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            📱 Confirmar via WhatsApp
        </a>
    `;

    // Esconde form e mostra comprovante
    document.getElementById('texto-comprovante').innerHTML = msgTela + btnZap;
    formAgendamento.style.display = 'none'; 
    document.getElementById('comprovante').style.display = 'block'; 
});