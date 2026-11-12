import DOMPurify from 'dompurify';
import { describe, expect, it } from 'vitest';

describe('Patched HTML sanitizer', () => {
    it('keeps safe descriptions and removes executable content', () => {
        const result = DOMPurify.sanitize('<p>Movie <strong>description</strong></p><script>alert(1)</script><img src=x onerror=alert(1)>');
        expect(result).toContain('<p>Movie <strong>description</strong></p>');
        expect(result).not.toMatch(/<script|onerror/i);
    });

    it('removes JavaScript URLs and SVG event handlers', () => {
        const result = DOMPurify.sanitize('<a href="javascript:alert(1)">Movie</a><svg onload="alert(1)"></svg>');
        expect(result).toContain('Movie');
        expect(result).not.toMatch(/javascript:|onload/i);
    });
});
