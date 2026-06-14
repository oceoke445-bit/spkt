import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { LetterRequest } from '@/lib/types/spkt';

export async function generateLetterPdf(letter: LetterRequest): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const draw = (text: string, x: number, y: number, size = 11, bold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.1, 0.1, 0.2),
    });
  };

  let y = 780;
  draw('KEPOLISIAN NEGARA REPUBLIK INDONESIA', 150, y, 12, true);
  y -= 18;
  draw('SURAT KETERANGAN / LAYANAN SPKT DIGITAL', 165, y, 11, true);
  y -= 40;

  draw(`Nomor: ${letter.requestNumber}`, 50, y);
  y -= 20;
  draw(`Tanggal: ${new Date(letter.createdAt).toLocaleDateString('id-ID')}`, 50, y);
  y -= 30;

  draw('Data Pemohon', 50, y, 12, true);
  y -= 18;
  draw(`Nama     : ${letter.requesterName}`, 50, y);
  y -= 16;
  draw(`NIK      : ${letter.requesterNIK}`, 50, y);
  y -= 16;
  draw(`Jenis    : ${letter.letterType}`, 50, y);
  y -= 16;
  draw(`Keperluan: ${letter.purpose}`, 50, y, 10);
  y -= 30;

  draw('Status Pengajuan', 50, y, 12, true);
  y -= 18;
  draw(`Status saat ini: ${letter.status.toUpperCase()}`, 50, y);
  if (letter.pickupDate) {
    y -= 16;
    draw(`Tanggal pengambilan: ${new Date(letter.pickupDate).toLocaleDateString('id-ID')}`, 50, y);
  }
  y -= 30;

  if (letter.timeline?.length) {
    draw('Riwayat Proses', 50, y, 12, true);
    y -= 18;
    for (const event of letter.timeline.slice(-6)) {
      const line = `- ${event.status} (${new Date(event.timestamp).toLocaleString('id-ID')})`;
      draw(line, 50, y, 9);
      y -= 14;
      if (y < 80) break;
    }
    y -= 10;
  }

  draw(
    'Dokumen ini diterbitkan secara elektronik melalui SPKT Digital dan sah tanpa tanda tangan basah.',
    50,
    80,
    9,
  );
  draw('Polri — Melayani Masyarakat', 50, 60, 9, true);

  return doc.save();
}
