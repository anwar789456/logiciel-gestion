import ExcelJS from 'exceljs';

/**
 * Export Bon de Réception to Excel
 * @param {Object} bon - The bon de réception data
 */
export const exportBonReceptionToExcel = async (bon) => {
  // Check if any article has remise
  const hasRemise = bon.articles && bon.articles.some(article => {
    const remise = parseFloat(article.remise) || 0;
    return remise > 0;
  });

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Bon de Réception');
  
  // Set column widths based on whether remise exists
  if (hasRemise) {
    worksheet.columns = [
      { width: 55 }, // A - Description
      { width: 15 }, // B - Réf/Couleur
      { width: 8 }, // C - Qté
      { width: 14 }, // D - PU HT
      { width: 11 }, // E - Remise %
      { width: 15 }, // F - Total HT
    ];
  } else {
    worksheet.columns = [
      { width: 55 }, // A - Description
      { width: 15 }, // B - Réf/Couleur
      { width: 8 }, // C - Qté
      { width: 14 }, // D - PU HT
      { width: 15 }, // E - Total HT
    ];
  }
  
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
  worksheet.getCell('D1').value = 'Fournisseur:';
  worksheet.getCell('E1').value = bon.fournisseur || '';
  worksheet.getCell('D2').value = 'ADRESSE:';
  worksheet.getCell('E2').value = bon.adresse || '';
  worksheet.getCell('D3').value = 'GSM:';
  worksheet.getCell('E3').value = bon.gsm || '';
  
  // Title (row 8)
  const titleMerge = hasRemise ? 'A8:F8' : 'A8:E8';
  worksheet.mergeCells(titleMerge);
  const titleCell = worksheet.getCell('A8');
  titleCell.value = `BON DE RÉCEPTION N° ${bon.compteur || ''}`;
  titleCell.font = { bold: true, size: 14 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Date (row 11)
  const dateStr = bon.createdAt ? new Date(bon.createdAt).toLocaleDateString('fr-FR') : '';
  const dateMerge = hasRemise ? 'A11:F11' : 'A11:E11';
  worksheet.mergeCells(dateMerge);
  const dateCell = worksheet.getCell('A11');
  dateCell.value = `Ariana le: ${dateStr}`;
  dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  // Table header (row 14)
  const headerRow = worksheet.getRow(14);
  if (hasRemise) {
    headerRow.values = ['Description', 'Réf/Couleur', 'Qté', 'Prix Unit HT', 'Remise', 'Total HT'];
  } else {
    headerRow.values = ['Description', 'Réf/Couleur', 'Qté', 'Prix Unit HT', 'Total HT'];
  }
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
  let totalHT = 0;
  let currentRow = 15;
  
  if (bon.articles && bon.articles.length > 0) {
    bon.articles.forEach(article => {
      const qty = parseFloat(article.quantity) || 0;
      const puHT = parseFloat(article.pu_ht) || 0;
      const remisePct = parseFloat(article.remise) || 0;
      
      // Calculate: Total HT = (PU HT - (PU HT × Remise%)) × Quantity
      const montantRemise = (puHT * remisePct) / 100;
      const puApresRemise = puHT - montantRemise;
      const totalArticleHT = puApresRemise * qty;
      totalHT += totalArticleHT;
      
      const row = worksheet.getRow(currentRow);
      if (hasRemise) {
        row.values = [
          article.description || '',
          article.ref_couleur || '',
          qty,
          puHT,
          remisePct,
          totalArticleHT
        ];
      } else {
        row.values = [
          article.description || '',
          article.ref_couleur || '',
          qty,
          puHT,
          totalArticleHT
        ];
      }
      
      // Format numbers and add borders
      const maxCol = hasRemise ? 6 : 5;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        if (colNumber <= maxCol) {
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
      if (hasRemise) {
        row.getCell(5).numFmt = '#,##0.00';
        row.getCell(6).numFmt = '#,##0.00';
      } else {
        row.getCell(5).numFmt = '#,##0.00';
      }
      
      currentRow++;
    });
  }
  
  // Total row
  const totalRow = worksheet.getRow(currentRow);

  // Merge cells for "Total" label
  const totalMerge = hasRemise ? `A${currentRow}:E${currentRow}` : `A${currentRow}:D${currentRow}`;
  worksheet.mergeCells(totalMerge);
  // Write "Total" in the merged cells
  totalRow.getCell(1).value = "Total";
  totalRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
  // Put the total value in the last column
  const totalCol = hasRemise ? 6 : 5;
  totalRow.getCell(totalCol).value = totalHT;
  totalRow.getCell(totalCol).numFmt = '#,##0.00';
  // Make the row bold
  totalRow.font = { bold: true };
  
  // Add borders to total row
  const maxCol = hasRemise ? 6 : 5;
  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= maxCol) {
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
  const reste = totalHT - avance;
  
  const labelCol = hasRemise ? 5 : 4;
  const valueCol = hasRemise ? 6 : 5;
  
  const avanceRow = worksheet.getRow(currentRow);
  if (hasRemise) {
    avanceRow.values = ['', '', '', '', 'Avance', avance];
  } else {
    avanceRow.values = ['', '', '', 'Avance', avance];
  }
  avanceRow.getCell(valueCol).numFmt = '#,##0.00';
  // Add borders to Avance row
  avanceRow.getCell(labelCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  avanceRow.getCell(valueCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  currentRow++;
  const reglementRow = worksheet.getRow(currentRow);
  if (hasRemise) {
    reglementRow.values = ['', '', '', '', 'Règlement', parseFloat(bon.reglement) || 0];
  } else {
    reglementRow.values = ['', '', '', 'Règlement', parseFloat(bon.reglement) || 0];
  }
  reglementRow.getCell(valueCol).numFmt = '#,##0.00';
  // Add borders to Règlement row
  reglementRow.getCell(labelCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  reglementRow.getCell(valueCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  currentRow++;
  const resteRow = worksheet.getRow(currentRow);
  if (hasRemise) {
    resteRow.values = ['', '', '', '', 'Reste à payer', reste];
  } else {
    resteRow.values = ['', '', '', 'Reste à payer', reste];
  }
  resteRow.font = { bold: true };
  resteRow.getCell(valueCol).numFmt = '#,##0.00';
  // Add borders to Reste à payer row
  resteRow.getCell(labelCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  resteRow.getCell(valueCol).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
  
  // Generate filename
  const filename = `Bon_Reception_${new Date().toISOString().split('T')[0]}.xlsx`;
  
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
