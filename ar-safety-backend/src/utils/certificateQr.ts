import QRCode from "qrcode";

export const generateCertificateQr = async (
  certificateNumber: string
) => {
  const publicAppUrl = process.env.PUBLIC_APP_URL;

  if (!publicAppUrl) {
    throw new Error(
      "Public application URL is not configured"
    );
  }

  const verificationUrl =
    `${publicAppUrl}/verify/${encodeURIComponent(
      certificateNumber
    )}`;

  const qrCode = await QRCode.toDataURL(
    verificationUrl
  );

  return {
    verificationUrl,
    qrCode,
  };
};