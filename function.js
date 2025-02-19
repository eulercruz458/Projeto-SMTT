const gerarPdf = document.getElementById('gerarPdf');
const trocarCinzaRoxo = document.getElementById('trocarCinzaRoxo');

document.addEventListener("DOMContentLoaded", function() {
    const limparButton = document.getElementById("limparCampos");

    limparButton.addEventListener("click", function() {
        const inputs = document.querySelectorAll("input, textarea, select"); // Seleciona todos os inputs, textarea e selects

        inputs.forEach(function(input) {
            if (input.type === "radio" || input.type === "checkbox") {
                input.checked = false; // Desmarca os radios e checkboxes
            } else if(input.id != "dataHoje"){
                input.value = ""; // Limpa o valor dos outros inputs
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    const inputs = document.querySelectorAll("input, textarea, select"); // Seleciona todos os campos de input, textarea e select

    inputs.forEach((input, index) => {
        input.addEventListener("keydown", function(event) {
            if (event.key === "Enter") { // Verifica se a tecla pressionada foi 'Enter'
                event.preventDefault(); // Impede o envio do formulário ou outro comportamento padrão
                if (index < inputs.length - 1) { // Se não for o último campo
                    inputs[index + 1].focus(); // Move o foco para o próximo campo
                }
            }
        });
    });
});

// Função para obter a data atual no formato YYYY-MM-DD
function obterDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Meses começam em 0
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

// Funções de formatação
function formatarData(data) {
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}
function formatarDataHoje(data) {
    const partes = data.split('-');
    const dia = partes[2];
    const mes = obterMesPorExtenso(partes[1]);
    const ano = partes[0];
    return `${dia} de ${mes} de ${ano}`;
}
function obterMesPorExtenso(mes) {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return meses[parseInt(mes, 10) - 1];
}
function formatarTelefone(telefone) {
    const telLimpo = telefone.replace(/\D/g, '');
    return telLimpo.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, '($1) $2 $3-$4');
}

const textLines = [
    'ESTADO DE SERGIPE',
    'PREFEITURA MUNICIPAL DE ARACAJU',
    'SECRETARIA MUNICIPAL DA DEFESA SOCIAL E DA CIDADANIA',
    'SUPERINTENDÊNCIA MUNICIPAL DE TRANSPORTES E TRÂNSITO',
    'DIRETORIA ADMINISTRATIVA E FINANCEIRA',
    'NÚCLEO DE PERÍCIA MÉDICA'
];

// Função para carregar a imagem
function carregarImagem(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = reject;
    });
}

    // Função para adicionar texto justificado
    function adicionarTextoJustificado(doc, texto, largura, margem, yInicial) {
        const linhas = doc.splitTextToSize(texto, largura);
        let y = yInicial;

        linhas.forEach((linha) => {
            const palavras = linha.split(' ');
            const numPalavras = palavras.length;

            if (numPalavras > 1) {
                const larguraTotal = palavras.reduce((total, palavra) => total + doc.getTextWidth(palavra) + doc.getTextWidth(' '), 0);
                const espacoExtra = largura - larguraTotal;
                const espacos = numPalavras - 1;
                const espacoAdicional = espacoExtra / espacos;

                let x = margem;
                palavras.forEach((palavra) => {
                    doc.text(palavra, x, y);
                    x += doc.getTextWidth(palavra) + espacoAdicional + doc.getTextWidth(' ');
                });
            } else {
                doc.text(linha, margem, y);
            }

            y += 7;
        });
        return y; // Retorna a posição Y final
    }

let autorizacao = false;

// Função para verificar a idade
function verificarIdade(nomeMae) {
    const dataNascimento = document.getElementById('dataNascimento').value;
    const hoje = new Date();
    const anoNascimento = new Date(dataNascimento).getFullYear();
    const mesNascimento = new Date(dataNascimento).getMonth();
    const diaNascimento = new Date(dataNascimento).getDate();

    // Calcula a idade
    let idade = hoje.getFullYear() - anoNascimento;
    
    // Ajusta a idade se ainda não tiver feito aniversário este ano
    if (hoje.getMonth() < mesNascimento || (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)) {
        idade--;
    }

    let cpfResponsavel = null;
    let nomeOutroResponsavel = null; // Variável para o nome do outro responsável

    // Verifica se a idade é menor que 8
    if (idade < 8) {
        const mensagem = `É necessário fazer a autorização para catraca. Deseja fazer em nome de ${nomeMae}?`;
        autorizacao = confirm(mensagem);
        
        if (autorizacao) {
            cpfResponsavel = prompt(`Informe o CPF de ${nomeMae}:`);
            if (cpfResponsavel) {
                alert("Autorização em nome de " + nomeMae + " foi iniciada.");
            } else {
                alert("Autorização não foi feita.");
            }
        } else {
            nomeOutroResponsavel = prompt("Informe o nome do outro responsável:");
            cpfResponsavel = prompt("Informe o CPF do responsável:");

            if (nomeOutroResponsavel && cpfResponsavel) {
                alert(`Autorização em nome de ${nomeOutroResponsavel} (CPF: ${cpfResponsavel}) foi iniciada.`);
            } else {
                alert("Autorização não foi feita.");
            }
        }
    }

    return { cpfResponsavel, nomeOutroResponsavel}; // Retorna CPF e nome do responsável
}


document.getElementById('dataHoje').value = obterDataAtual();



gerarPdf.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf; // Acessa jsPDF do objeto global
    // Captura todos os valores do formulário
    
    const nome = document.getElementById('nome').value;
    const rg = document.getElementById('rg').value;
    const ssp = document.getElementById('ssp').value;
    const cpf = document.getElementById('cpf').value;
    const dataHoje = document.getElementById('dataHoje').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const cidade = document.getElementById('cidade').value;
    const nomeMae = document.getElementById('nomeMae').value;
    const endereco = document.getElementById('endereco').value;
    const numCasa = document.getElementById('numCasa').value;
    const bairro = document.getElementById('bairro').value;
    const telefone1 = document.getElementById('telefone1').value;
    const telefone2 = document.getElementById('telefone2').value;
    const dataAgendamento = document.getElementById('dataAgendamento').value;
    const sexo = document.querySelector('input[name="sexo"]:checked').value;
  const deficiencia = document.querySelector('input[name="deficiencia"]:checked').value;
    const horario = document.getElementById('horario').value;
    
    const { cpfResponsavel, nomeOutroResponsavel} = verificarIdade(nomeMae);
  
  
  
    const telefone1Formatado = formatarTelefone(telefone1);
    const telefone2Formatado = formatarTelefone(telefone2);

    const dataHojeFormatada = formatarData(dataHoje);
    const dataHojeFormatadaExtenso = formatarDataHoje(dataHoje);
    const dataAgendamentoFormatada = formatarData(dataAgendamento);
    const dataNascimentoFormatada = formatarData(dataNascimento);
  

    // Cria um novo documento PDF
    const doc = new jsPDF();
  


    // Define o título do PDF
    doc.setFontSize(18);
  
      const imgData = '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' // Adicione a string base64 completa da sua imagem

    // Adiciona a imagem do formulário
    doc.addImage(imgData, 'PNG', 0, 0, 210, 297); 
   

    // Adiciona um espaço
    doc.text(' ', 10, 30);

    // Adiciona os dados do formulário
    doc.setFontSize(12);
    doc.text(`${nome}`, 51, 50);
    doc.text(`${dataNascimentoFormatada}`, 51, 60);
    doc.text(`${rg}`, 51, 70);
    doc.text(`${ssp}`, 130, 71);
    doc.text(`${cpf}`, 155, 70);
    doc.text(`${dataHojeFormatada}`, 163, 21);
    doc.text(`${dataAgendamentoFormatada}`, 51, 142.3);
    doc.text(`${horario}`, 75, 142.3);
    doc.text(`${cidade}`, 160.4, 102);
    doc.text(`${nomeMae}`, 50, 81);
    doc.text(`${endereco}`, 50, 91.2);
    doc.text(`${numCasa}`, 170.4, 91.2);
    doc.text(`${bairro}`, 50, 102);
    doc.text(`${telefone1Formatado}`, 51, 112);
    doc.text(`${telefone2Formatado}`, 155, 112);
  
      if (sexo === 'masculino') {
        doc.text('X', 162, 60); // Posição para masculino
    } else if (sexo === 'feminino') {
        doc.text('X', 132, 60); // Posição para feminino
    }
  
      if (deficiencia === 'TEA') {
        doc.text('X', 75, 154); // Posição para TEA
    } else if (deficiencia === 'mental') {
        doc.text('X', 51, 154); // Posição para mental
    } else if (deficiencia === 'fisico') {
        doc.text('X', 95, 154); // Posição para fisico
    } else if (deficiencia === 'visual') {
        doc.text('X', 163, 154); // Posição para visual
    }  else if (deficiencia === 'auditivo') {
        doc.text('X', 132.5, 154); // Posição para auditivo
    }  
  

    // Salva o PDF
    const nomeArquivo = `${nome.replace(/ /g, '_')}_${cpf}.pdf`; // Substitui espaços por sublinhados
  
     if (cpfResponsavel) {
        doc.addPage(); // Adiciona uma nova página
        doc.setFontSize(18);
        doc.setFontSize(12);
        
        const URLLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm_F4EJslF8WhpMy0bCSb7D3aJpiYcZbpxxb0_-4KfgKzvUMEtr6yYQc9RL-TfC44m5-4&usqp=CAU';
        const logoImg = await carregarImagem(URLLogo); // await agora dentro de uma função async
        doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);
    
       // Adiciona o texto institucional ao lado da imagem
        doc.setFontSize(9);
        textY = 13
        textLines.forEach(line => {
            doc.text(line, 65, textY);
            textY += 3;
        });
       

       
        const textoPrincipal = `Eu, ${nomeMae}, inscrito(a) no CPF sob o nº ${cpfResponsavel}, responsável pelo(a) menor ${nome}, inscrito(a) no CPF sob o nº ${cpf}, faço a opção pela utilização da catraca, visando à maior disponibilidade de assentos no transporte coletivo, utilizando-se, neste caso,a biometria facial do beneficário previamente cadastrado no sistema.\n\nAo encostar o cartão no validador ,o titular deve passar primeiro na catraca e depois o acompanhante ,obrigatório que o beneficiário conste na foto capturada no ato do uso do cartão, para que o seu benefício não venha ser suspenso.`

        const textoResponsavel = `Eu, ${nomeOutroResponsavel}, inscrito(a) no CPF sob o nº ${cpfResponsavel}, responsável pelo(a) menor ${nome}, inscrito(a) no CPF sob o nº ${cpf}, faço a opção pela utilização da catraca, visando à maior disponibilidade de assentos no transporte coletivo, utilizando-se, neste caso, a biometria facial do beneficário previamente cadastrado no sistema.\n\nAo encostar o cartão no validador ,o titular deve passar primeiro na catraca e depois o acompanhante ,obrigatório que o beneficiário conste na foto capturada no ato do uso do cartão, para que o seu benefício não venha ser suspenso.`
        
            const textoAssinatura = `Aracaju/SE, ${dataHojeFormatadaExtenso}.\n\n________________________________________________\nAssinatura do(a) Responsavel`;

        
        // Exibe as informações do responsável
        if (autorizacao) { // Se for CPF da mãe
            doc.setFontSize(16)
             doc.text(`Autorização para Utilização da Catraca`, 105, 100, { align: 'center'});
             doc.setFontSize(12)
            adicionarTextoJustificado(doc, textoPrincipal, 170, 20, 120);
            doc.text(textoAssinatura, 105, 190, { align: 'center' });
          
        } else { // Se for CPF do outro responsável
            doc.setFontSize(16)
             doc.text(`Autorização para Utilização da Catraca`, 105, 100, { align: 'center'});
             doc.setFontSize(12)
             adicionarTextoJustificado(doc, textoResponsavel, 170, 20, 120);
             doc.text(textoAssinatura, 105, 190, { align: 'center' })
        }
    }
    doc.save(nomeArquivo);
  
});


credencialEstacionamento.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;



    // Captura dados do formulário
    const nome = document.getElementById('nome').value;
    const rg = document.getElementById('rg').value;
    const ssp = document.getElementById('ssp').value;
    const cpf = document.getElementById('cpf').value;
    const dataNascimento = document.getElementById('dataNascimento').value;
    const dataHoje = document.getElementById('dataHoje').value;
    const cidade = document.getElementById('cidade').value;
    const endereco = document.getElementById('endereco').value;
    const numCasa = document.getElementById('numCasa').value;
    const bairro = document.getElementById('bairro').value;
    const telefone1 = document.getElementById('telefone1').value;
    const dataAgendamento = document.getElementById('dataAgendamento').value;
    const horario = document.getElementById('horario').value;

    // Formata as datas e o telefone
    const dataAgendamentoFormatada = formatarData(dataAgendamento);
    const dataNascimentoFormatada = formatarData(dataNascimento);
    const dataHojeFormatada = formatarDataHoje(dataHoje);
    const telefone1Formatado = formatarTelefone(telefone1);

    // Cria o PDF
    const doc = new jsPDF();
    doc.setFontSize(12);

    // Texto Principal
    const textoPrincipal = `Eu, ${nome}, portador(a) do RG nº ${rg} SSP ${ssp}, inscrito(a) no CPF sob o nº ${cpf}, residente e domiciliado em ${endereco}, ${numCasa}, ${bairro}, ${cidade}, estado de Sergipe, com telefone nº ${telefone1Formatado}, nascido(a) em ${dataNascimentoFormatada}, solicito à Superintendência Municipal de Transporte e Trânsito de Aracaju, o cadastramento para recebimento de credencial e vaga especial em estacionamentos, por estar enquadrado(a) no que dispõe a resolução do CONTRAN nº 965, de 17 de maio de 2022. Declaro que as informações acima são verdadeiras e estou ciente da forma de utilização da credencial e as consequências do seu uso indevido.`;

    const textoAssinatura = `Aracaju/SE, ${dataHojeFormatada}.\n\n________________________________________________\nAssinatura do Requerente`;

    const textoDataAgendada = `\n\n\n\n\n\nDATA AGENDADA PARA PERÍCIA: ${dataAgendamentoFormatada}  ${horario}`

   
    
     //Adiciona a imagem do logo
    const logoURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm_F4EJslF8WhpMy0bCSb7D3aJpiYcZbpxxb0_-4KfgKzvUMEtr6yYQc9RL-TfC44m5-4&usqp=CAU';
    const logoImg = await carregarImagem(logoURL);
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);

    // Adiciona o texto institucional ao lado da imagem
    doc.setFontSize(9);
 

    let textY = 13;
    textLines.forEach(line => {
        doc.text(line, 65, textY);
        textY += 3;
    });

    // Título centralizado
    doc.setFontSize(12);
    doc.text('REQUERIMENTO DE CREDENCIAL', 105, textY + 15, { align: 'center' });
    doc.text('ESTACIONAMENTO ESPECIAL PARA IDOSO E DEFICIENTE', 105, textY + 20, { align: 'center' });

        // Desenha os retângulos e adiciona os textos
const rectY = textY + 27; // Coordenada Y para a parte superior dos retângulos
const rectWidth = 8; // Largura dos retângulos (aumentada)
const rectHeight = 8; // Altura dos retângulos (aumentada)
const marginX = 25; // Margem esquerda para o primeiro retângulo (aumentada para separar mais os retângulos)

// Desenha retângulo para "IDOSO"
doc.rect(85 - marginX, rectY + 1 , rectWidth, rectHeight); // Posição do retângulo "IDOSO"
doc.text('IDOSO', 68 - marginX + rectWidth / 4, rectY + 7); // Centraliza o texto dentro do retângulo

// Desenha retângulo para "DEFICIENTE"
doc.rect(125 + marginX, rectY + 1, rectWidth, rectHeight); // Posição do retângulo "DEFICIENTE"
doc.text('DEFICIENTE', 97 + marginX + rectWidth / 4, rectY + 7); // Centraliza o texto dentro do retângulo
doc.text('X', 125.5 + marginX + rectWidth / 4, rectY + 7); //marca o X no quadrado de deficiente

let y = rectY + 20; // Ajusta a posição do corpo do texto para começar abaixo dos retângulos



    const textoEndereco = "Rua Roberto Fonseca, 200, Inacio Barbosa, Aracaju-SE\nFone: (79) 98836-6435 e 98836-6497";
    y += 15; // Ajusta a posição para o novo bloco de texto
    doc.setFontSize(9);
    //doc.text(textoEndereco, 105, 182, { align: 'center' }); // Centraliza o texto no eixo X

    // Chama a função de texto justificado para o corpo do texto principal
    doc.setFontSize(12);
    y = adicionarTextoJustificado(doc, textoPrincipal, 170, 20, 80);

    // Adiciona o texto de assinatura e data centralizado
    doc.text(textoAssinatura, 105, y + 10, { align: 'center' });
    doc.text(textoDataAgendada, 20, y + 10);

    doc.text(`- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`, 5, 190);


        doc.addImage(logoImg, 'PNG', 10, 192, 50, 20);
    
        // Adiciona o texto institucional ao lado da imagem
        doc.setFontSize(9);
        textY = 195
        textLines.forEach(line => {
            doc.text(line, 65, textY);
            textY += 3;
        });
        
        doc.setFontSize(12);
        textY += 10;
        doc.text(`PERICIA MÉDICA`, 105, textY, { align: 'center' });
        textY += 10;

        const DataAgendada = `DATA PERÍCIA: ${dataAgendamentoFormatada} - ${horario} (OBS: ORDEM DE CHEGADA)`
        doc.text(DataAgendada, 20, textY);
        textY += 8;

        const NomeRequerente = `NOME DO REQUERENTE: ${nome}`
        doc.text(NomeRequerente, 20, textY)
        textY += 5;

        
        
        doc.rect( marginX + 10, textY + 5, rectWidth-2, rectHeight-2); 
        doc.text('FISICO', -7 + marginX + rectWidth / 4, textY+10); // Centraliza o texto dentro do retângulo

        // Auditivo
        doc.rect( marginX + 45, textY + 5, rectWidth-2, rectHeight-2); 
        doc.text('AUDITIVO', 22 + marginX + rectWidth / 4, textY+10); // Centraliza o texto dentro do retângulo

        // VISUAL
        doc.rect( marginX + 83, textY + 5, rectWidth-2, rectHeight-2); 
        doc.text('VISUAL', 65 + marginX + rectWidth / 4, textY+10); // Centraliza o texto dentro do retângulo

        // MENTAL
        doc.rect( marginX + 125, textY + 5, rectWidth-2, rectHeight-2); 
        doc.text('MENTAL', 105 + marginX + rectWidth / 4, textY+10); // Centraliza o texto dentro do retângulo

        // TEA
        doc.rect( marginX + 151, textY + 5, rectWidth-2, rectHeight-2); 
        doc.text('TEA', 140 + marginX + rectWidth / 4, textY+10); // Centraliza o texto dentro do retângulo
        
        textY+=20;
        
        doc.text(`LOCAL PERÍCIA`, 105, textY+3,{ align: 'center' });
        doc.setFontSize(13)
        const textoEnderecoAgendamento = "ENDEREÇO: R. Roberto Fonseca, 200, Inácio Barbosa, Aracaju - SE\nFone: (79) 98836-6435 e 98836-6497";
        textY+=5;
        doc.text(textoEnderecoAgendamento, 105, textY+3, { align: 'center' });
        

    

    // Salva o PDF com o nome personalizado
    const nomeArquivoCredencial = `${nome.replace(/ /g, '_')}_${cpf}.pdf`;
    doc.save(nomeArquivoCredencial);
});

trocarCinzaRoxo.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf; // Acessa jsPDF do objeto global
    let autorizacao2 = false;


    const nome = document.getElementById('nome').value;
    const rg = document.getElementById('rg').value;
    const ssp = document.getElementById('ssp').value;
    const cpf = document.getElementById('cpf').value;
    const dataHoje = document.getElementById('dataHoje').value;
    const cidade = document.getElementById('cidade').value;
    const endereco = document.getElementById('endereco').value;
    const numCasa = document.getElementById('numCasa').value;
    const bairro = document.getElementById('bairro').value;
    const telefone1 = document.getElementById('telefone1').value;
    const dataHojeFormatada = formatarDataHoje(dataHoje);
    const telefone1Formatado = formatarTelefone(telefone1);
    const dataNascimento = document.getElementById('dataNascimento').value

    
    const numeroCartao = prompt("Informe o número do cartão:");
    
    if (numeroCartao === null || numeroCartao.trim() === "") {
        alert("Número do cartão não informado.");
    }


    
    const hoje = new Date();
    const anoNascimento = new Date(dataNascimento).getFullYear();
    const mesNascimento = new Date(dataNascimento).getMonth();
    const diaNascimento = new Date(dataNascimento).getDate();

    // Calcula a idade
    let idade = hoje.getFullYear() - anoNascimento;
    
    // Ajusta a idade se ainda não tiver feito aniversário este ano
    if (hoje.getMonth() < mesNascimento || (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)) {
        idade--;
    }
    

        const mensagem = `Deseja fazer em nome do beneficiario ${nome}?`;
        autorizacao2 = confirm(mensagem);
        

    
    // Cria um novo documento PDF em branco
    const doc = new jsPDF();

    const textoObs = "Estou ciente que esse cartão ficara retido no ato da solicitação da troca para confecção da segunda via, que será produzida em até 2 dias úteis para retirada no CEAC Parque Shopping ou CEAC Rodoviária Nova, Aracaju/SE."

    const textoAssinatura = `Aracaju/SE, ${dataHojeFormatada}.\n\n\n\n\n________________________________________________\nAssinatura do Requerente`;

    const textoAssinaturaCoordenador = `________________________________________________\nMARIA SOLANGE DA SILVA`;

    const textoObsCoordenador = "Chefe do Núcleo de Atendimento - SMTT"

    const textoEndereco = "______________________________________________________________\nSMTT, Rua Roberto Fonseca, 200, Inacio Barbosa, Aracaju-SE\nFone: (79) 98836-6435 e 98836-6497";

    //Adiciona a imagem do logo
    const logoURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm_F4EJslF8WhpMy0bCSb7D3aJpiYcZbpxxb0_-4KfgKzvUMEtr6yYQc9RL-TfC44m5-4&usqp=CAU';
    const logoImg = await carregarImagem(logoURL);
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);

    // Adiciona o texto institucional ao lado da imagem
    doc.setFontSize(9);


    let textY = 13;
    textLines.forEach(line => {
        doc.text(line, 65, textY);
        textY += 3;
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    adicionarTextoJustificado(doc, textoObs, 170, 20, 105);
    doc.setFontSize(15);
    doc.text("REQUERIMENTO", 100, 40, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(textoAssinatura, 100, 130, { align: 'center' });
    doc.setFontSize(9);
    doc.text(textoEndereco, 100, 278, { align: 'center' });


   
    
    if(autorizacao2) {

        const textoPrincipal = `O Núcleo de Atendimento da Perícia Médica com base nas Leis n° 1.723/91 e n° 1.325/1987 comunica que o(a) requerente ${nome} portador(a) do RG nº ${rg} SSP ${ssp} e inscrito(a) no CPF sob o nº ${cpf}, residente e domiciliado na ${endereco}, ${numCasa}, ${bairro}, ${cidade}, telefone nº ${telefone1Formatado}, solicita a substituição do Cartão Mais Aracaju Gratuidade da COR CINZA de nº ${numeroCartao} para a COR ROXA que NÃO PERMITE o acesso à parte traseira dos ônibus mediante a validação da biometria facial do beneficiário.`


        doc.setFontSize(12);
        adicionarTextoJustificado(doc, textoPrincipal, 170, 20, 50);

        doc.text(textoAssinaturaCoordenador, 100, 205, { align: 'center' });
        doc.setFontSize(10);
        doc.text(textoObsCoordenador, 100, 215, { align: 'center' });
        

    }else{
        const nomeRequerente = prompt("Informe o nome do requerente:");
        const cpfRequerente = prompt(`Informe o CPF de ${nomeRequerente}:`);
        const rgRequerente = prompt(`Informe o RG de ${nomeRequerente}:`);
        const sspRequerente = prompt("SSP:");

        const textoPrincipal1 = `O Núcleo de Atendimento da Perícia Médica com base nas Leis n° 1.723/91 e n° 1.325/1987 comunica que o(a) requerente ${nomeRequerente} portador(a) do RG nº ${rgRequerente} SSP ${sspRequerente} e inscrito(a) no CPF sob o nº ${cpfRequerente}, residente e domiciliado na ${endereco}, ${numCasa}, ${bairro}, ${cidade}, telefone nº ${telefone1Formatado}, AUTORIZO a substituição do Cartão Mais Aracaju Gratuidade da COR CINZA de nº ${numeroCartao} para a COR ROXA que NÃO PERMITE o acesso à parte traseira dos ônibus mediante a validação da biometria facial do beneficiário.`

        doc.setFontSize(12);
        adicionarTextoJustificado(doc, textoPrincipal1, 170, 20, 50);

        doc.text(`Para preenchimento da SMTT:\n\nNome do beneficiário: ${nome}\nCPF: ${cpf}`, 15, 185);

        doc.text(textoAssinaturaCoordenador, 100, 235, { align: 'center' });
        doc.setFontSize(10);
        doc.text(textoObsCoordenador, 100, 245, { align: 'center' });
        




    }
    // Salva o PDF com o nome personalizado
    const nomeArquivoTrocaCartaoCinzaRoxo = `${nome.replace(/ /g, '_')}_${cpf}.pdf`;
    doc.save(nomeArquivoTrocaCartaoCinzaRoxo);
});

   
trocarRoxoCinza.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf; // Acessa jsPDF do objeto global



    let autorizacao = false;


    const nome = document.getElementById('nome').value;
    const rg = document.getElementById('rg').value;
    const ssp = document.getElementById('ssp').value;
    const cpf = document.getElementById('cpf').value;
    const dataHoje = document.getElementById('dataHoje').value;
    const cidade = document.getElementById('cidade').value;
    const endereco = document.getElementById('endereco').value;
    const numCasa = document.getElementById('numCasa').value;
    const bairro = document.getElementById('bairro').value;
    const telefone1 = document.getElementById('telefone1').value;
    const dataHojeFormatada = formatarDataHoje(dataHoje);
    const telefone1Formatado = formatarTelefone(telefone1);
    const dataNascimento = document.getElementById('dataNascimento').value;
    

    const numeroCartao = prompt("Informe o número do cartão:");


    if (numeroCartao === null || numeroCartao.trim() === "") {
        alert("Número do cartão não informado.");
    }




    const hoje = new Date();
    const anoNascimento = new Date(dataNascimento).getFullYear();
    const mesNascimento = new Date(dataNascimento).getMonth();
    const diaNascimento = new Date(dataNascimento).getDate();

    // Calcula a idade
    let idade = hoje.getFullYear() - anoNascimento;
    
    // Ajusta a idade se ainda não tiver feito aniversário este ano
    if (hoje.getMonth() < mesNascimento || (hoje.getMonth() === mesNascimento && hoje.getDate() < diaNascimento)) {
        idade--;
    }

        const mensagem = `Deseja fazer em nome do beneficiario ${nome}?`;
        autorizacao = confirm(mensagem);
 

    
    // Cria um novo documento PDF em branco
    const doc = new jsPDF();

    const textoObs = "Estou ciente que esse cartão ficara retido no ato da solicitação da troca para confecção da segunda via, que será produzida em até 2 dias úteis para retirada no CEAC Parque Shopping ou CEAC Rodoviária Nova, Aracaju/SE."

    const textoAssinatura = `Aracaju/SE, ${dataHojeFormatada}.\n\n\n\n\n________________________________________________\nAssinatura do Requerente`;

    const textoAssinaturaCoordenador = `________________________________________________\nMARIA SOLANGE DA SILVA`;

    const textoObsCoordenador = "Chefe do Núcleo de Atendimento - SMTT"

    const textoEndereco = "______________________________________________________________\nSMTT, Rua Roberto Fonseca, 200, Inacio Barbosa, Aracaju-SE\nFone: (79) 98836-6435 e 98836-6497";

    //Adiciona a imagem do logo
    const logoURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRm_F4EJslF8WhpMy0bCSb7D3aJpiYcZbpxxb0_-4KfgKzvUMEtr6yYQc9RL-TfC44m5-4&usqp=CAU';
    const logoImg = await carregarImagem(logoURL);
    doc.addImage(logoImg, 'PNG', 10, 10, 50, 20);

    // Adiciona o texto institucional ao lado da imagem
    doc.setFontSize(9);


    let textY = 13;
    textLines.forEach(line => {
        doc.text(line, 65, textY);
        textY += 3;
    });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    adicionarTextoJustificado(doc, textoObs, 170, 20, 105);
    doc.setFontSize(15);
    doc.text("REQUERIMENTO", 100, 40, { align: 'center' });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(textoAssinatura, 100, 130, { align: 'center' });
    doc.setFontSize(9);
    doc.text(textoEndereco, 100, 278, { align: 'center' });

    if (autorizacao){
        const textoPrincipal = `O Núcleo de Atendimento da Perícia Médica com base nas Leis n° 1.723/91 e n° 1.325/1987 comunica que o(a) requerente ${nome} portador(a) do RG nº ${rg} SSP ${ssp} e inscrito(a) no CPF sob o nº ${cpf}, residente e domiciliado na ${endereco}, ${numCasa}, ${bairro}, ${cidade}, telefone nº ${telefone1Formatado}, solicita a substituição do Cartão Mais Aracaju Gratuidade da COR ROXA de nº ${numeroCartao} para a COR CINZA que PERMITE o acesso à parte traseira dos ônibus mediante a validação da biometria facial do beneficiário.`

        doc.setFontSize(12);
        adicionarTextoJustificado(doc, textoPrincipal, 170, 20, 50);

        doc.text(textoAssinaturaCoordenador, 100, 205, { align: 'center' });
        doc.setFontSize(10);
        doc.text(textoObsCoordenador, 100, 215, { align: 'center' });
        
    }
    else{
        const nomeRequerente = prompt("Informe o nome do requerente:");
        const cpfRequerente = prompt(`Informe o CPF de ${nomeRequerente}:`);
        const rgRequerente = prompt(`Informe o RG de ${nomeRequerente}:`);
        const sspRequerente = prompt("SSP:");

        const textoPrincipalTEA = 
        `O Núcleo de Atendimento da Perícia Médica com base nas Leis n° 1.723/91 e n° 1.325/1987 comunica que o(a) requerente ${nomeRequerente} portador(a) do RG nº ${rgRequerente} SSP ${sspRequerente} e inscrito(a) no CPF sob o nº ${cpfRequerente}, residente e domiciliado na ${endereco}, ${numCasa}, ${bairro}, ${cidade}, telefone nº ${telefone1Formatado}, AUTORIZO a substituição do Cartão Mais Aracaju Gratuidade da COR ROXA de nº ${numeroCartao} para a COR CINZA que PERMITE o acesso à parte traseira do ônibus mediante a validação da biometria facial do beneficiário.`

        doc.setFontSize(12);
        adicionarTextoJustificado(doc, textoPrincipalTEA, 170, 20, 50);

        doc.text(`Para preenchimento da SMTT:\n\nNome do beneficiário: ${nome}\nCPF: ${cpf}`, 15, 185);

        doc.text(textoAssinaturaCoordenador, 100, 235, { align: 'center' });
        doc.setFontSize(10);
        doc.text(textoObsCoordenador, 100, 245, { align: 'center' });
        
    }



    // Salva o PDF com o nome personalizado
    const nomeArquivoTrocaCartaoRoxoCinza = `${nome.replace(/ /g, '_')}_${cpf}.pdf`;
    doc.save(nomeArquivoTrocaCartaoRoxoCinza);

});




