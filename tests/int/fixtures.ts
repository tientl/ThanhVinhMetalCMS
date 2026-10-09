/**
 * Tệp mẫu cho test upload. Payload kiểm tra cấu trúc thật của tệp
 * (PDF phải có header %PDF-, bảng xref và %%EOF) nên không dùng chuỗi giả được.
 */
export const minimalPdf = (): Buffer =>
  Buffer.from(
    [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj',
      'xref',
      '0 3',
      '0000000000 65535 f ',
      'trailer<</Size 3/Root 1 0 R>>',
      'startxref',
      '0',
      '%%EOF',
    ].join('\n'),
    'latin1',
  )

/** Nội dung DXF tối giản, đủ để nhận là bản vẽ. */
export const minimalDxf = (): Buffer =>
  Buffer.from(['0', 'SECTION', '2', 'ENTITIES', '0', 'ENDSEC', '0', 'EOF'].join('\n'), 'latin1')
