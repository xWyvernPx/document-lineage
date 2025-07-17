import { DocumentLibrary } from '../features/documents/components/DocumentLibrary';

export function DocumentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Document Library</h1>
        <p className="text-gray-600">
          View and manage all uploaded business documents and their processing status.
        </p>
      </div>
      <DocumentLibrary 
        onViewDocument={(doc: any) => console.log('View document:', doc)}
        onEditDocument={(doc: any) => console.log('Edit document:', doc)}
        onDeleteDocument={(doc: any) => console.log('Delete document:', doc)}
        onReprocessDocument={(doc: any) => console.log('Reprocess document:', doc)}
      />
    </div>
  );
}
