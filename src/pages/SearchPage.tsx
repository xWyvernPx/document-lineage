export function SearchPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Advanced Search</h1>
      <p className="text-gray-600 mb-8">
        Search functionality will be implemented here.
      </p>
      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Search terms, documents, or definitions..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
        />
      </div>
    </div>
  );
}
