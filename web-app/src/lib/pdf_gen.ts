// pdfUtils.js
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";

export async function generatePDF(data) {
  const { qrString, name, address } = data;
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
  const { width, height } = page.getSize();

  // Draw rectangle
  const rectX = 10;
  const rectY = height - 160;
  const rectWidth = 300;
  const rectHeight = 150;
  page.drawRectangle({
    x: rectX,
    y: rectY,
    width: rectWidth,
    height: rectHeight,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // Generate QR Code
  const qrDataUrl = await QRCode.toDataURL(qrString);
  const qrImage = await pdfDoc.embedPng(qrDataUrl);
  page.drawImage(qrImage, {
    x: rectX + 10,
    y: rectY + 30,
    width: 100,
    height: 100,
  });

  // Draw text (name & address) beside the QR code
  page.drawText(name, {
    x: rectX + 120,
    y: rectY + 110,
    size: 14,
    color: rgb(0, 0, 0),
  });
  page.drawText(address, {
    x: rectX + 120,
    y: rectY + 90,
    size: 12,
    color: rgb(0, 0, 0),
  });

  return await pdfDoc.save();
}