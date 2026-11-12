// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('Patched PDF.js compatibility', () => {
    it('loads an offline PDF through the ESM worker', async () => {
        const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 300] /Resources << >> /Contents 4 0 R >>',
            '<< /Length 0 >>\nstream\n\nendstream'
        ];
        let pdf = '%PDF-1.4\n';
        const offsets = [0];
        objects.forEach((object, index) => {
            offsets.push(pdf.length);
            pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
        });
        const xref = pdf.length;
        pdf += `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
        offsets.slice(1).forEach(offset => {
            pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
        });
        pdf += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

        const task = getDocument({ data: new TextEncoder().encode(pdf) });
        try {
            const book = await task.promise;
            expect(book.numPages).toBe(1);
            const page = await book.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            expect([viewport.width, viewport.height]).toEqual([200, 300]);
            expect((await page.getOperatorList()).fnArray).toEqual([]);
        } finally {
            await task.destroy();
        }
    });
});
