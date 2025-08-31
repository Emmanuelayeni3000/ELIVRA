import QRCode from 'qrcode'

export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      width: 200
    })
    
    return qrCodeDataUrl
  } catch (error) {
    console.error('QR Code generation error:', error)
    throw new Error('Failed to generate QR code')
  }
}

export const generateInviteQRCode = async (inviteId: string): Promise<string> => {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteId}`
  return generateQRCode(inviteUrl)
}