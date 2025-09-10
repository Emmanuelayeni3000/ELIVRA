import { toDataURL } from 'qrcode'; // Import toDataURL from 'qrcode' library

export const generateQRCodeDataURL = (text: string, size: number = 128): Promise<string> => {
  return new Promise((resolve, reject) => {
    toDataURL(text, { width: size, errorCorrectionLevel: 'H' }, (err, url) => {
      if (err) {
        reject(err);
      } else {
        resolve(url);
      }
    });
  });
};

// Alias for backward compatibility
export const generateQRCode = generateQRCodeDataURL;