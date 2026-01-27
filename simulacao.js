/* =========================================
   Simulação de Financiamento - Sistema Price
   Com Sliders e Atualização em Tempo Real
   ========================================= */

const formatBR = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

document.addEventListener('DOMContentLoaded', () => {
  
  // Se o formulário de financiamento não existir na página, para a execução
  if (!document.getElementById('financingForm')) return;

  // Elementos do DOM
  const elVal = document.getElementById('propertyValue');
  const elValRange = document.getElementById('propertyRange');
  
  const elDown = document.getElementById('downPayment');
  const elDownRange = document.getElementById('downRange');
  
  const elYears = document.getElementById('years');
  const elYearsRange = document.getElementById('yearsRange');
  
  const elRate = document.getElementById('interestRate');

  // Elementos de Resultado
  const resMonthly = document.getElementById('resMonthlyPayment');
  const resLoan = document.getElementById('resLoanAmount');
  const resIncome = document.getElementById('resMinIncome');
  const resMonths = document.getElementById('resMonths');

  // Função Principal de Cálculo
  function calculate() {
    const price = parseFloat(elVal.value);
    const down = parseFloat(elDown.value);
    const years = parseFloat(elYears.value);
    const rate = parseFloat(elRate.value);

    // Validação simples
    if (!price || !years || !rate || isNaN(price) || isNaN(down)) return;

    // Lógica Price Simples
    const principal = price - down;
    const months = years * 12;
    const monthlyRate = rate / 12 / 100;
    
    let monthlyPayment = 0;
    
    if (principal <= 0) {
      monthlyPayment = 0;
    } else if (monthlyRate === 0) {
      monthlyPayment = principal / months;
    } else {
      monthlyPayment = principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months));
    }
    
    // Evitar valores negativos visuais
    if (monthlyPayment < 0) monthlyPayment = 0;
    
    // Sugestão de Renda (30% da renda comprometida)
    const minIncome = monthlyPayment / 0.3;

    // Atualiza a Interface (UI)
    if (resMonthly) resMonthly.innerText = formatBR(monthlyPayment);
    if (resLoan) resLoan.innerText = formatBR(principal > 0 ? principal : 0);
    if (resIncome) resIncome.innerText = formatBR(minIncome);
    if (resMonths) resMonths.innerText = `${months} meses`;
  }

  // Função para sincronizar Input de Texto <-> Slider (Range)
  function syncInputs(input, range) {
    // Quando digita no campo texto
    input.addEventListener('input', () => {
      range.value = input.value;
      calculate();
    });
    
    // Quando arrasta o slider
    range.addEventListener('input', () => {
      input.value = range.value;
      calculate();
    });
  }

  // Inicializa a sincronização dos campos
  if (elVal && elValRange) syncInputs(elVal, elValRange);
  if (elDown && elDownRange) syncInputs(elDown, elDownRange);
  if (elYears && elYearsRange) syncInputs(elYears, elYearsRange);
  
  // Escuta mudanças na taxa de juros
  if (elRate) elRate.addEventListener('input', calculate);
  
  // Previne o refresh da página ao dar Enter
  document.getElementById('financingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    calculate();
  });

  // Realiza o cálculo inicial ao carregar a página
  calculate();
});