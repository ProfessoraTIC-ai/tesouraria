# 🏦 Verificador de Extratos Bancários - Aplicação Web

Uma aplicação web moderna para comparar valores de PDFs com movimentos de extratos bancários CSV.

## ✨ Características

- **🌐 100% Browser** - Funciona diretamente no navegador
- **🔒 Privacidade Total** - Todos os dados processados localmente
- **📱 Responsivo** - Funciona em desktop, tablet e móvel
- **🎨 Interface Moderna** - Design profissional e intuitivo
- **📊 Estatísticas Visuais** - Gráficos e métricas em tempo real
- **💾 Exportação** - Relatórios detalhados para download

## 🚀 Como Usar

### 1. Selecionar Ficheiros
- **CSV 1 e CSV 2**: Os dois extratos bancários
- **PDF** (opcional): Folha de cofre para processamento automático

### 2. Processar Ficheiros
- Clique em "Processar Ficheiros"
- Aguarde análise dos CSVs
- Veja resumo dos movimentos encontrados

### 3. Inserir Valores do PDF
- Se PDF é digitalizado, insira valores manualmente
- Formatos aceites: `123,45€`, `123.45 EUR`, `€123,45`, `123.45`
- Separe por vírgula ou nova linha

### 4. Comparar Valores
- Clique em "Comparar Valores"
- Sistema identifica correspondências automaticamente
- Tolerância de 0,01€ para comparações

### 5. Exportar Relatório
- Clique em "Exportar Relatório"
- Download automático de ficheiro .txt
- Relatório completo com todas as informações

## 📋 Formatos Suportados

### Ficheiros CSV
- **Encoding**: ISO-8859-1, Latin-1, UTF-8
- **Separador**: Ponto e vírgula (`;`)
- **Estrutura**:
  ```
  Data mov.;Data-valor;Descrição;Montante;Saldo;
  30-05-2025;30-05-2025;DESCRIÇÃO;-123,45;1.000,00;
  ```

### Valores Monetários
- `123,45€` (formato português)
- `123.45 EUR` (formato internacional)
- `€123,45` (símbolo antes)
- `123.45` (apenas número)

## 🔧 Funcionalidades Técnicas

### Processamento CSV
- Detecção automática de encoding
- Parsing inteligente de estrutura
- Conversão automática de valores monetários
- Validação de dados

### Comparação de Valores
- Algoritmo de correspondência com tolerância
- Comparação usando valores absolutos
- Identificação de duplicatas
- Relatórios detalhados

### Interface Responsiva
- Adaptação automática a diferentes ecrãs
- Suporte touch para dispositivos móveis
- Feedback visual em tempo real
- Animações suaves

## 🛡️ Segurança e Privacidade

- ✅ **Processamento Local**: Todos os dados ficam no browser
- ✅ **Sem Servidores**: Nenhuma informação enviada externamente
- ✅ **Sem Instalação**: Funciona diretamente do GitHub Pages
- ✅ **Código Aberto**: Todo o código é visível e auditável

## 📊 Exemplo de Uso

1. **Upload de Ficheiros**:
   - `extrato_conta1.csv` (142 movimentos)
   - `extrato_conta2.csv` (95 movimentos)

2. **Processamento**:
   - Total: 237 movimentos carregados
   - Detecção automática de formato

3. **Valores PDF**:
   ```
   6000.00, 36.90, 25.65, 258.60, 52.50
   ```

4. **Resultados**:
   - ✅ Encontrados: 85 valores
   - ❌ Não encontrados: 3 valores
   - 📈 Taxa: 96.6% correspondência

## 🌐 Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo e animações
- **JavaScript ES6+** - Lógica de processamento
- **File API** - Upload e leitura de ficheiros
- **Blob API** - Geração de relatórios

## 📱 Compatibilidade

- **Chrome** 60+ ✅
- **Firefox** 55+ ✅
- **Safari** 12+ ✅
- **Edge** 79+ ✅
- **Mobile Browsers** ✅

## 🚀 Deploy no GitHub Pages

Esta aplicação está pronta para deploy imediato no GitHub Pages:

1. Faça upload dos ficheiros para repositório GitHub
2. Ative GitHub Pages nas configurações
3. Acesse via `https://seuusuario.github.io/repositorio`

## 📞 Suporte

Para questões ou melhorias:
- Abra issue no repositório GitHub
- Forneça detalhes sobre o problema
- Inclua exemplos de ficheiros se possível

## 📄 Licença

Este projeto é de código aberto para uso pessoal e profissional.

---

**Desenvolvido para processamento seguro e eficiente de extratos bancários**
