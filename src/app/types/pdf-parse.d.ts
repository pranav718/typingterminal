declare module 'pdf-parse' {
    interface PDFInfo {
        PDFFormatVersion: string,
        IsAcroFormPresent: string,
        IsXFAPresent: boolean,
        [key: string]: any
    }

    interface PDFMetaData {
        _metadata?: {
            [key: string]: any;
        };
        [key: string]: any;
    }

    interface PDFData {
        numpages: number,
        numrender: number,
        info: PDFInfo,
        metadata: PDFMetaData,
        text: string,
        version: string
    }

    function pdf(dataBuffer: Buffer | ArrayBuffer | Uint8Array, options?: any): Promise<PDFData>;

    export = pdf;
}