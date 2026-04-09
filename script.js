// 1. BANCO DE DADOS SIMULADO
const servicos = [
    { id: 1, nome: "Corte Clássico", preco: 45.00 },
    { id: 2, nome: "Corte + Barba", preco: 70.00 },
    { id: 3, nome: "Barba Terapia", preco: 35.00 },
    { id: 4, nome: "Corte Infantil", preco: 40.00 }
];

const barbeiros = [
    { id: 1, nome: "Mário", especialidade: "Todos os serviços", telefone: "5511998970012" },
    { id: 2, nome: "Marquinho", especialidade: "Todos os serviços", telefone: "5511943415447" }
];

const horariosDisponiveis = [
    "09:00", "09:30", "10:00", "10:30", "11:00", 
    "14:00", "14:30", "15:00", "15:30", "16:00"
];

// 2. CAPTURANDO OS ELEMENTOS HTML
const selectServico = document.getElementById('select-servico');
const selectBarbeiro = document.getElementById('select-barbeiro');
const selectHorario = document.getElementById('select-horario');
const formAgendamento = document.getElementById('form-agendamento');
const inputData = document.getElementById('input-data');

// 3. INJETANDO OS DADOS NA TELA
function preencherServicos() {
    servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id; 
        option.textContent = `${servico.nome} - R$ ${servico.preco.toFixed(2)}`;
        selectServico.appendChild(option);
    });
}

function preencherBarbeiros() {
    barbeiros.forEach(barbeiro => {
        const option = document.createElement('option');
        option.value = barbeiro.id;
        option.textContent = `${barbeiro.nome} - ${barbeiro.especialidade}`;
        selectBarbeiro.appendChild(option);
    });
}

function preencherHorarios() {
    horariosDisponiveis.forEach(horario => {
        const option = document.createElement('option');
        option.value = horario; 
        option.textContent = horario;
        selectHorario.appendChild(option);
    });
}

preencherServicos();
preencherBarbeiros();
preencherHorarios();

// 4. LÓGICA DO BOTÃO E WHATSAPP
formAgendamento.addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    // Capturando os valores escolhidos
    const idServicoEscolhido = selectServico.value;
    const idBarbeiroEscolhido = selectBarbeiro.value;
    const dataEscolhida = inputData.value;
    const horarioEscolhido = selectHorario.value;
    const nomeCliente = document.getElementById('input-nome').value;
    const whatsappCliente = document.getElementById('input-whatsapp').value;

    // Buscando os dados completos nas listas
    const servicoCompleto = servicos.find(servico => servico.id == idServicoEscolhido);
    const barbeiroCompleto = barbeiros.find(barbeiro => barbeiro.id == idBarbeiroEscolhido);
    const dataFormatada = dataEscolhida.split('-').reverse().join('/');

    // Resumo visual para a tela
    const mensagemTela = `
        <strong>Cliente:</strong> ${nomeCliente} (${whatsappCliente})<br>
        <strong>Serviço:</strong> ${servicoCompleto.nome} (R$ ${servicoCompleto.preco.toFixed(2)})<br>
        <strong>Profissional:</strong> ${barbeiroCompleto.nome}<br>
        <strong>Data:</strong> ${dataFormatada} às ${horarioEscolhido}
    `;

    // Resumo para o WhatsApp
    const textoParaWhatsApp = `Olá ${barbeiroCompleto.nome}! Temos um novo agendamento:\n\n👤 Cliente: ${nomeCliente} (${whatsappCliente})\n✂️ Serviço: ${servicoCompleto.nome}\n📅 Data: ${dataFormatada} às ${horarioEscolhido}`;
    const textoCodificado = encodeURIComponent(textoParaWhatsApp);
    const linkWhatsApp = `https://wa.me/${barbeiroCompleto.telefone}?text=${textoCodificado}`;

    // Botão dinâmico do WhatsApp
    const htmlBotaoZap = `
        <a href="${linkWhatsApp}" target="_blank" style="display: block; background-color: #25D366; color: white; text-decoration: none; padding: 15px; border-radius: 6px; font-weight: bold; margin-top: 20px; transition: 0.3s; font-size: 1.1rem;">
            📱 Confirmar via WhatsApp
        </a>
    `;

    // Atualizando o HTML
    document.getElementById('texto-comprovante').innerHTML = mensagemTela + htmlBotaoZap;
    
    // Trocando as telas
    formAgendamento.style.display = 'none'; 
    document.getElementById('comprovante').style.display = 'block'; 
});

    // Impede selecionar datas passadas no calendário
function configurarDataMinima() {
    const hoje = new Date();
    // Formata a data de hoje para o padrão AAAA-MM-DD que o HTML exige
    const hojeFormatado = hoje.toISOString().split('T')[0];
    // Define o atributo "min" do campo de data
    inputData.min = hojeFormatado;
    // Define a data de hoje como valor padrão ao abrir o site
    inputData.value = hojeFormatado;
}

// Chame a função logo no início
configurarDataMinima();