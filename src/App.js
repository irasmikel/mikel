import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

// --- DATOS INICIALES PARA IMPORTAR ---
const initialData = [
  { title: "Garantia konica", content: "Www.kminfo.biz\nUsuario: MARROYO\nPass: maquelsa2008\n\nFormularios -> Garantia\n\nPoner telefono\nMarcar si la persona de contacto es la misma\nPoner persona que hemos hablado\nComentario: poner enviar a maquelsa san sebastian", tags: ["konica", "garantia"] },
  { title: "I-option", content: "Info hub, carlos serrano, Maquelsa2008 información\nData movie, serv. Tecnico e install data system 2 segunda pagina", tags: ["i-option", "infohub", "datamovie"] },
  { title: "Amenabar", content: "Usuario: impresora", tags: ["amenabar", "impresora", "credenciales"] },
  { title: "Impresora Amenabar", content: "Pass: Amenabar1", tags: ["amenabar", "impresora", "password"] },
  { title: "Soporte samsung", content: "Tlf: 917547054\nPin: 90196\nPin: 91009", tags: ["samsung", "soporte", "pin"] },
  { title: "Ricoh Clear 107 stop", content: "Clear 107 stop", tags: ["ricoh", "codigo", "reset"] },
  { title: "Ricoh Stop 0 C", content: "Stop + 0 + C", tags: ["ricoh", "codigo"] },
  { title: "Exportar libreta direcciones Konica", content: "Softswitch 72 al 04\nAdmin\nCopia de seguridad memoria Externa", tags: ["konica", "direcciones", "exportar"] },
  { title: "Desbloqueo konica c3350", content: "Menu, Contador, teclado:\nStop 09317\nEsperar 5 min", tags: ["konica", "c3350", "desbloqueo", "codigo"] },
  { title: "HP Printer Service Codes", content: "https://medium.com/@pinnaclenetwork/hp-printer-service-codes-402996fa9a3c\nSamsung codigos servicio", tags: ["hp", "samsung", "codigos", "servicio", "link"] },
  { title: "Verificar total Konica", content: "Swift swich 227 al 00", tags: ["konica", "codigo", "verificar"] },
  { title: "Admin Passwords", content: "lankidego@2010/2011/2012/2013/2014", tags: ["admin", "password", "lankidego"] },
  { title: "Webmail Maquelsa", content: "mail.maquelsa.com/correoweb\nPass: 32HTZ2008", tags: ["maquelsa", "correo", "password"] },
  { title: "Airtable Login", content: "User: mirastorza@maquelsa.com\nPass: 32HTZ2008", tags: ["airtable", "login", "password"] },
  { title: "Cruz Roja", content: "Dominio: 99_CEN\nUser: mikel\nPass: Azkuene99", tags: ["cruz roja", "credenciales", "dominio"] },
  { title: "EASO MOTOR / OARSOCAR", content: "Usuario: su usuario\nPass: Easomotor1 (si es oarsocar Oarsocar1)\n\nMail:\nimpresora@easomotor.es -> 20Impresora02\nimpresora@oarsocar.com -> 30Impresora03 oarsocar\n\nsmtp.easomotor.es", tags: ["easomotor", "oarsocar", "email", "smtp", "password"] },
  { title: "Firmware Konica C3100P", content: "Menu/counter/stop/b/b/stop/b/g\nb (bera/abajo)\ng (gora/arriba)", tags: ["konica", "c3100p", "firmware", "codigo"] },
  { title: "Virtual infodesain", content: "Mfc 35\nOracle 5.2", tags: ["virtual", "infodesain", "mfc", "oracle"] },
  { title: "Zurriola", content: "Usuario: Administrador\nPass: ZI.090678", tags: ["zurriola", "password", "admin"] },
  { title: "Errenteria musikal", content: "Usuario: .\\adminuser\nPass: Auser55", tags: ["errenteria", "musikal", "password", "admin"] },
  { title: "Carza Motor", content: "Usuario: Ventas\nPasswd: 123456", tags: ["carza", "motor", "password"] },
  { title: "Zona de influencia piezas konica", content: "Zona -> C", tags: ["konica", "piezas", "zona"] },
  { title: "Piezas de segunda mano", content: "En el parte poner p07", tags: ["piezas", "p07", "parte"] },
  { title: "4000i, drum reset", content: "La maquina encendida, tapa delantera abierta, pulsar el boton OK 2 segundos y aparece para resetear, hay que darle a la flecha arriba", tags: ["4000i", "drum", "reset", "konica"] },
  { title: "Load check 44 (ruidos c300i)", content: "Ruidos en una c300i, el residual de arriba.\nState confirmation, load check (abrir puerta derecha), start..., cerrar puerta derecha, y 44 + ok", tags: ["konica", "c300i", "ruido", "load check", "44"] },
  { title: "Reset Fusor / Residual", content: "Fusor -> 45-1\nResidual -> 44-0", tags: ["fusor", "residual", "reset", "codigo"] },
  { title: "Oauth 2.0 Konica", content: "Actualizar firmware a gc2 (pasó en una c251i)\nDesde la maquina, fisicamente, entrar en administrador, red, envio de correo, ahi aparece la opcion de habilitar oauth 2.0, desde la web no. Activar y seleccionar google por ejemplo si es de gmail", tags: ["oauth", "konica", "email", "gmail", "firmware", "c251i"] }
];

// --- Componentes de Iconos (SVG) ---
const PlusIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>);
const SearchIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const DownloadIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>);
const TrashIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const DocumentIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>);
const AttachmentIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>);
const ExternalLinkIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>);
const ChevronDownIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>);
const UploadCloudIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);
const SparklesIcon = ({ className }) => (<svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM5.05 3.636a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.06l-1.06-1.06a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM2 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 012 10zm15.25.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM5.05 16.364a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zm9.9 0a.75.75 0 010-1.06l1.06-1.06a.75.75 0 111.06 1.06l-1.06 1.06a.75.75 0 01-1.06 0zM10 18a.75.75 0 01-.75-.75v-1.5a.75.75 0 011.5 0v1.5A.75.75 0 0110 18z" clipRule="evenodd" /></svg>);
const SpinnerIcon = ({ className }) => (<svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>);

// --- Configuración de Firebase ---
const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : { apiKey: "TU_API_KEY", authDomain: "TU_AUTH_DOMAIN", projectId: "TU_PROJECT_ID", storageBucket: "TU_STORAGE_BUCKET", messagingSenderId: "TU_MESSAGING_SENDER_ID", appId: "TU_APP_ID" };

// --- Componente de Menú Desplegable ---
const Dropdown = ({ trigger, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const node = useRef();
    const handleClickOutside = e => { if (node.current && !node.current.contains(e.target)) { setIsOpen(false); } };
    useEffect(() => { document.addEventListener("mousedown", handleClickOutside); return () => { document.removeEventListener("mousedown", handleClickOutside); }; }, []);
    return (
        <div ref={node} className="relative inline-block text-left">
            <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
            {isOpen && (<div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"><div className="p-1" role="menu">{children}</div></div>)}
        </div>
    );
};

// --- Componente del Modal para añadir/editar notas ---
const NoteModal = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [file, setFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingContent, setIsGeneratingContent] = useState(false);
    const [isSuggestingTags, setIsSuggestingTags] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => { if (!isOpen) { setTitle(''); setContent(''); setTags(''); setFile(null); setIsSaving(false); } }, [isOpen]);
    
    // --- Gemini API Call Function ---
    const callGemini = async (prompt) => {
        const apiKey = ""; // La API key se inyecta en el entorno de ejecución
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };

        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { throw new Error(`API request failed with status ${response.status}`); }
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0) {
                return result.candidates[0].content.parts[0].text;
            }
            return "";
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return null;
        }
    };

    const handleGenerateContent = async () => {
        if (!title.trim()) { alert("Por favor, escribe un título primero."); return; }
        setIsGeneratingContent(true);
        const prompt = `Basado en el título "${title}", genera una breve guía o una lista de pasos en español. Formatea la respuesta de forma clara y concisa.`;
        const generatedContent = await callGemini(prompt);
        if (generatedContent !== null) {
            setContent(prev => prev ? `${prev}\n\n--- Contenido generado por IA ---\n${generatedContent}` : generatedContent);
        } else {
            alert("No se pudo generar el contenido. Inténtalo de nuevo.");
        }
        setIsGeneratingContent(false);
    };

    const handleSuggestTags = async () => {
        if (!title.trim() && !content.trim()) { alert("Por favor, escribe un título o contenido para sugerir etiquetas."); return; }
        setIsSuggestingTags(true);
        const prompt = `Basado en el siguiente título y contenido, sugiere 4 o 5 etiquetas relevantes en español, en minúsculas y separadas por comas. No incluyas espacios después de las comas. Título: "${title}". Contenido: "${content}".`;
        const suggestedTags = await callGemini(prompt);
        if (suggestedTags !== null) {
            setTags(prev => prev ? `${prev},${suggestedTags}`.replace(/, /g, ',') : suggestedTags.replace(/, /g, ','));
        } else {
            alert("No se pudieron sugerir etiquetas. Inténtalo de nuevo.");
        }
        setIsSuggestingTags(false);
    };

    const handleSave = async () => { if (!title.trim()) { alert("El título es obligatorio."); return; } setIsSaving(true); await onSave({ title, content, tags, file }); onClose(); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"><div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg m-4"><h2 className="text-2xl font-bold text-gray-800 mb-6">Añadir Nueva Nota</h2><div className="space-y-6">
            <div><label htmlFor="title" className="block text-sm font-medium text-gray-600 mb-1">Título</label><div className="flex items-center space-x-2"><input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título de la nota" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/><button type="button" onClick={handleGenerateContent} disabled={isGeneratingContent || !title.trim()} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed" title="✨ Generar contenido a partir del título">{isGeneratingContent ? <SpinnerIcon className="text-indigo-600"/> : <SparklesIcon className="h-5 w-5"/>}</button></div></div>
            <div><label htmlFor="content" className="block text-sm font-medium text-gray-600 mb-1">Contenido</label><textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="6" placeholder="Resolución, truco, pista..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea></div>
            <div><label htmlFor="tags" className="block text-sm font-medium text-gray-600 mb-1">Etiquetas</label><div className="flex items-center space-x-2"><input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Etiquetas separadas por comas" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"/><button type="button" onClick={handleSuggestTags} disabled={isSuggestingTags || (!title.trim() && !content.trim())} className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition disabled:opacity-50 disabled:cursor-not-allowed" title="✨ Sugerir etiquetas a partir del contenido">{isSuggestingTags ? <SpinnerIcon className="text-indigo-600"/> : <SparklesIcon className="h-5 w-5"/>}</button></div></div>
            <div><button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center space-x-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50"><AttachmentIcon className="h-5 w-5 text-gray-500"/><span className="text-gray-600">{file ? file.name : 'Adjuntar fichero'}</span></button><input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="hidden"/>{file && <button onClick={() => setFile(null)} className="text-xs text-red-500 mt-1">Quitar</button>}</div>
        </div><div className="mt-8 flex justify-end space-x-4"><button onClick={onClose} disabled={isSaving} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50">Cancelar</button><button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 disabled:opacity-50 disabled:cursor-wait">{isSaving ? 'Guardando...' : 'Guardar'}</button></div></div></div>
    );
};

// --- Componente para la importación inicial ---
const InitialDataImporter = ({ onImport, notesCount, isLoading }) => {
    const [isImporting, setIsImporting] = useState(false);
    if (isLoading || notesCount > 0) return null;
    const handleImport = async () => { setIsImporting(true); await onImport(); };
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12"><div className="bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center"><UploadCloudIcon className="h-12 w-12 mx-auto text-indigo-400"/><h3 className="mt-4 text-xl font-bold text-indigo-900">Empecemos con buen pie</h3><p className="mt-2 text-indigo-700">He encontrado {initialData.length} items listos para ser añadidos a tu base de conocimiento.</p><button onClick={handleImport} disabled={isImporting} className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait">{isImporting ? 'Importando...' : `Importar ${initialData.length} Datos Iniciales`}</button></div></div>
    );
};

// --- Componente Principal de la Aplicación ---
export default function App() {
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [db, setDb] = useState(null);
    const [storage, setStorage] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [appId, setAppId] = useState('default-app-id');
    
    useEffect(() => {
        const app = initializeApp(firebaseConfig);
        setDb(getFirestore(app));
        setStorage(getStorage(app));
        setAppId(typeof __app_id !== 'undefined' ? __app_id : 'default-app-id');
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) { setUserId(user.uid); } 
            else { try { const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null; if (token) { await signInWithCustomToken(auth, token); } else { await signInAnonymously(auth); } } catch (error) { console.error("Error en la autenticación:", error); } }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isAuthReady || !db || !userId) return;
        const notesCollectionPath = `artifacts/${appId}/users/${userId}/notes`;
        const q = query(collection(db, notesCollectionPath));
        setIsLoading(true);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const notesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setNotes(notesData);
            setIsLoading(false);
        }, (error) => { console.error("Error al obtener las notas: ", error); setIsLoading(false); });
        return () => unsubscribe();
    }, [isAuthReady, db, userId, appId]);

    const handleSaveNote = async ({ title, content, tags, file }) => {
        if (!db || !userId || !storage) return;
        const noteData = { title, content, tags: tags.split(',').map(tag => tag.trim()).filter(Boolean), createdAt: serverTimestamp(), };
        if (file) {
            const filePath = `attachments/${userId}/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, filePath);
            try {
                const uploadTask = await uploadBytesResumable(storageRef, file);
                const downloadURL = await getDownloadURL(uploadTask.ref);
                noteData.attachmentURL = downloadURL;
                noteData.attachmentName = file.name;
                noteData.attachmentPath = filePath;
            } catch (error) { console.error("Error al subir el archivo: ", error); alert("Hubo un error al subir el archivo."); }
        }
        const notesCollectionPath = `artifacts/${appId}/users/${userId}/notes`;
        await addDoc(collection(db, notesCollectionPath), noteData);
    };

    const handleDeleteNote = async (note) => {
        if (!db || !userId) return;
        if (window.confirm(`¿Estás seguro de que quieres borrar la nota "${note.title}"?`)) {
            try {
                if (note.attachmentPath && storage) { await deleteObject(ref(storage, note.attachmentPath)); }
                const notesCollectionPath = `artifacts/${appId}/users/${userId}/notes`;
                await deleteDoc(doc(db, notesCollectionPath, note.id));
            } catch (error) { console.error("Error al borrar la nota: ", error); alert("No se pudo borrar la nota."); }
        }
    };

    const handleInitialImport = async () => {
        if (!db || !userId) { alert("La base de datos no está lista."); return; }
        const notesCollectionPath = `artifacts/${appId}/users/${userId}/notes`;
        const notesCollectionRef = collection(db, notesCollectionPath);
        const batch = writeBatch(db);
        initialData.forEach(note => { const docRef = doc(notesCollectionRef); batch.set(docRef, { ...note, createdAt: serverTimestamp() }); });
        try { await batch.commit(); } catch (error) { console.error("Error en la importación masiva: ", error); alert("Ocurrió un error durante la importación."); }
    };

    const filteredNotes = useMemo(() => notes.filter(note => {
        const searchTermLower = searchTerm.toLowerCase();
        const tagsMatch = note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTermLower));
        return note.title.toLowerCase().includes(searchTermLower) || note.content.toLowerCase().includes(searchTermLower) || tagsMatch;
    }), [notes, searchTerm]);

    const downloadLinks = { 
        msi: 'https://github.com/irasmikel/mikel/releases/download/v1.0.0/MFC.msi', 
        exe: 'https://github.com/irasmikel/mikel/releases/download/v1.0.0/mfc.exe', 
        mfcUrl: 'https://mfc.maquelsa.com/mfc3/access.php', 
        mirrorUrl: 'https://mirror1.infodesain.com/nodeprint/access.php' 
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b border-gray-200"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="flex justify-between items-center h-16"><div className="flex items-center space-x-3"><DocumentIcon className="h-8 w-8 text-gray-800" /><span className="text-xl font-bold">Mikel</span></div><div className="flex items-center space-x-3"><Dropdown trigger={<button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"><span>MFC</span><ChevronDownIcon className="h-4 w-4" /></button>}><div className="font-semibold px-3 py-2 text-xs text-gray-500 uppercase">Descargas</div><a href={downloadLinks.msi} download className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-md mx-1 transition-colors"><DownloadIcon className="h-5 w-5 mr-3 text-green-600"/>MFC.msi</a><a href={downloadLinks.exe} download className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-800 rounded-md mx-1 transition-colors"><DownloadIcon className="h-5 w-5 mr-3 text-green-600"/>mfc.exe</a><div className="border-t border-gray-200 my-1 mx-1"></div><div className="font-semibold px-3 py-2 text-xs text-gray-500 uppercase">Enlaces Web</div><a href={downloadLinks.mfcUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 rounded-md mx-1 transition-colors"><ExternalLinkIcon className="h-5 w-5 mr-3 text-blue-600"/>Web MFC</a><a href={downloadLinks.mirrorUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-800 rounded-md mx-1 transition-colors"><ExternalLinkIcon className="h-5 w-5 mr-3 text-blue-600"/>Mirror</a></Dropdown><button onClick={() => setSearchTerm('')} className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition">Ver Todo</button><button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition shadow"><PlusIcon className="h-5 w-5" /><span>Añadir Item</span></button></div></div></div></header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12"><div className="inline-block p-4 bg-white rounded-full shadow-md border border-gray-200 mb-4"><DocumentIcon className="h-10 w-10 text-gray-800" /></div><h1 className="text-5xl font-bold text-gray-900 mb-4">Mikel</h1><div className="relative max-w-2xl mx-auto"><SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" /><input type="text" placeholder="Busca por título, contenido o etiqueta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-10 py-4 text-lg bg-white border border-gray-200 rounded-full shadow-sm focus:ring-2 focus:ring-indigo-500"/></div></div>
                <InitialDataImporter onImport={handleInitialImport} notesCount={notes.length} isLoading={isLoading} />
                {isLoading ? (<div className="text-center text-gray-500 pt-8">Cargando notas...</div>) 
                : filteredNotes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredNotes.map(note => (
                            <div key={note.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300"><div className="flex-grow"><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-gray-900 pr-2">{note.title}</h3><button onClick={() => handleDeleteNote(note)} className="text-gray-400 hover:text-red-500 p-1 rounded-full flex-shrink-0"><TrashIcon className="h-5 w-5" /></button></div><p className="text-gray-600 whitespace-pre-wrap mb-4">{note.content}</p></div><div className="mt-auto pt-4 border-t border-gray-100">{note.tags && note.tags.length > 0 && (<div className="flex flex-wrap gap-2 mb-3">{note.tags.map(tag => <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">{tag}</span>)}</div>)}{note.attachmentURL && (<a href={note.attachmentURL} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:underline"><AttachmentIcon className="h-4 w-4 mr-2"/><span>{note.attachmentName || 'Ver adjunto'}</span></a>)}</div></div>
                        ))}
                    </div>
                ) : ( notes.length > 0 && <div className="text-center py-16 px-6 bg-white rounded-2xl border"><h3 className="text-xl font-semibold">No se encontraron resultados</h3><p className="text-gray-500 mt-2">No hay notas que coincidan con "{searchTerm}".</p></div>)}
            </main>
            <NoteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveNote} />
            <footer className="text-center py-4 text-xs text-gray-400"><p>ID de sesión: <span className="font-mono bg-gray-200 p-1 rounded">{userId || 'Cargando...'}</span></p></footer>
        </div>
    );
}
