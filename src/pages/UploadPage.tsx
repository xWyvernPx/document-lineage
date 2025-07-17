import { DocumentUpload } from '../features/documents/components/DocumentUpload';

export function UploadPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents</h1>
        <p className="text-gray-600">
          Upload new business documents for processing and term extraction.
        </p>
      </div>
      <DocumentUpload />
    </div>
  );
}
