import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import autoTable from 'jspdf-autotable';

/**
 * Génère un PDF pour un devis ou une facture
 * @param {Object} document - Le devis ou la facture à convertir en PDF
 * @returns {Promise<void>}
 */
export const generatePDF = async (document) => {
  // Vérifier que document est un objet valide
  if (!document || typeof document !== 'object') {
    console.error('Invalid document object:', document);
    toast.error('Erreur: Document invalide');
    throw new Error('Invalid document object');
  }

  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF();

    // Déterminer s'il s'agit d'une facture ou d'un devis
    const isFacture = document.status === 'confirmé';
    const isEntreprise = (document.type_devis || document.typeClient) === 'entreprise';
    const documentType = isFacture ? 'FACTURE' : 'DEVIS';
    const documentNumber = document.num_devis || document.devisNumber || 'N/A';

    // Header - SATRACO information
    doc.setFontSize(8);
    doc.text('SATRACO s.a.r.l - IU:1280963K', 15, 10);

    // Add company logo and header
    doc.setFontSize(16);
    doc.text('SAMET HOME', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('MEUBLES ET DÉCORATION', 105, 25, { align: 'center' });

    // Generate QR code
    try {
      // Create QR code data URL
      const qrCodeDataURL = await QRCode.toDataURL(`${documentType}:${documentNumber}-CLIENT:${document.client || document.clientName || 'N/A'}-MONTANT:${(document.totalAmount || document.totalTTC || 0).toFixed(0)}`, {
        width: 20,
        margin: 0
      });

      // Add QR code to PDF
      doc.addImage(qrCodeDataURL, 'PNG', 15, 15, 20, 20);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to placeholder if QR code generation fails
      doc.rect(15, 15, 20, 20);
    }

    // Client information - right aligned
    doc.setFontSize(10);
    const clientX = 195; // Position X pour l'alignement à droite
    let clientY = 15; // Position Y de départ pour les informations client
    const labelX = 160; // Position X pour les labels

    const clientInfo = [
      ['CLIENT:', document.client || document.clientName || ''],
      ['ADRESSE:', document.adresse || document.clientAddress || ''],
      ['Tel:', document.tel || document.clientPhone || ''],
    ];

    // Ajouter champs entreprise si nécessaire
    if (isEntreprise) {
      if (document.code_tva || document.tva) clientInfo.push(['Code TVA:', document.code_tva || document.tva || '']);
      if (document.rc) clientInfo.push(['R.C:', document.rc || '']);
      if (document.fax) clientInfo.push(['Fax:', document.fax || '']);
      if (document.contact) clientInfo.push(['Contact:', document.contact || '']);
      if (document.gsm) clientInfo.push(['GSM:', document.gsm || '']);
      if (document.adresse_mail || document.email) clientInfo.push(['Adresse Mail:', document.adresse_mail || document.email || '']);
    }

    clientInfo.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, labelX, clientY, { align: 'left' });
      doc.setFont('helvetica', 'normal');
      doc.text(value, clientX, clientY, { align: 'right' });
      clientY += 7;
    });

    // Titre centré
    doc.setFontSize(16).fillColor("#000");
    doc.setFont('helvetica', 'bold');
    doc.text(`${documentType} N° ${documentNumber}`, 105, 45, { align: 'center' });

    // Ajouter une ligne sous le titre
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(75, 47, 135, 47);

    // Ariana le: date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const formattedDate = document.date ? new Date(document.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }) : 'N/A';
    doc.text(`Ariana le: ${formattedDate}`, 105, 55, { align: 'center' });

    // Préparer les données du tableau
    const tableData = [];

    // Vérifier que items est un tableau valide
    if (document.items && Array.isArray(document.items) && document.items.length > 0) {
      document.items.forEach(item => {
        if (item && typeof item === 'object') {
          if (isFacture && isEntreprise) {
            // Mode FACTURE entreprise: Quantité, Description, Ref Couleur, P. unitaire HT, Total HT
            tableData.push([
              item.quantity || 1,
              item.description || '',
              item.ref_couleur || item.reference || '',
              (item.prix || item.unitPrice || 0).toFixed(3),
              (item.total || 0).toFixed(3)
            ]);
          } else {
            // Mode DEVIS: Description, Ref Couleur, Nombre d'unité, Prix, Total
            tableData.push([
              item.description || '',
              item.ref_couleur || item.reference || 'YY',
              item.quantity || 1,
              isEntreprise ? (item.prix || item.unitPrice || 0).toFixed(0) : `${(item.prix || item.unitPrice || 0).toFixed(0)} DT`,
              isEntreprise ? (item.total || 0).toFixed(0) : `${(item.total || 0).toFixed(0)} DT`
            ]);
          }
        }
      });
    } else {
      // Données d'exemple si aucun article n'est disponible
      if (isFacture && isEntreprise) {
        tableData.push([1, 'Article exemple', 'YY', '0.000', '0.000']);
      } else {
        tableData.push(['Article exemple', 'YY', 1, '0 DT', '0 DT']);
      }
    }

    // Colonnes adaptées selon le statut
    const tableColumns = isFacture && isEntreprise
      ? ["Quantité", "Description", "Ref Couleur", "P. unitaire HT", "Total HT"]
      : ["Description", "Ref Couleur", "Nombre d'unité", "Prix", "Total"];

    const columnStyles = isFacture && isEntreprise
      ? {
          0: { halign: 'center', cellWidth: 20 },  // Quantité
          1: { halign: 'left', cellWidth: 80 },    // Description
          2: { halign: 'center', cellWidth: 30 },  // Ref Couleur
          3: { halign: 'center', cellWidth: 30 },  // P. unitaire HT
          4: { halign: 'center', cellWidth: 30 }   // Total HT
        }
      : {
          0: { halign: 'left', cellWidth: 80 },    // Description
          1: { halign: 'center', cellWidth: 30 },  // Ref Couleur
          2: { halign: 'center', cellWidth: 20 },  // Nombre d'unité
          3: { halign: 'center', cellWidth: 30 },  // Prix
          4: { halign: 'center', cellWidth: 30 }   // Total
        };

    // Créer le tableau des articles avec autoTable
    autoTable(doc, {
      head: [tableColumns],
      body: tableData,
      startY: 65,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      columnStyles: columnStyles,
      didDrawCell: (data) => {
        // Add borders to all cells
        doc.setDrawColor(0);
        doc.setLineWidth(0.1);
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });

    // Calculer les totaux
    const totalHT = document.totalHT || document.totalAmount || 0;
    const tva = document.tva || document.tvaRate || (isEntreprise ? 19 : 0);
    const montantTVA = document.totalTVA || (totalHT * (tva / 100));
    const totalTTC = document.totalTTC || document.totalAmount || 0;
    const timbreFiscal = document.timbreFiscal || (isEntreprise ? 1 : 0);

    // Tableau des totaux
    const finalY = doc.lastAutoTable.finalY + 5;

    if (isFacture && isEntreprise && document.totalHT !== undefined) {
      // Encadré totaux pour facture entreprise
      const totalsData = [
        ['TOTAL HT', `${totalHT.toLocaleString()}`],
        ['TVA', `${montantTVA.toLocaleString()}`],
        ['Timbre Fiscal', `${timbreFiscal.toLocaleString()}`],
        ['TOTAL TTC', `${totalTTC.toLocaleString()}`]
      ];

      autoTable(doc, {
        body: totalsData,
        startY: finalY,
        margin: { left: 105 },
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        tableWidth: 90,
        columnStyles: {
          0: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' }
        },
        bodyStyles: {
          3: { fontStyle: 'bold' } // Mettre en gras la ligne Total TTC
        },
        didDrawCell: (data) => {
          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
        }
      });
    } else {
      // Total simple pour devis ou particulier
      autoTable(doc, {
        body: [
          ['Total au comptant', `${totalTTC.toFixed(0)} DT`]
        ],
        startY: finalY,
        margin: { left: 105 },
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 5 },
        tableWidth: 90,
        columnStyles: {
          0: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'center' }
        },
        didDrawCell: (data) => {
          doc.setDrawColor(0);
          doc.setLineWidth(0.1);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
        }
      });
    }

    // Espacement après le tableau des totaux
    const totalTableFinalY = doc.lastAutoTable?.finalY || finalY + 10;

    // Banking information - style simplifié
    const deliveryTableFinalY = totalTableFinalY + 20;
    const bankingY = deliveryTableFinalY + 15;

    // Pied de page différent selon le type de devis
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    if (isEntreprise) {
      // Pour les entreprises, afficher uniquement la ligne sur la livraison gratuite
      doc.text('LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)', 105, bankingY + 15, { align: 'center' });

      // Ajouter une ligne de séparation
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(40, 270, 170, 270);

      // Pied de page entreprise
      doc.setFontSize(9);
      doc.text('SATRACO s.a.r.l au Capital de 10.000 DT Av Abou Kacem Chebbi - 2080 - Ariana RC. B038912013    MF. 1280963/K/A/M/000', 105, 282, { align: 'center' });
    } else {
      // Pour les particuliers, afficher les trois lignes
      doc.text('LA LIVRAISON EST GRATUITE UNIQUEMENT SUR LE GRAND TUNIS (TUNIS, ARIANA, MANOUBA, BEN AROUS)', 105, bankingY + 5, { align: 'center' });
      doc.text('Tous les paiements sont effectués avant la livraison au showroom', 105, bankingY + 15, { align: 'center' });
      doc.text('SATRACO s.a.r.l au Capital de 10.000 DT Av Abou Kacem Chebbi - 2080 - Ariana RC: B038912013', 105, bankingY + 25, { align: 'center' });

      // Ajouter une ligne de séparation
      doc.setDrawColor(150, 150, 150);
      doc.setLineWidth(0.5);
      doc.line(40, 270, 170, 270);

      // Adresse et téléphone
      doc.text('Avenue Abou Kacem Chebbi / Tél: 56 834 015 / 56 834 016', 105, 275, { align: 'center' });
    }

    // Télécharger le PDF
    const fileName = isFacture ? `Facture_${documentNumber}` : `Devis_${documentNumber}`;
    doc.save(`${fileName}.pdf`);

    // Afficher un message de succès
    toast.success(isFacture ? 'Facture exportée avec succès' : 'Devis exporté avec succès');

  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Erreur lors de la génération du PDF');
    throw error;
  }
};