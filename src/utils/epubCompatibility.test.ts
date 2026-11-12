import ePub from 'epubjs';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';

describe('EPUB parser compatibility', () => {
    it('opens a synthetic archived book without network access', async () => {
        const zip = new JSZip();
        zip.file('mimetype', 'application/epub+zip');
        zip.file('META-INF/container.xml', '<?xml version="1.0"?><container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="book.opf" media-type="application/oebps-package+xml"/></rootfiles></container>');
        zip.file('book.opf', '<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">synthetic</dc:identifier><dc:title>Synthetic book</dc:title><dc:language>en</dc:language></metadata><manifest><item id="chapter" href="chapter.xhtml" media-type="application/xhtml+xml"/><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/></manifest><spine><itemref idref="chapter"/></spine></package>');
        zip.file('chapter.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml"><head><title>Chapter</title></head><body><p>Synthetic text</p></body></html>');
        zip.file('nav.xhtml', '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head><body><nav epub:type="toc"><ol><li><a href="chapter.xhtml">Chapter</a></li></ol></nav></body></html>');
        const book = ePub();
        try {
            await book.open(await zip.generateAsync({ type: 'arraybuffer' }), 'binary');
            expect((await book.loaded.metadata).title).toBe('Synthetic book');
            expect(book.spine.get(0).href).toBe('chapter.xhtml');
            expect((await book.loaded.navigation).toc[0].label).toBe('Chapter');
        } finally {
            book.destroy();
        }
    });
});
