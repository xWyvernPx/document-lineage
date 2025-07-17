import { TermDictionary } from '../features/terms/components/TermDictionary';
import { useNavigate } from 'react-router-dom';

export function TermsPage() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Term Dictionary</h1>
        <p className="text-gray-600">
          Browse, search, and manage business terms with their definitions, relationships, and data lineage.
        </p>
      </div>
      <TermDictionary 
        onEditTerm={(term: any) => console.log('Edit term:', term)}
        onViewLineage={(term: any) => {
          console.log('View lineage:', term);
          navigate('/lineage');
        }}
      />
    </div>
  );
}
