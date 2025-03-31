// PDFGenerator.js
"use client";

import { useState } from "react";
import { generatePDF } from "@/lib/pdf_gen";

export default function PDFGenerator() {
  const [loading, setLoading] = useState(false);

  const handleGeneratePDF = async () => {
    setLoading(true);
    const pdfBytes = await generatePDF({
      qrString: "https://example.com",
      name: "John Doe",
      address: "123 Main St, City, Country",
    });
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "order_sheet.pdf";
    link.click();
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <button
        onClick={handleGeneratePDF}
        className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate PDF"}
      </button>
    </div>
  );
}
