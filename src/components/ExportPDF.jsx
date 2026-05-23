import jsPDF from "jspdf";

function ExportPDF({ expenses }) {
  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text("Expense Report", 10, 10);

    expenses.forEach((e, i) => {
      doc.text(`${e.title} - $${e.amount}`, 10, 20 + i * 10);
    });

    doc.save("report.pdf");
  };

  return <button onClick={downloadPDF}>Export PDF</button>;
}

export default ExportPDF;