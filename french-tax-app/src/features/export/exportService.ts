
import { jsPDF } from 'jspdf';
import type { TaxEntry, TaxYear } from '../../core/types';
import { getCategoryMetadata } from '../../core/metadata';
import { TaxService } from '../tax/taxService';

export class ExportService {
  private taxService: TaxService;

  constructor(taxService: TaxService) {
    this.taxService = taxService;
  }

  generateCSV(entries: TaxEntry[]): string {
    const headers = ['Date', 'Type', 'Catégorie', 'Montant', 'Description', 'Justificatif', 'Personne'];
    const rows = entries.map(e => {
        const metadata = getCategoryMetadata(e.category);
        const typeLabel = e.type === 'INCOME' ? 'Revenu' : 'Dépense';
        return [
          e.date,
          typeLabel,
          metadata.label,
          e.amount.toFixed(2).replace('.', ','),
          e.description || '',
          e.documentStatus,
          e.personId || ''
        ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(';'))
    ].join('\n');

    return csvContent;
  }

  generatePDF(year: number, entries: TaxEntry[]): jsPDF {
    const doc = new jsPDF();
    const categoryTotals = this.taxService.calculateCategoryTotals(entries);
    const totalIncome = this.taxService.calculateTotalIncome(entries);
    const totalExpenses = this.taxService.calculateTotalExpenses(entries);

    // Title
    doc.setFontSize(20);
    doc.text(`Récapitulatif Fiscal ${year}`, 20, 20);

    let y = 40;

    // Income Summary
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0); // Dark Green
    doc.text('Revenus', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const incomeEntries = Object.entries(categoryTotals).filter(([cat]) => {
        const meta = getCategoryMetadata(cat as any);
        return meta.type === 'INCOME';
    });

    if (incomeEntries.length === 0) {
        doc.text("Aucun revenu déclaré.", 20, y);
        y += 10;
    } else {
        incomeEntries.forEach(([cat, amount]) => {
            const label = getCategoryMetadata(cat as any).label;
            doc.text(`${label}: ${amount.toLocaleString('fr-FR')} €`, 20, y);
            y += 7;
        });
    }
    
    y += 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Revenus: ${totalIncome.toLocaleString('fr-FR')} €`, 20, y);
    doc.setFont("helvetica", "normal");
    y += 15;

    // Expenses Summary
    doc.setFontSize(16);
    doc.setTextColor(150, 0, 0); // Dark Red
    doc.text('Dépenses / Charges', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const expenseEntries = Object.entries(categoryTotals).filter(([cat]) => {
        const meta = getCategoryMetadata(cat as any);
        return meta.type === 'EXPENSE';
    });

    if (expenseEntries.length === 0) {
        doc.text("Aucune dépense déclarée.", 20, y);
        y += 10;
    } else {
        expenseEntries.forEach(([cat, amount]) => {
            const label = getCategoryMetadata(cat as any).label;
            doc.text(`${label}: ${amount.toLocaleString('fr-FR')} €`, 20, y);
            y += 7;
        });
    }

    y += 5;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Dépenses: ${totalExpenses.toLocaleString('fr-FR')} €`, 20, y);
    doc.setFont("helvetica", "normal");
    
    // Entries Table (Simplified)
    y += 20;
    if (y > 250) { doc.addPage(); y = 20; }
    
    doc.setFontSize(14);
    doc.text('Détail des entrées', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    entries.forEach(entry => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }
        const meta = getCategoryMetadata(entry.category);
        const prefix = entry.type === 'INCOME' ? '(+)' : '(-)';
        const line = `${entry.date} | ${prefix} ${meta.label} | ${entry.amount.toLocaleString('fr-FR')} €`;
        doc.text(line, 20, y);
        y += 7;
    });

    return doc;
  }

  generateBackup(yearData: TaxYear[]): string {
      return JSON.stringify(yearData, null, 2);
  }
}
