import {api} from "./api";

export interface CertificateWorker {
    id: string;
    name: string;
    employeeId: string;
    sector: string;
    site: string;
}

export interface CertificateModule {
    id: string;
    category: string;
    title: string;
}

export interface CertificateAssessment {
    score: number;
    passed: boolean;
    completedAt: string;
}

export interface Certificate {
    certificateNumber: string;
    issuedAt: string;
    worker: CertificateWorker;
    module: CertificateModule;
    assessment: CertificateAssessment;
}

export interface VerifyCertificateResponse {
    success: boolean;
    message: string;
    data: {
        valid: boolean;
        certificate: Certificate;
    };
}

export interface CertificateQRResponse {
    success: boolean;
    data: {
        certificateNumber: string;
        verificationUrl: string;
        qrCode: string;
    };
}

export const verifyCertificate = async (
    certificateNumber: string
): Promise<VerifyCertificateResponse> => {
    const response = await api.get(
        `/certificates/${encodeURIComponent(
            certificateNumber
        )}/verify`
    );

    return response.data;
};

export const getCertificateQR = async (
    certificateNumber: string
): Promise<CertificateQRResponse> => {
    const response = await api.get(
        `/certificates/${encodeURIComponent(
            certificateNumber
        )}/qr`
    );

    return response.data;
};

export const getCertificatePDF = (
    certificateNumber: string
) => {
    const baseUrl =
        import.meta.env.VITE_API_URL;

    return `${baseUrl}/certificates/${encodeURIComponent(
        certificateNumber
    )}/pdf`;
};



