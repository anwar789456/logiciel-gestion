/**
 * Print Bon de Réception
 * Generates a print layout matching the Excel export format
 * @param {Object} bon - The bon de réception data
 */
export const printBonReception = (bon) => {
  // Check if any article has remise
  const hasRemise = bon.articles && bon.articles.some(article => {
    const remise = parseFloat(article.remise) || 0;
    return remise > 0;
  });

  // Calculate totals
  let totalHT = 0;
  const articles = bon.articles || [];
  
  articles.forEach(article => {
    const qty = parseFloat(article.quantity) || 0;
    const puHT = parseFloat(article.pu_ht) || 0;
    const remisePct = parseFloat(article.remise) || 0;
    
    const montantRemise = (puHT * remisePct) / 100;
    const puApresRemise = puHT - montantRemise;
    const totalArticleHT = puApresRemise * qty;
    
    totalHT += totalArticleHT;
  });
  
  const avance = parseFloat(bon.avance) || 0;
  const reglement = parseFloat(bon.reglement) || 0;
  const reste = totalHT - avance;
  const dateStr = bon.createdAt ? new Date(bon.createdAt).toLocaleDateString('fr-FR') : '';

  // Create print window content
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bon de Réception</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
          padding: 2mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.4;
          color: #000;
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 15px;
        }
        
        .logo-section {
          flex: 1;
        }
        
        .logo {
          margin-top: 10px;
          margin-left: 10px;
          max-width: 240px;
          height: auto;
        }
        
        .supplier-info {
          margin-top: 10px;
          margin-right: 10px;
          text-align: right;
          flex: 1;
        }
        
        .supplier-info div {
          margin-bottom: 5px;
        }
        
        .supplier-label {
          font-weight: bold;
          display: inline-block;
          width: 100px;
          text-align: right;
        }
        
        .title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin: 30px 0 20px 0;
        }
        
        .date {
          text-align: center;
          margin-bottom: 30px;
          font-size: 11pt;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        th {
          background-color: white;
          font-weight: bold;
          text-align: center;
          font-size: 10pt;
        }
        
        td {
          font-size: 10pt;
        }
        
        .text-center {
          text-align: center;
        }
        
        .text-right {
          text-align: right;
        }
        
        .total-row {
          font-weight: bold;
          background-color: white;
        }
        
        .payment-section {
          margin-top: 30px;
          float: right;
          width: 300px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          border: 1px solid #000;
          margin-bottom: -1px;
        }
        
        .payment-label {
          font-weight: bold;
        }
        
        .payment-value {
          text-align: right;
        }
        
        .reste-row {
          font-weight: bold;
          background-color: white;
        }
        
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="logo-section">
          <img src="/logo-samet-home.png" alt="SAMET HOME" class="logo" onerror="this.style.display='none'">
        </div>
        <div class="supplier-info">
          <div><span class="supplier-label">Fournisseur:</span> ${bon.fournisseur || ''}</div>
          <div><span class="supplier-label">ADRESSE:</span> ${bon.adresse || ''}</div>
          <div><span class="supplier-label">GSM:</span> ${bon.gsm || ''}</div>
        </div>
      </div>
      
      <!-- Title -->
      <div class="title">BON DE RÉCEPTION N° ${bon.compteur || ''}</div>
      
      <!-- Date -->
      <div class="date">Ariana le: ${dateStr}</div>
      
      <!-- Articles Table -->
      <table>
        <thead>
          <tr>
            ${hasRemise ? `
              <th style="width: 40%;">Description</th>
              <th style="width: 11%;">Réf/Couleur</th>
              <th style="width: 10%;">Qté</th>
              <th style="width: 13%;">Prix Unit HT</th>
              <th style="width: 10%;">Remise</th>
              <th style="width: 14%;">Total HT</th>
            ` : `
              <th style="width: 45%;">Description</th>
              <th style="width: 15%;">Réf/Couleur</th>
              <th style="width: 12%;">Qté</th>
              <th style="width: 15%;">Prix Unit HT</th>
              <th style="width: 15%;">Total HT</th>
            `}
          </tr>
        </thead>
        <tbody>
          ${articles.map(article => {
            const qty = parseFloat(article.quantity) || 0;
            const puHT = parseFloat(article.pu_ht) || 0;
            const remisePct = parseFloat(article.remise) || 0;
            
            const montantRemise = (puHT * remisePct) / 100;
            const puApresRemise = puHT - montantRemise;
            const totalArticleHT = puApresRemise * qty;
            
            if (hasRemise) {
              return `
                <tr>
                  <td>${article.description || ''}</td>
                  <td>${article.ref_couleur || ''}</td>
                  <td class="text-center">${qty}</td>
                  <td class="text-right">${puHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right">${remisePct.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right">${totalArticleHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `;
            } else {
              return `
                <tr>
                  <td>${article.description || ''}</td>
                  <td>${article.ref_couleur || ''}</td>
                  <td class="text-center">${qty}</td>
                  <td class="text-right">${puHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right">${totalArticleHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `;
            }
          }).join('')}
          <tr class="total-row">
            <td colspan="${hasRemise ? '5' : '4'}" class="text-center">Total</td>
            <td class="text-right">${totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
      
      <!-- Payment Information -->
      <div class="payment-section">
        <div class="payment-row">
          <span class="payment-label">Avance</span>
          <span class="payment-value">${avance.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="payment-row">
          <span class="payment-label">Règlement</span>
          <span class="payment-value">${reglement.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="payment-row reste-row">
          <span class="payment-label">Reste à payer</span>
          <span class="payment-value">${reste.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();
};
