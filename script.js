// Verificador de Extratos Bancários - JavaScript
class VerificadorExtratos {
    constructor() {
        this.csvData = [];
        this.excelValues = [];
        this.comparisonResults = null;
        
        this.initializeEventListeners();
        this.showMessage('🎯 Sistema iniciado! Selecione os ficheiros para começar.', 'info');
    }

    initializeEventListeners() {
        // File inputs
        document.getElementById('csv1').addEventListener('change', (e) => this.handleFileSelect(e, 'csv1-status'));
        document.getElementById('csv2').addEventListener('change', (e) => this.handleFileSelect(e, 'csv2-status'));
        document.getElementById('excel').addEventListener('change', (e) => this.handleExcelSelect(e, 'excel-status'));

        // Buttons
        document.getElementById('process-btn').addEventListener('click', () => this.processFiles());
        document.getElementById('compare-btn').addEventListener('click', () => this.compareValues());
        document.getElementById('export-btn').addEventListener('click', () => this.exportReport());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAll());
    }

    handleFileSelect(event, statusId) {
        const file = event.target.files[0];
        const statusElement = document.getElementById(statusId);
        
        if (file) {
            statusElement.textContent = `✅ ${file.name} (${this.formatFileSize(file.size)})`;
            statusElement.classList.add('selected');
        } else {
            statusElement.textContent = 'Nenhum ficheiro selecionado';
            statusElement.classList.remove('selected');
        }
    }

    async handleExcelSelect(event, statusId) {
        const file = event.target.files[0];
        const statusElement = document.getElementById(statusId);
        
        if (file) {
            statusElement.textContent = `✅ ${file.name} (${this.formatFileSize(file.size)})`;
            statusElement.classList.add('selected');
            
            // Processar Excel automaticamente
            try {
                this.showMessage('📊 Processando ficheiro Excel...', 'info');
                const values = await this.processExcelFile(file);
                
                if (values.length > 0) {
                    // Colocar valores na textarea
                    const textarea = document.getElementById('excel-values');
                    textarea.value = values.map(v => v.toFixed(2)).join(', ');
                    
                    this.showMessage(`✅ Excel processado: ${values.length} valores encontrados`, 'success');
                    this.showMessage(`💰 Valores: ${values.slice(0, 5).map(v => v.toFixed(2) + '€').join(', ')}${values.length > 5 ? '...' : ''}`, 'info');
                } else {
                    this.showMessage('⚠️ Nenhum valor numérico encontrado no Excel', 'warning');
                    this.showMessage('💡 Insira valores manualmente na caixa de texto', 'info');
                }
            } catch (error) {
                this.showMessage(`❌ Erro ao processar Excel: ${error.message}`, 'error');
                this.showMessage('💡 Insira valores manualmente na caixa de texto', 'info');
            }
        } else {
            statusElement.textContent = 'Nenhum ficheiro selecionado';
            statusElement.classList.remove('selected');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async processExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Usar a primeira folha
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Converter para JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    // Extrair todos os valores numéricos
                    const values = [];
                    
                    for (const row of jsonData) {
                        for (const cell of row) {
                            if (cell !== null && cell !== undefined) {
                                // Tentar converter para número
                                const numValue = this.parseMonetaryValue(cell.toString());
                                if (numValue !== null && numValue > 0) {
                                    values.push(Math.abs(numValue));
                                }
                            }
                        }
                    }
                    
                    // Remover duplicatas e ordenar
                    const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
                    
                    resolve(uniqueValues);
                    
                } catch (error) {
                    reject(new Error(`Erro ao processar Excel: ${error.message}`));
                }
            };
            
            reader.onerror = () => reject(new Error('Erro ao ler ficheiro Excel'));
            reader.readAsArrayBuffer(file);
        });
    }

    showLoading(show = true) {
        document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
    }

    showMessage(message, type = 'info') {
        const resultsContainer = document.getElementById('results');
        const messageDiv = document.createElement('div');
        messageDiv.className = `result-line result-${type}`;
        
        const timestamp = new Date().toLocaleTimeString('pt-PT');
        messageDiv.innerHTML = `<strong>[${timestamp}]</strong> ${message}`;
        
        resultsContainer.appendChild(messageDiv);
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    clearResults() {
        document.getElementById('results').innerHTML = '';
    }

    async processFiles() {
        try {
            this.showLoading(true);
            this.clearResults();
            this.showMessage('🚀 Iniciando processamento dos ficheiros...', 'info');

            const csv1File = document.getElementById('csv1').files[0];
            const csv2File = document.getElementById('csv2').files[0];

            if (!csv1File || !csv2File) {
                throw new Error('Por favor selecione pelo menos os 2 ficheiros CSV');
            }

            // Processar CSVs
            this.csvData = [];
            
            this.showMessage('📂 Processando CSV 1...', 'info');
            const csv1Data = await this.parseCSV(csv1File);
            this.csvData = this.csvData.concat(csv1Data);
            this.showMessage(`✅ CSV 1: ${csv1Data.length} movimentos encontrados`, 'success');

            this.showMessage('📂 Processando CSV 2...', 'info');
            const csv2Data = await this.parseCSV(csv2File);
            this.csvData = this.csvData.concat(csv2Data);
            this.showMessage(`✅ CSV 2: ${csv2Data.length} movimentos encontrados`, 'success');

            // Mostrar resumo
            this.showMessage('', 'info'); // Linha vazia
            this.showMessage('📊 RESUMO DO PROCESSAMENTO:', 'header');
            this.showMessage(`   Total de movimentos: ${this.csvData.length}`, 'info');
            this.showMessage(`   CSV 1: ${csv1Data.length} movimentos`, 'info');
            this.showMessage(`   CSV 2: ${csv2Data.length} movimentos`, 'info');

            // Mostrar amostra
            if (this.csvData.length > 0) {
                this.showMessage('', 'info');
                this.showMessage('💰 Amostra de movimentos:', 'header');
                for (let i = 0; i < Math.min(5, this.csvData.length); i++) {
                    const mov = this.csvData[i];
                    this.showMessage(`   ${i+1}. ${mov.data} - ${mov.descricao.substring(0, 50)}... - ${mov.valor.toFixed(2)}€`, 'info');
                }
                if (this.csvData.length > 5) {
                    this.showMessage(`   ... e mais ${this.csvData.length - 5} movimentos`, 'info');
                }
            }

            // Verificar se Excel foi processado
            const excelFile = document.getElementById('excel').files[0];
            const excelValues = document.getElementById('excel-values').value.trim();
            
            if (excelFile) {
                this.showMessage('', 'info');
                this.showMessage('📊 Excel selecionado e processado automaticamente', 'success');
                if (excelValues) {
                    const valueCount = excelValues.split(',').length;
                    this.showMessage(`💰 ${valueCount} valores extraídos do Excel`, 'info');
                } else {
                    this.showMessage('💡 Se necessário, insira valores manualmente na caixa de texto', 'info');
                }
            } else {
                this.showMessage('', 'info');
                this.showMessage('📊 Nenhum Excel selecionado', 'warning');
                this.showMessage('💡 Selecione um ficheiro Excel ou insira valores manualmente', 'info');
            }

            this.showMessage('', 'info');
            this.showMessage('✅ Processamento concluído!', 'success');
            this.showMessage('➡️ Próximo passo: Verifique valores do Excel e clique "Comparar Valores"', 'info');

            // Ativar botão de comparação
            document.getElementById('compare-btn').disabled = false;

            // Atualizar estatísticas
            this.updateStats();

        } catch (error) {
            this.showMessage(`❌ Erro: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const movements = this.extractMovementsFromCSV(text);
                    resolve(movements);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler ficheiro'));
            reader.readAsText(file, 'ISO-8859-1'); // Encoding comum para CSVs portugueses
        });
    }

    extractMovementsFromCSV(csvText) {
        const lines = csvText.split('\n');
        const movements = [];
        let headerFound = false;

        for (const line of lines) {
            // Procurar cabeçalho
            if (line.includes('Data mov.') && line.includes('Descrição') && line.includes('Montante')) {
                headerFound = true;
                continue;
            }

            // Processar movimentos
            if (headerFound && line.trim() && line.includes(';')) {
                const parts = line.split(';');
                if (parts.length >= 4) {
                    try {
                        const data = parts[0].trim();
                        const descricao = parts[2].trim();
                        const montanteStr = parts[3].trim();

                        const valor = this.parseMonetaryValue(montanteStr);

                        if (valor !== null && data && descricao) {
                            movements.push({
                                data: data,
                                descricao: descricao,
                                valor: valor,
                                valorOriginal: montanteStr
                            });
                        }
                    } catch (error) {
                        // Ignorar linhas com erro
                        continue;
                    }
                }
            }
        }

        return movements;
    }

    parseMonetaryValue(valueStr) {
        if (!valueStr || valueStr.trim() === '') {
            return null;
        }

        // Limpar string
        let clean = valueStr.trim();
        clean = clean.replace(/\s*EUR\s*/g, '');
        clean = clean.replace(/\s*€\s*/g, '');
        clean = clean.replace(/\s+/g, '');

        // Tratar formato português (123.456,78)
        if (clean.includes(',') && clean.includes('.')) {
            // Formato: 123.456,78 -> 123456.78
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else if (clean.includes(',')) {
            // Formato: 123,78 -> 123.78
            clean = clean.replace(',', '.');
        }

        try {
            return parseFloat(clean);
        } catch {
            return null;
        }
    }

    compareValues() {
        try {
            if (this.csvData.length === 0) {
                throw new Error('Processe primeiro os ficheiros CSV');
            }

            // Obter valores do Excel
            const excelText = document.getElementById('excel-values').value.trim();
            if (!excelText) {
                throw new Error('Insira valores da folha de cofre na caixa de texto');
            }

            this.showMessage('', 'info');
            this.showMessage('🔍 INICIANDO COMPARAÇÃO...', 'header');

            // Processar valores do Excel
            this.excelValues = this.parseExcelValues(excelText);
            this.showMessage(`📋 Valores da folha de cofre processados: ${this.excelValues.length}`, 'info');

            // Mostrar valores do Excel
            for (let i = 0; i < Math.min(10, this.excelValues.length); i++) {
                const val = this.excelValues[i];
                this.showMessage(`   ${i+1}. ${val.valor.toFixed(2)}€ ('${val.original}')`, 'info');
            }
            if (this.excelValues.length > 10) {
                this.showMessage(`   ... e mais ${this.excelValues.length - 10} valores`, 'info');
            }

            // Realizar comparação
            const found = [];
            const notFound = [];

            for (const excelVal of this.excelValues) {
                let foundMatch = false;

                for (const movement of this.csvData) {
                    if (Math.abs(Math.abs(excelVal.valor) - Math.abs(movement.valor)) < 0.01) {
                        found.push({
                            excelValue: excelVal,
                            movement: movement
                        });
                        foundMatch = true;
                        break;
                    }
                }

                if (!foundMatch) {
                    notFound.push(excelVal);
                }
            }

            // Guardar resultados
            this.comparisonResults = {
                excelValues: this.excelValues,
                found: found,
                notFound: notFound,
                csvData: this.csvData
            };

            // Mostrar resultados
            this.showMessage('', 'info');
            this.showMessage('📊 RESULTADOS DA COMPARAÇÃO:', 'header');
            this.showMessage(`   ✅ Valores encontrados: ${found.length}`, 'success');
            this.showMessage(`   ❌ Valores NÃO encontrados: ${notFound.length}`, 'error');
            
            const matchRate = this.excelValues.length > 0 ? (found.length / this.excelValues.length * 100).toFixed(1) : 0;
            this.showMessage(`   📈 Taxa de correspondência: ${matchRate}%`, 'info');

            // Mostrar valores não encontrados
            if (notFound.length > 0) {
                this.showMessage('', 'info');
                this.showMessage('❌ VALORES NÃO ENCONTRADOS:', 'header');
                notFound.forEach((val, i) => {
                    this.showMessage(`   ${i+1}. ${val.valor.toFixed(2)}€ ('${val.original}')`, 'error');
                });
            }

            // Mostrar correspondências
            if (found.length > 0) {
                this.showMessage('', 'info');
                this.showMessage('✅ CORRESPONDÊNCIAS ENCONTRADAS:', 'header');
                found.slice(0, 10).forEach((match, i) => {
                    const excelVal = match.excelValue;
                    const mov = match.movement;
                    this.showMessage(`   ${i+1}. ${excelVal.valor.toFixed(2)}€ → ${mov.data} - ${mov.descricao.substring(0, 40)}...`, 'success');
                });
                if (found.length > 10) {
                    this.showMessage(`   ... e mais ${found.length - 10} correspondências`, 'success');
                }
            }

            this.showMessage('', 'info');
            this.showMessage('✅ Comparação concluída!', 'success');
            this.showMessage('➡️ Clique "Exportar Relatório" para guardar os resultados', 'info');

            // Ativar botão de exportação
            document.getElementById('export-btn').disabled = false;

            // Atualizar estatísticas
            this.updateStatsWithComparison();

        } catch (error) {
            this.showMessage(`❌ Erro na comparação: ${error.message}`, 'error');
        }
    }

    parseExcelValues(text) {
        const values = [];
        const lines = text.split('\n');

        for (const line of lines) {
            // Dividir por vírgula e processar cada valor
            const parts = line.split(',');
            for (let part of parts) {
                part = part.trim();
                if (part) {
                    const value = this.parseMonetaryValue(part);
                    if (value !== null) {
                        values.push({
                            valor: Math.abs(value),
                            original: part
                        });
                    }
                }
            }
        }

        return values;
    }

    updateStats() {
        document.getElementById('total-movements').textContent = this.csvData.length;
        document.getElementById('stats').style.display = 'flex';
    }

    updateStatsWithComparison() {
        if (this.comparisonResults) {
            document.getElementById('pdf-values-count').textContent = this.comparisonResults.excelValues.length;
            document.getElementById('matches-count').textContent = this.comparisonResults.found.length;
            document.getElementById('no-matches-count').textContent = this.comparisonResults.notFound.length;
            
            const rate = this.comparisonResults.excelValues.length > 0 ? 
                (this.comparisonResults.found.length / this.comparisonResults.excelValues.length * 100).toFixed(1) : 0;
            document.getElementById('match-rate').textContent = rate + '%';
        }
    }

    exportReport() {
        try {
            if (!this.comparisonResults) {
                throw new Error('Execute primeiro a comparação de valores');
            }

            // Criar conteúdo do relatório
            const now = new Date();
            const timestamp = now.toLocaleString('pt-PT');
            
            let reportContent = '';
            reportContent += '='.repeat(60) + '\n';
            reportContent += 'RELATÓRIO DE VERIFICAÇÃO DE EXTRATOS BANCÁRIOS\n';
            reportContent += '='.repeat(60) + '\n\n';
            reportContent += `Data/Hora: ${timestamp}\n\n`;

            // Resumo
            reportContent += 'RESUMO:\n';
            reportContent += '-'.repeat(20) + '\n';
            reportContent += `Total valores folha de cofre: ${this.comparisonResults.excelValues.length}\n`;
            reportContent += `Encontrados: ${this.comparisonResults.found.length}\n`;
            reportContent += `Não encontrados: ${this.comparisonResults.notFound.length}\n`;
            const rate = this.comparisonResults.excelValues.length > 0 ? 
                (this.comparisonResults.found.length / this.comparisonResults.excelValues.length * 100).toFixed(1) : 0;
            reportContent += `Taxa correspondência: ${rate}%\n\n`;

            // Valores não encontrados
            if (this.comparisonResults.notFound.length > 0) {
                reportContent += 'VALORES NÃO ENCONTRADOS:\n';
                reportContent += '-'.repeat(30) + '\n';
                this.comparisonResults.notFound.forEach((val, i) => {
                    reportContent += `${i+1}. ${val.valor.toFixed(2)}€ ('${val.original}')\n`;
                });
                reportContent += '\n';
            }

            // Correspondências
            if (this.comparisonResults.found.length > 0) {
                reportContent += 'CORRESPONDÊNCIAS ENCONTRADAS:\n';
                reportContent += '-'.repeat(35) + '\n';
                this.comparisonResults.found.forEach((match, i) => {
                    const excelVal = match.excelValue;
                    const mov = match.movement;
                    reportContent += `${i+1}. ${excelVal.valor.toFixed(2)}€ → ${mov.data} - ${mov.descricao}\n`;
                });
                reportContent += '\n';
            }

            // Todos os movimentos
            reportContent += 'TODOS OS MOVIMENTOS DOS EXTRATOS:\n';
            reportContent += '-'.repeat(40) + '\n';
            this.comparisonResults.csvData.forEach((mov, i) => {
                reportContent += `${i+1}. ${mov.data} - ${mov.descricao} - ${mov.valor.toFixed(2)}€\n`;
            });

            // Download do ficheiro
            this.downloadTextFile(reportContent, `relatorio_extratos_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.txt`);

            this.showMessage('✅ Relatório exportado com sucesso!', 'success');

        } catch (error) {
            this.showMessage(`❌ Erro ao exportar: ${error.message}`, 'error');
        }
    }

    downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    clearAll() {
        // Limpar ficheiros
        document.getElementById('csv1').value = '';
        document.getElementById('csv2').value = '';
        document.getElementById('excel').value = '';

        // Limpar status
        document.getElementById('csv1-status').textContent = 'Nenhum ficheiro selecionado';
        document.getElementById('csv2-status').textContent = 'Nenhum ficheiro selecionado';
        document.getElementById('excel-status').textContent = 'Nenhum ficheiro selecionado';

        document.getElementById('csv1-status').classList.remove('selected');
        document.getElementById('csv2-status').classList.remove('selected');
        document.getElementById('excel-status').classList.remove('selected');

        // Limpar valores Excel
        document.getElementById('excel-values').value = '';

        // Limpar dados
        this.csvData = [];
        this.excelValues = [];
        this.comparisonResults = null;

        // Desativar botões
        document.getElementById('compare-btn').disabled = true;
        document.getElementById('export-btn').disabled = true;

        // Limpar resultados
        this.clearResults();

        // Esconder estatísticas
        document.getElementById('stats').style.display = 'none';

        // Mostrar mensagem
        this.showMessage('🧹 Tudo limpo! Pronto para novos ficheiros.', 'info');
    }
}

// Inicializar aplicação quando página carregar
document.addEventListener('DOMContentLoaded', () => {
    new VerificadorExtratos();
});
