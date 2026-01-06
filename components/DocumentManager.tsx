import React, { useState, useEffect } from 'react';
import { CRMDocument } from '../types';
import { apiService, API_BASE_URL } from '../services/apiService'; // Alterado
import { Upload, FileText, Trash2, Download, HardDrive, ShieldAlert, FileCheck } from 'lucide-react';

// As verificações de segurança agora são feitas principalmente no backend,
// mas mantemos as do frontend como uma primeira camada de defesa.
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<CRMDocument[]>([]);
  const [driveLink, setDriveLink] = useState(localStorage.getItem('mirelli_drive_link') || '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const docs = await apiService.getItems<CRMDocument>('documents');
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato não seguro. Permitido apenas: PDF, Imagens e Documentos de Texto.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('Arquivo muito grande. O limite de segurança é 5MB.');
      return;
    }

    setLoading(true);
    try {
      // 1. Envia o arquivo para o backend
      const uploadResult = await apiService.uploadFile(file);
      
      // 2. Cria o registro do documento no banco de dados com o caminho retornado
      const newDocMetadata = {
        id: crypto.randomUUID(), // O frontend ainda gera o ID para consistência
        name: file.name,
        type: file.type,
        size: file.size,
        date: new Date().toISOString(),
        filePath: uploadResult.filePath,
      };

      await apiService.createItem('documents', newDocMetadata);
      loadDocs(); // Recarrega a lista
    } catch (err: any) {
      setError(err.message || 'Erro ao processar arquivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: CRMDocument) => {
    // Constrói a URL completa para o arquivo estático no servidor
    const url = `${API_BASE_URL}${doc.filePath}`;
    window.open(url, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir arquivo de forma permanente?')) {
      setLoading(true);
      try {
        await apiService.deleteItem('documents', id);
        loadDocs();
      } catch (err: any) {
        setError(err.message || 'Falha ao excluir o arquivo.');
      } finally {
        setLoading(false);
      }
    }
  };

  const saveDriveLink = () => {
    if (driveLink && !driveLink.startsWith('http')) {
      setError('Link inválido. Insira a URL completa (https://...)');
      return;
    }
    localStorage.setItem('mirelli_drive_link', driveLink);
    alert('Link seguro salvo!');
    setError(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
          <ShieldAlert size={24} />
          <div>
            <p className="font-bold">Alerta</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-blue-100 p-4 rounded-full">
          <HardDrive className="text-blue-600 w-8 h-8" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="font-bold text-blue-900 mb-2">Integração Segura Google Drive</h3>
          <p className="text-blue-700 text-sm mb-3">Armazene arquivos grandes na nuvem criptografada do Google.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={driveLink}
              onChange={e => setDriveLink(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="flex-1 px-3 py-2 bg-white text-slate-900 border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={saveDriveLink} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Salvar</button>
          </div>
          {driveLink && (
            <a href={driveLink} target="_blank" rel="noreferrer" className="inline-block mt-2 text-sm text-blue-600 underline hover:text-blue-800">
              Acessar Pasta Segura
            </a>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Cofre de Arquivos</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <FileCheck size={12} /> Verificação de segurança ativa no servidor.
            </p>
          </div>
          <label className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors shadow-sm ${loading ? 'opacity-50' : ''}`}>
            <Upload size={18} /> {loading ? 'Enviando...' : 'Upload Seguro'}
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={loading} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <FileText className="text-slate-500" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-medium text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                  <p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(1)} KB • {new Date(doc.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button onClick={() => handleDownload(doc)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg hover:text-emerald-600" title="Baixar com Segurança">
                  <Download size={18} />
                </button>
                <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg hover:text-red-600" title="Destruir Arquivo">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {documents.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              Nenhum arquivo no cofre digital.
            </div>
          )}
           {loading && documents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400">
              Carregando documentos...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};