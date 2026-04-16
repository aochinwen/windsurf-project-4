function splitHeaderBody(input) {
  const normalized = `${input}`.replace(/\r\n/g, '\n');
  const sep = normalized.indexOf('\n\n');
  if (sep === -1) return { rawHeaders: '', body: normalized };
  return {
    rawHeaders: normalized.slice(0, sep),
    body: normalized.slice(sep + 2),
  };
}

function parseHeaders(rawHeaders = '') {
  const headers = {};
  const lines = `${rawHeaders}`.split('\n');
  let currentKey = '';

  for (const line of lines) {
    if (/^[ \t]/.test(line) && currentKey) {
      headers[currentKey] += ` ${line.trim()}`;
      continue;
    }
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    currentKey = line.slice(0, idx).trim().toLowerCase();
    headers[currentKey] = line.slice(idx + 1).trim();
  }

  return headers;
}

function decodeBytesToText(bytes) {
  try {
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return String.fromCharCode(...bytes);
  }
}

function decodeQuotedPrintable(text = '') {
  const cleaned = `${text}`
    .replace(/=\r?\n/g, '')
    .replace(/=A0/gi, '\u00A0')
    .replace(/=([A-Fa-f0-9]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
  const bytes = [];
  const encoder = new TextEncoder();

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '=' && /^[A-Fa-f0-9]{2}$/.test(cleaned.slice(i + 1, i + 3))) {
      bytes.push(parseInt(cleaned.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(...encoder.encode(ch));
    }
  }

  return decodeBytesToText(Uint8Array.from(bytes));
}

function decodeBase64Text(text = '') {
  try {
    const compact = `${text}`.replace(/\s+/g, '');
    const binary = atob(compact);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return decodeBytesToText(bytes);
  } catch {
    return text;
  }
}

function decodeEncodedWord(value = '') {
  return `${value}`.replace(/=\?([^?]+)\?([bBqQ])\?([^?]+)\?=/g, (_, _charset, enc, data) => {
    if (/^[bB]$/.test(enc)) {
      return decodeBase64Text(data);
    }
    const qp = data.replace(/_/g, ' ');
    return decodeQuotedPrintable(qp);
  });
}

function getBoundary(contentType = '') {
  const match = `${contentType}`.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return (match?.[1] || match?.[2] || '').trim();
}

function splitMultipartBody(body = '', boundary = '') {
  if (!boundary) return [];
  const marker = `--${boundary}`;
  return `${body}`
    .split(marker)
    .slice(1)
    .map(part => part.replace(/^\n/, '').replace(/\n$/, ''))
    .filter(part => part && part !== '--' && !part.startsWith('--'));
}

function contentIdFromHeaders(headers = {}) {
  const raw = headers['content-id'] || '';
  const match = raw.match(/<([^>]+)>/);
  return (match?.[1] || raw).trim().toLowerCase();
}

function decodePartBody(body = '', transferEncoding = '') {
  const enc = `${transferEncoding}`.toLowerCase();
  if (enc.includes('quoted-printable')) return decodeQuotedPrintable(body);
  if (enc.includes('base64')) return decodeBase64Text(body);
  return body;
}

function walkMimeEntity(headers, body, acc) {
  const contentType = headers['content-type'] || 'text/plain';
  const transferEncoding = headers['content-transfer-encoding'] || '';

  if (/^multipart\//i.test(contentType)) {
    const boundary = getBoundary(contentType);
    const parts = splitMultipartBody(body, boundary);
    for (const part of parts) {
      const { rawHeaders, body: partBody } = splitHeaderBody(part);
      const partHeaders = parseHeaders(rawHeaders);
      walkMimeEntity(partHeaders, partBody, acc);
    }
    return;
  }

  if (/^text\/html/i.test(contentType) && !acc.html) {
    acc.html = decodePartBody(body, transferEncoding);
    return;
  }

  if (/^image\//i.test(contentType)) {
    const cid = contentIdFromHeaders(headers);
    if (!cid) return;
    const mime = contentType.split(';')[0].trim() || 'image/png';
    const base64 = `${body}`.replace(/\s+/g, '');
    if (!base64) return;
    acc.cidMap.set(cid, `data:${mime};base64,${base64}`);
  }
}

function replaceCidSources(html = '', cidMap = new Map()) {
  return `${html}`.replace(/cid:<?([^"'>)\s]+)>?/gi, (_m, cid) => cidMap.get(`${cid}`.toLowerCase()) || `cid:${cid}`);
}

function extractBodyInnerHtml(html = '') {
  if (typeof DOMParser !== 'undefined') {
    try {
      const doc = new DOMParser().parseFromString(`${html}`, 'text/html');
      const emailCard = doc.querySelector('table.email-card');
      if (emailCard) {
        const td = emailCard.querySelector('tr > td');
        if (td) return td.innerHTML.trim();
      }

      const brickContainer = doc.querySelector('table#brick_container');
      if (brickContainer) {
        const td = brickContainer.querySelector('tr > td');
        if (td) return td.innerHTML.trim();
      }

      const widthTable = Array.from(doc.querySelectorAll('table')).find((table) => {
        const width = table.getAttribute('width');
        return width === '600';
      });
      if (widthTable) {
        const td = widthTable.querySelector('tr > td');
        if (td) return td.innerHTML.trim();
      }

      if (doc.body?.innerHTML?.trim()) {
        return doc.body.innerHTML.trim();
      }
    } catch {
      // Fall back to regex extraction below.
    }
  }

  const bodyMatch = `${html}`.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch?.[1]) return bodyMatch[1].trim();

  const classMatch = `${html}`.match(/<table[^>]*class=["'][^"']*email-card[^"']*["'][^>]*>[\s\S]*?<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>[\s\S]*?<\/table>/i);
  if (classMatch?.[1]) return classMatch[1].trim();

  const brickMatch = `${html}`.match(/<table[^>]*id=["']brick_container["'][^>]*>[\s\S]*?<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>[\s\S]*?<\/table>/i);
  if (brickMatch?.[1]) return brickMatch[1].trim();

  const widthMatch = `${html}`.match(/<table[^>]*width=["']600["'][^>]*>[\s\S]*?<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>[\s\S]*?<\/table>/i);
  if (widthMatch?.[1]) return widthMatch[1].trim();

  return `${html}`.trim();
}

function extractStyleBlocks(html = '') {
  const styles = [];
  const re = /<style\b[^>]*>[\s\S]*?<\/style>/gi;
  let m;
  while ((m = re.exec(`${html}`)) !== null) {
    styles.push(m[0]);
  }
  return styles.join('\n');
}

export function importEml(content) {
  const { rawHeaders, body } = splitHeaderBody(content);
  const headers = parseHeaders(rawHeaders);

  const acc = { html: '', cidMap: new Map() };
  walkMimeEntity(headers, body, acc);

  const topContentType = headers['content-type'] || '';
  if (!acc.html && /^text\/html/i.test(topContentType)) {
    acc.html = decodePartBody(body, headers['content-transfer-encoding'] || '');
  }

  const htmlWithInlineImages = replaceCidSources(acc.html, acc.cidMap);
  const preservedStyles = extractStyleBlocks(htmlWithInlineImages);
  const innerHtml = extractBodyInnerHtml(htmlWithInlineImages);
  const importedHtml = [preservedStyles, innerHtml].filter(Boolean).join('\n');

  return {
    emailMeta: {
      subject: decodeEncodedWord(headers.subject || ''),
      from: decodeEncodedWord(headers.from || ''),
      to: decodeEncodedWord(headers.to || ''),
      cc: decodeEncodedWord(headers.cc || ''),
      bcc: decodeEncodedWord(headers.bcc || ''),
    },
    elements: importedHtml
      ? [{ type: 'raw-html', props: { html: importedHtml } }]
      : [],
  };
}
