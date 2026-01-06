import React, { useState, useEffect, useRef } from 'react';
import { MessageTemplate } from '../types';
import { apiService } from '../services/apiService'; // Alterado
import { ClipboardList, Plus, Save, Trash2, Edit, Tag, X } from 'lucide-react';

const PLACEHOLDERS = [
  { tag: '{nome}', desc: 'Nome completo do paciente' },
  { tag: '{primeiro_nome}', desc: 'Primeiro nome do paciente' },
  { tag: '{data_proxima_sessao}', desc: 'Data da próxima sessão agendada' },
];

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await apiService.getItems<MessageTemplate>('message_templates');
      setTemplates(data);
    } catch (error) {
      console.error("Falha ao carregar modelos de mensagem:", error);
    }
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateContent(template.content);
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateContent('');
  };

  const handleSave = async () => {
    if (!templateName || !templateContent) {
      alert('Por favor, preencha o nome e o conteúdo do modelo.');
      return;
    }

    try {
      if (selectedTemplate) {
        // Update
        const updatedTemplate = { name: templateName, content: templateContent };
        await apiService.updateItem('message_templates', selectedTemplate.id, updatedTemplate);
      } else {
        // Create
        const newTemplate = {
          name: templateName,
          content: templateContent,
        };
        await apiService.createItem('message_templates', newTemplate);
      }

      loadTemplates();
      handleNewTemplate();
    } catch (error) {
      console.error("Falha ao salvar modelo:", error);
      alert("Não foi possível salvar o modelo.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
      try {
        await apiService.deleteItem('message_templates', id);
        if (selectedTemplate?.id === id) {
          handleNewTemplate();
        }
        loadTemplates();
      } catch (error) {
        console.error("Falha ao excluir modelo:", error);
        alert("Não foi possível excluir o modelo.");
      }
    }
  };

  const insertPlaceholder = (tag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const text = textareaRef.current.value;
      const newText = text.substring(0, start) + tag + text.substring(end);
      setTemplateContent(newText);
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(start + tag.length, start + tag.length);
      }, 0);
    }
  };

  return (
    <div className="p-4 md:p-6 h-auto md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
      {/* Left Panel: Template List */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-emerald-600" />
            Meus Modelos
          </h2>
        </div>
        <button
          onClick={handleNewTemplate}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 mb-4 text-sm font-medium"
        >
          <Plus size={18} /> Criar Novo Modelo
        </button>
        <div className="flex-1 overflow-y-auto -mr-2 pr-2 space-y-2 min-h-[200px]">
          {templates.map(t => (
            <div
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={`p-3 rounded-lg border cursor-pointer group transition-all ${selectedTemplate?.id === t.id ? 'bg-emerald-50 border-emerald-200' : 'hover:bg-slate-50 border-slate-100'}`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-medium text-sm truncate ${selectedTemplate?.id === t.id ? 'text-emerald-800' : 'text-slate-700'}`}>{t.name}</span>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleDelete(t.id, e)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-8">Nenhum modelo criado.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Editor */}
      <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit className="text-slate-500" />
            {selectedTemplate ? 'Editar Modelo' : 'Novo Modelo'}
          </h2>
          {selectedTemplate && <button onClick={handleNewTemplate} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Modelo</label>
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            placeholder="Ex: Confirmação de Sessão"
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex-1 flex flex-col min-h-[250px]">
          <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo da Mensagem</label>
          <textarea
            ref={textareaRef}
            value={templateContent}
            onChange={e => setTemplateContent(e.target.value)}
            placeholder="Digite sua mensagem aqui... Use as variáveis abaixo para personalizar."
            className="w-full flex-1 p-3 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans"
          ></textarea>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1"><Tag size={14} /> Variáveis Dinâmicas</h3>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDERS.map(p => (
              <button
                key={p.tag}
                onClick={() => insertPlaceholder(p.tag)}
                title={p.desc}
                className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-mono hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200"
              >
                {p.tag}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-right">
          <button
            onClick={handleSave}
            disabled={!templateName || !templateContent}
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 ml-auto disabled:opacity-50"
          >
            <Save size={18} />
            {selectedTemplate ? 'Salvar Alterações' : 'Salvar Modelo'}
          </button>
        </div>
      </div>
    </div>
  );
};