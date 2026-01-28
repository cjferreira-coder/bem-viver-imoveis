/* =========================================
   LÓGICA DO SIMULADOR FINANCEIRO
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos do DOM
    const propValueInput = document.getElementById('propValue');
    const downPaymentInput = document.getElementById('downPayment');
    const interestRateInput = document.getElementById('interestRate');
    const yearsInput = document.getElementById('years');
    const yearsSlider = document.getElementById('yearsSlider');
    const amortizationSelect = document.getElementById('amortization');
    const btnCalculate = document.getElementById('btnCalculate');

    // Elementos de Resultado
    const resFirst = document.getElementById('resFirstInstallment');
    const resLast = document.getElementById('resLastInstallment');
    const resLoan = document.getElementById('resLoanAmount');
    const resMonths = document.getElementById('resMonths');
    const resIncome = document.getElementById('resIncome');

    // Sincronizar Slider com Input de Anos
    yearsSlider.addEventListener('input', (e) => {
        yearsInput.value = e.target.value;
        calculate(); // Calcula em tempo real ao arrastar
    });
    yearsInput.addEventListener('input', (e) => {
        yearsSlider.value = e.target.value;
    });

    // Função de Formatação Moeda
    const fmt = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Função Principal de Cálculo
    function calculate() {
        const value = parseFloat(propValueInput.value) || 0;
        const entry = parseFloat(downPaymentInput.value) || 0;
        const rateAnual = parseFloat(interestRateInput.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;
        const system = amortizationSelect.value;

        // Validações básicas
        if (value <= 0 || years <= 0) return;

        const loanAmount = value - entry;
        const months = years * 12;
        const rateMonthly = Math.pow(1 + (rateAnual / 100), 1 / 12) - 1; // Conversão Juros Anual -> Mensal

        let firstInstallment = 0;
        let lastInstallment = 0;

        if (loanAmount <= 0) {
            alert("O valor da entrada não pode ser maior que o valor do imóvel.");
            return;
        }

        if (system === 'SAC') {
            // CÁLCULO SAC (Sistema de Amortização Constante)
            const amortization = loanAmount / months;
            
            // Primeira parcela: Amortização + Juros sobre o saldo total
            firstInstallment = amortization + (loanAmount * rateMonthly);
            
            // Última parcela: Amortização + Juros sobre o último saldo (aprox 1 amortização)
            // Fórmula genérica parcela N: Amort + (SaldoDevedor * Juros)
            lastInstallment = amortization + (amortization * rateMonthly);

        } else {
            // CÁLCULO PRICE (Parcelas Fixas - Fórmula PMT)
            // PMT = PV * ( i * (1+i)^n ) / ( (1+i)^n - 1 )
            firstInstallment = loanAmount * ( (rateMonthly * Math.pow(1 + rateMonthly, months)) / (Math.pow(1 + rateMonthly, months) - 1) );
            lastInstallment = firstInstallment; // Na Price é fixa
        }

        // Regra de bolso: A parcela não deve exceder 30% da renda
        const recommendedIncome = firstInstallment / 0.30;

        // Atualizar Tela
        resFirst.textContent = fmt(firstInstallment);
        resLast.textContent = fmt(lastInstallment);
        resLoan.textContent = fmt(loanAmount);
        resMonths.textContent = `${months} meses`;
        resIncome.textContent = fmt(recommendedIncome);
    }

    // Evento de clique no botão
    btnCalculate.addEventListener('click', calculate);

    // Calcular automaticamente na carga inicial
    calculate();
});