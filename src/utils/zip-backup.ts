// CRC-32 Table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[i] = c;
}

function getCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function crc32_update(key: number, char: number) {
  return CRC_TABLE[(key ^ char) & 0xff] ^ (key >>> 8);
}

function initKeys(password: string): number[] {
  let keys = [305419896, 591751049, 878082192];
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    keys[0] = crc32_update(keys[0], char);
    keys[1] = (keys[1] + (keys[0] & 0xff)) & 0xffffffff;
    keys[1] = (Math.imul(keys[1], 134775813) + 1) & 0xffffffff;
    keys[2] = crc32_update(keys[2], keys[1] >>> 24);
  }
  return keys;
}

function encryptByte(k: number[], char: number): number {
  const temp = (k[2] & 0xffff) | 2;
  const key = Math.imul(temp, temp ^ 1) >>> 8;
  const cipher = char ^ (key & 0xff);

  // Update keys
  k[0] = crc32_update(k[0], char);
  k[1] = (k[1] + (k[0] & 0xff)) & 0xffffffff;
  k[1] = (Math.imul(k[1], 134775813) + 1) & 0xffffffff;
  k[2] = crc32_update(k[2], k[1] >>> 24);

  return cipher;
}

function write16(arr: Uint8Array, offset: number, value: number) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
}

function write32(arr: Uint8Array, offset: number, value: number) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
  arr[offset + 2] = (value >>> 16) & 0xff;
  arr[offset + 3] = (value >>> 24) & 0xff;
}

function stringToUtf8(str: string): Uint8Array {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

function uint8ToBase64(arr: Uint8Array): string {
  let bin = "";
  const len = arr.byteLength;
  for (let i = 0; i < len; i++) {
    bin += String.fromCharCode(arr[i]);
  }
  if (typeof btoa !== 'undefined') {
    return btoa(bin);
  }
  // Native JS Base64 encoder fallback if btoa is not defined
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < len) {
    const c1 = arr[i++];
    const c2 = i < len ? arr[i++] : NaN;
    const c3 = i < len ? arr[i++] : NaN;
    const byte1 = c1 >> 2;
    const byte2 = ((c1 & 3) << 4) | (isNaN(c2) ? 0 : c2 >> 4);
    const byte3 = isNaN(c2) ? 64 : ((c2 & 15) << 2) | (isNaN(c3) ? 0 : c3 >> 6);
    const byte4 = isNaN(c3) ? 64 : c3 & 63;
    result += chars.charAt(byte1) + chars.charAt(byte2) + chars.charAt(byte3) + chars.charAt(byte4);
  }
  return result;
}

// Helper function to build a REAL password-protected ZIP archive client-side
export const buildEncryptedZip = async (textPayload: string, passwordString: string): Promise<{ dataUri: string; base64: string }> => {
  const fileName = "impel_vault_backup.txt";
  const fileNameBytes = stringToUtf8(fileName);
  const fileDataBytes = stringToUtf8(textPayload);
  const crc = getCrc32(fileDataBytes);

  // 1. Encryption Header (12 bytes)
  const encHeader = new Uint8Array(12);
  for (let i = 0; i < 11; i++) {
    encHeader[i] = Math.floor(Math.random() * 256);
  }
  encHeader[11] = (crc >>> 24) & 0xff;

  // Encrypt the 12-byte header
  const k = initKeys(passwordString);
  const encryptedHeader = new Uint8Array(12);
  for (let i = 0; i < 12; i++) {
    encryptedHeader[i] = encryptByte(k, encHeader[i]);
  }

  // Encrypt the file data bytes
  const encryptedData = new Uint8Array(fileDataBytes.length);
  for (let i = 0; i < fileDataBytes.length; i++) {
    encryptedData[i] = encryptByte(k, fileDataBytes[i]);
  }

  // 2. Calculate sizes and offsets
  const lfhSize = 30 + fileNameBytes.length + 12 + encryptedData.length;
  const cdfhSize = 46 + fileNameBytes.length;
  const eocdSize = 22;
  const totalSize = lfhSize + cdfhSize + eocdSize;

  const zipBytes = new Uint8Array(totalSize);

  // 3. Write Local File Header (LFH)
  write32(zipBytes, 0, 0x04034b50); // Signature
  write16(zipBytes, 4, 20);          // Version needed (2.0)
  write16(zipBytes, 6, 1);           // General purpose bit flag (bit 0 = 1 for encryption)
  write16(zipBytes, 8, 0);           // Compression method (0 = Stored)
  write16(zipBytes, 10, 0);          // Last mod file time
  write16(zipBytes, 12, 0);          // Last mod file date
  write32(zipBytes, 14, crc);        // CRC-32
  write32(zipBytes, 18, encryptedData.length + 12); // Compressed size
  write32(zipBytes, 22, fileDataBytes.length);      // Uncompressed size
  write16(zipBytes, 26, fileNameBytes.length);       // File name length
  write16(zipBytes, 28, 0);          // Extra field length
  zipBytes.set(fileNameBytes, 30);   // File name
  zipBytes.set(encryptedHeader, 30 + fileNameBytes.length); // Encrypted header
  zipBytes.set(encryptedData, 30 + fileNameBytes.length + 12); // Encrypted data

  // 4. Write Central Directory File Header (CDFH)
  const cdfhOffset = lfhSize;
  write32(zipBytes, cdfhOffset, 0x02014b50);     // Signature
  write16(zipBytes, cdfhOffset + 4, 20);          // Version made by
  write16(zipBytes, cdfhOffset + 6, 20);          // Version needed
  write16(zipBytes, cdfhOffset + 8, 1);           // General purpose flag
  write16(zipBytes, cdfhOffset + 10, 0);          // Compression method
  write16(zipBytes, cdfhOffset + 12, 0);          // Last mod time
  write16(zipBytes, cdfhOffset + 14, 0);          // Last mod date
  write32(zipBytes, cdfhOffset + 16, crc);        // CRC-32
  write32(zipBytes, cdfhOffset + 20, encryptedData.length + 12); // Compressed size
  write32(zipBytes, cdfhOffset + 24, fileDataBytes.length);      // Uncompressed size
  write16(zipBytes, cdfhOffset + 28, fileNameBytes.length);       // File name length
  write16(zipBytes, cdfhOffset + 30, 0);          // Extra field length
  write16(zipBytes, cdfhOffset + 32, 0);          // File comment length
  write16(zipBytes, cdfhOffset + 34, 0);          // Disk number start
  write16(zipBytes, cdfhOffset + 36, 0);          // Internal file attrs
  write32(zipBytes, cdfhOffset + 38, 0);          // External file attrs
  write32(zipBytes, cdfhOffset + 42, 0);          // Local header offset (0)
  zipBytes.set(fileNameBytes, cdfhOffset + 46);   // File name

  // 5. Write End of Central Directory Record (EOCD)
  const eocdOffset = lfhSize + cdfhSize;
  write32(zipBytes, eocdOffset, 0x06054b50);     // Signature
  write16(zipBytes, eocdOffset + 4, 0);           // Number of this disk
  write16(zipBytes, eocdOffset + 6, 0);           // Disk where CD starts
  write16(zipBytes, eocdOffset + 8, 1);           // Records on this disk
  write16(zipBytes, eocdOffset + 10, 1);          // Total records
  write32(zipBytes, eocdOffset + 12, cdfhSize);   // Size of CD
  write32(zipBytes, eocdOffset + 16, cdfhOffset); // Offset of CD
  write16(zipBytes, eocdOffset + 20, 0);          // Comment length

  // 6. Encode bytes to Base64
  const base64 = uint8ToBase64(zipBytes);
  const dataUri = `data:application/zip;base64,${base64}`;

  return { dataUri, base64 };
};
