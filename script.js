class Calculator {
    constructor() {
        this.result = document.querySelector('.result');
        this.buttons = document.querySelectorAll('button');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;

        this.initializeEventListeners();
        this.updateDisplay();
    }

    initializeEventListeners() {
        this.buttons.forEach(button => {
            button.addEventListener('click', () => this.handleButtonClick(button));
        });

        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    handleButtonClick(button) {
        const value = button.textContent;

        if (button.classList.contains('number')) {
            this.handleNumber(value);
        } else if (button.classList.contains('operator')) {
            this.handleOperator(value);
        } else if (button.classList.contains('function')) {
            this.handleFunction(value);
        }
    }

    handleKeyboardInput(e) {
        const key = e.key;

        if (/[0-9]/.test(key)) {
            this.handleNumber(key);
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.handleOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
        } else if (key === 'Enter' || key === '=') {
            this.handleOperator('=');
        } else if (key === 'Escape') {
            this.handleFunction('AC');
        } else if (key === '.') {
            this.handleNumber('.');
        } else if (key === '%') {
            this.handleFunction('%');
        }
    }

    handleNumber(num) {
        if (this.shouldResetDisplay) {
            this.currentValue = '0';
            this.shouldResetDisplay = false;
        }

        if (num === '.' && this.currentValue.includes('.')) return;

        if (this.currentValue === '0' && num !== '.') {
            this.currentValue = num;
        } else {
            this.currentValue += num;
        }

        this.updateDisplay();
    }

    handleOperator(op) {
        if (this.previousValue === null) {
            this.previousValue = parseFloat(this.currentValue);
        } else if (this.operation) {
            this.previousValue = this.calculate();
        }

        if (op === '=') {
            this.currentValue = this.calculate().toString();
            this.previousValue = null;
            this.operation = null;
        } else {
            this.operation = op;
            this.shouldResetDisplay = true;
        }

        this.updateDisplay();
    }

    handleFunction(func) {
        switch (func) {
            case 'AC':
                this.reset();
                break;
            case '±':
                this.currentValue = (parseFloat(this.currentValue) * -1).toString();
                break;
            case '%':
                this.currentValue = (parseFloat(this.currentValue) / 100).toString();
                break;
        }
        this.updateDisplay();
    }

    calculate() {
        const prev = this.previousValue;
        const current = parseFloat(this.currentValue);

        switch (this.operation) {
            case '+': return prev + current;
            case '−': return prev - current;
            case '×': return prev * current;
            case '÷': return prev / current;
            default: return current;
        }
    }

    reset() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
    }

    updateDisplay() {
        let displayValue = this.currentValue;

        // Format the number to handle large numbers and decimals
        if (displayValue.includes('.')) {
            const [integer, decimal] = displayValue.split('.');
            displayValue = parseFloat(integer).toLocaleString() + '.' + decimal;
        } else {
            displayValue = parseFloat(displayValue).toLocaleString();
        }

        // Handle display overflow
        const maxLength = 9;
        if (displayValue.length > maxLength) {
            displayValue = parseFloat(displayValue).toExponential(maxLength - 4);
        }

        this.result.textContent = displayValue;

        // Adjust font size based on content length
        const fontSize = Math.max(30, 80 - (displayValue.length * 5));
        this.result.style.fontSize = `${fontSize}px`;
    }
}

// Initialize calculator
new Calculator(); 