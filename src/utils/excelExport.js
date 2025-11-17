import ExcelJS from 'exceljs';

/**
 * Export Bon de Commande Fournisseur to Excel
 * @param {Object} bon - The bon de commande data
 */
export const exportBonCommandeFournisseurToExcel = async (bon) => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bon de Commande Fournisseur');
  
  // Set column widths
  worksheet.columns = [
    { width: 55 }, // A - Description
    { width: 15 }, // B - Réf/Couleur
    { width: 8 }, // C - Qté
    { width: 14 }, // D - PU HT
    { width: 11 }, // E - Remise %
    { width: 14 }, // F - PU TTC
    { width: 15 }, // G - Total TTC
  ];
  
  // Add logo image
  try {
    const response = await fetch('/logo-samet-home.png');
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    
    const imageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'png',
    });
    
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 240, height: 35 }
    });
  } catch (error) {
    console.warn('Could not load logo image:', error);
  }
  
  // Supplier information (rows 1-3)
  worksheet.getCell('D1').value = 'Founisseur:';
  worksheet.getCell('E1').value = bon.fournisseur || '';
  worksheet.getCell('D2').value = 'ADRESSE:';
  worksheet.getCell('E2').value = bon.adresse || '';
  worksheet.getCell('D3').value = 'GSM:';
  worksheet.getCell('E3').value = bon.gsm || '';
  
  // Title (row 8)
  worksheet.mergeCells('A8:G8');
  const titleCell = worksheet.getCell('A8');
  const year = bon.date_bon ? new Date(bon.date_bon).getFullYear() : new Date().getFullYear();
  titleCell.value = `BON DE COMMANDE N° ${bon.compteur || ''}/${year}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Date (row 11)
  const dateStr = bon.date_bon ? new Date(bon.date_bon).toLocaleDateString('fr-FR') : '';
  worksheet.mergeCells('A11:G11');
  const dateCell = worksheet.getCell('A11');
  dateCell.value = `Ariana le: ${dateStr}`;
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Table header (row 14)
  const headerRow = worksheet.getRow(14);
  headerRow.values = ['Description', 'Réf/Couleur', 'Qté', 'Prix Unit HT', 'Remise %', 'Prix Unit TTC', 'Total TTC'];
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  
  // Articles data
  let totalTTC = 0;
  let currentRow = 15;
  
  if (bon.articles && bon.articles.length > 0) {
    bon.articles.forEach(article => {
      const qty = parseFloat(article.quantity) || 0;
      const puHT = parseFloat(article.pu_ht) || 0;
      const remisePct = parseFloat(article.pht) || 0;
      
      // Calculate: PU après Remise = PU HT - (PU HT × Remise%)
      const montantRemise = (puHT * remisePct) / 100;
      const puApresRemise = puHT - montantRemise;
      
      // Calculate: PU TTC = PU après Remise × 1.19
      const puTTC = puApresRemise * 1.19;
      
      // Calculate: Total TTC = PU TTC × Quantity
      const totalArticleTTC = puTTC * qty;
      totalTTC += totalArticleTTC;
      
      const row = worksheet.getRow(currentRow);
      row.values = [
        article.description || '',
        article.ref_couleur || '',
        qty,
        puHT,
        remisePct,
        puTTC,
        totalArticleTTC
      ];
      
      // Format numbers and add borders
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= 7) {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });
      
      row.getCell(3).numFmt = '0';
      row.getCell(4).numFmt = '#,##0.00';
      row.getCell(5).numFmt = '#,##0.00';
      row.getCell(6).numFmt = '#,##0.00';
      row.getCell(7).numFmt = '#,##0.00';
      
      currentRow++;
    });
  }
  
  // Total row
  const totalRow = worksheet.getRow(currentRow);

  // Merge cells A to F for "Total" label
  worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
  // Write "Total" in the merged cells
  totalRow.getCell(1).value = "Total";
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  // Put the total value in G
  totalRow.getCell(7).value = totalTTC;
  totalRow.getCell(7).numFmt = '#,##0.00';
  // Make the row bold
  totalRow.font = { bold: true };
  
  // Add borders to total row
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= 7) {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  });
  
  currentRow += 3; // Skip 2 rows
  
  // Payment information
  const avance = parseFloat(bon.avance) || 0;
  const reste = totalTTC - avance;
  
  const avanceRow = worksheet.getRow(currentRow);
  avanceRow.values = ['', '', '', '', '', 'Avance', avance];
  avanceRow.getCell(7).numFmt = '#,##0.00';
  // Add borders to Avance row
  avanceRow.getCell(6).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  avanceRow.getCell(7).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  currentRow++;
  const reglementRow = worksheet.getRow(currentRow);
  reglementRow.values = ['', '', '', '', '', 'Règlement', parseFloat(bon.reglement) || 0];
  reglementRow.getCell(7).numFmt = '#,##0.00';
  // Add borders to Règlement row
  reglementRow.getCell(6).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  reglementRow.getCell(7).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  currentRow++;
  const resteRow = worksheet.getRow(currentRow);
  resteRow.values = ['', '', '', '', '', 'Reste à payer', reste];
  resteRow.font = { bold: true };
  resteRow.getCell(7).numFmt = '#,##0.00';
  // Add borders to Reste à payer row
  resteRow.getCell(6).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  resteRow.getCell(7).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  // Generate filename
  const filename = `Bon_Commande_${bon.compteur || 'N'}_${new Date().toISOString().split('T')[0]}.xlsx`;
  
  // Write file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};
