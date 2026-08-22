declare module "html2pdf.js" {
  interface Html2PdfWorker {
    set(opts: Record<string, unknown>): Html2PdfWorker;
    from(src: HTMLElement | string): Html2PdfWorker;
    outputPdf(type: "blob"): Promise<Blob>;
    save(filename?: string): Promise<void>;
  }
  interface Html2PdfFactory {
    (): Html2PdfWorker;
    Worker: unknown;
  }
  const html2pdf: Html2PdfFactory;
  export default html2pdf;
}