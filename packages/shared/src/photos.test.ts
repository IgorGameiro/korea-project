import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validatePhotos } from './photos.ts';

const credit = {
  author: 'Jane Doe',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Example.jpg',
};

describe('validatePhotos', () => {
  it('accepts credited photos, public domain without a license link, and placeholders', () => {
    assert.deepEqual(
      validatePhotos([
        { url: 'https://upload.wikimedia.org/a.jpg', credit },
        {
          url: 'https://upload.wikimedia.org/b.jpg',
          credit: { ...credit, license: 'Public domain', licenseUrl: null },
        },
        { url: 'https://picsum.photos/c' },
      ]),
      [],
    );
  });

  it('rejects non-https URLs and incomplete credits', () => {
    assert.deepEqual(
      validatePhotos([
        { url: 'http://example.com/a.jpg' },
        {
          url: 'https://example.com/b.jpg',
          credit: { author: ' ', license: '', sourceUrl: 'ftp://x' },
        },
      ]),
      [
        '[0].url must be an https URL',
        '[1].credit.author is required',
        '[1].credit.license is required',
        '[1].credit.sourceUrl must be an https URL',
      ],
    );
  });

  it('accepts an http license link (some license sites have no https) but not other schemes', () => {
    assert.deepEqual(
      validatePhotos([
        { url: 'https://a.b/c', credit: { ...credit, licenseUrl: 'http://www.kogl.or.kr/x' } },
      ]),
      [],
    );
    assert.deepEqual(
      validatePhotos([
        { url: 'https://a.b/c', credit: { ...credit, licenseUrl: 'javascript:alert(1)' } },
      ]),
      ['[0].credit.licenseUrl must be an http(s) URL'],
    );
  });

  it('rejects other shapes', () => {
    assert.deepEqual(validatePhotos('x'), ['must be an array']);
    assert.deepEqual(validatePhotos([null]), ['[0] must be an object']);
    assert.equal(
      validatePhotos(Array.from({ length: 21 }, () => ({ url: 'https://a.b/c' }))).length,
      1,
    );
  });
});
