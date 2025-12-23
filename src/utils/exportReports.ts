interface Transaction {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  type: string;
  category?: { name: string } | null;
  account?: { name: string } | null;
}

interface ExportData {
  transactions: Transaction[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    period: string;
  };
}

export const exportToCSV = (data: ExportData, filename: string = "relatorio-financeiro") => {
  const { transactions, summary } = data;
  
  // Create CSV headers
  const headers = ["Data", "Descrição", "Categoria", "Conta", "Tipo", "Valor"];
  
  // Create CSV rows
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString("pt-BR"),
    t.description || "Sem descrição",
    t.category?.name || "Sem categoria",
    t.account?.name || "Sem conta",
    t.type === "income" ? "Receita" : "Despesa",
    t.type === "income" ? `R$ ${Number(t.amount).toFixed(2)}` : `-R$ ${Number(t.amount).toFixed(2)}`,
  ]);
  
  // Add summary rows at the end
  rows.push([]);
  rows.push(["=== RESUMO ===", "", "", "", "", ""]);
  rows.push(["Período", summary.period, "", "", "", ""]);
  rows.push(["Total Receitas", "", "", "", "", `R$ ${summary.totalReceitas.toFixed(2)}`]);
  rows.push(["Total Despesas", "", "", "", "", `-R$ ${summary.totalDespesas.toFixed(2)}`]);
  rows.push(["Saldo", "", "", "", "", `R$ ${summary.saldo.toFixed(2)}`]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(";"),
    ...rows.map(row => row.join(";")),
  ].join("\n");
  
  // Create blob and download
  const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: ExportData, filename: string = "relatorio-financeiro") => {
  const { transactions, summary } = data;
  
  // Create a printable HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório Financeiro - Fintrack</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10B981; padding-bottom: 20px; }
        .header h1 { color: #10B981; font-size: 28px; margin-bottom: 5px; }
        .header p { color: #666; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; flex-wrap: wrap; gap: 15px; }
        .summary-card { text-align: center; padding: 20px; border-radius: 10px; min-width: 150px; }
        .summary-card.receitas { background: #DCFCE7; }
        .summary-card.despesas { background: #FEE2E2; }
        .summary-card.saldo { background: #DBEAFE; }
        .summary-card h3 { font-size: 14px; color: #666; margin-bottom: 5px; }
        .summary-card p { font-size: 22px; font-weight: bold; }
        .summary-card.receitas p { color: #10B981; }
        .summary-card.despesas p { color: #EF4444; }
        .summary-card.saldo p { color: #3B82F6; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #F3F4F6; padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
        td { padding: 12px 8px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
        tr:hover { background: #F9FAFB; }
        .income { color: #10B981; font-weight: 600; }
        .expense { color: #EF4444; font-weight: 600; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #999; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📊 Relatório Financeiro</h1>
        <p>Fintrack - ${summary.period}</p>
        <p style="font-size: 12px; margin-top: 5px;">Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      </div>
      
      <div class="summary">
        <div class="summary-card receitas">
          <h3>Total Receitas</h3>
          <p>R$ ${summary.totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card despesas">
          <h3>Total Despesas</h3>
          <p>R$ ${summary.totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
        <div class="summary-card saldo">
          <h3>Saldo</h3>
          <p>R$ ${summary.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
      
      <h2 style="margin-bottom: 15px; color: #333;">Transações (${transactions.length})</h2>
      
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrição</th>
            <th>Categoria</th>
            <th>Conta</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${transactions.map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString("pt-BR")}</td>
              <td>${t.description || "Sem descrição"}</td>
              <td>${t.category?.name || "Sem categoria"}</td>
              <td>${t.account?.name || "-"}</td>
              <td style="text-align: right;" class="${t.type === "income" ? "income" : "expense"}">
                ${t.type === "income" ? "+" : "-"}R$ ${Number(t.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Relatório gerado automaticamente pelo Fintrack</p>
      </div>
    </body>
    </html>
  `;
  
  // Open print dialog
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
};
