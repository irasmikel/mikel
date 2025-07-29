'use client';

import { useState, useMemo } from 'react';
import type { InfoItem } from '@/lib/types';
import { mockData } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  FileText,
  KeyRound,
  ImageIcon,
  Search,
  PlusCircle,
  Loader2,
  BrainCircuit,
  Download,
  AppWindow,
  FolderArchive,
  List,
  Trash2,
  Pencil,
} from 'lucide-react';
import { VaultIcon } from '@/components/icons';
import { performSearch } from '@/app/actions';
import NewItemForm from '@/components/infovault/new-item-form';
import { useToast } from '@/hooks/use-toast';

function getIcon(type: InfoItem['type']) {
  switch (type) {
    case 'note':
      return <FileText className="h-5 w-5 text-primary" />;
    case 'password':
      return <KeyRound className="h-5 w-5 text-primary" />;
    case 'photo':
      return <ImageIcon className="h-5 w-5 text-primary" />;
    case 'application':
      return <AppWindow className="h-5 w-5 text-primary" />;
    default:
      return <FileText className="h-5 w-5 text-primary" />;
  }
}

export default function MikelPage() {
  const [items, setItems] = useState<InfoItem[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<InfoItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InfoItem | null>(null);
  const { toast } = useToast();

  const mfcItems = useMemo(() => {
    return items.filter(item => 
      item.id === 'automatikoak-fichero1' || item.id === 'automatikoak-fichero2'
    );
  }, [items]);

  const allItemsForSearch = useMemo(() => {
    return items.map(({ id, title, content, categories, type }) => ({
      id,
      title,
      content,
      categories,
      type,
    }));
  }, [items]);

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
        setHasSearched(false);
        setSearchResults([]);
        return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const result = await performSearch({ query: searchQuery, items: allItemsForSearch });
      const foundItems = result.itemIds.map(id => items.find(item => item.id === id)).filter(Boolean) as InfoItem[];
      setSearchResults(foundItems);
    } catch (error) {
      console.error("Error performing smart search:", error);
      toast({
        title: 'Error en la búsqueda',
        description: 'No se pudo realizar la búsqueda.',
        variant: 'destructive',
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleShowAll = () => {
    if (hasSearched && searchResults.length > 0 && searchQuery === '') {
        setHasSearched(false);
        setSearchResults([]);
    } else {
        setSearchQuery('');
        setHasSearched(true);
        setSearchResults(items);
    }
  };

  const handleOpenNewItemDialog = () => {
    setEditingItem(null);
    setIsNewItemDialogOpen(true);
  };
  
  const handleEditItem = (item: InfoItem) => {
    setEditingItem(item);
    setIsNewItemDialogOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    setSearchResults(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: '¡Item eliminado!',
      description: 'El item ha sido eliminado de la bóveda.',
    });
  };

  const handleSaveItem = (itemData: Omit<InfoItem, 'id' | 'createdAt'>, id?: string) => {
    if (id) {
        // Editing existing item
        const updatedItems = items.map(item => 
            item.id === id ? { ...item, ...itemData } : item
        );
        setItems(updatedItems);
        // Actualiza los resultados de búsqueda si el item editado estaba en ellos
        if (hasSearched) {
          setSearchResults(prev => prev.map(item => item.id === id ? { ...items.find(i => i.id === id)!, ...itemData } : item));
        }
        toast({
            title: '¡Item actualizado!',
            description: 'El item se ha actualizado correctamente.',
        });
    } else {
        // Adding new item
        const newItem: InfoItem = {
            ...itemData,
            id: `item-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        const updatedItems = [newItem, ...items];
        setItems(updatedItems);
        // Si se estaba mostrando la lista completa, la actualizamos para incluir el nuevo item
        if (hasSearched && !searchQuery) {
            setSearchResults(updatedItems);
        }
        toast({
            title: '¡Item guardado!',
            description: 'Tu nuevo item ha sido añadido a la bóveda.',
        });
    }
    setIsNewItemDialogOpen(false);
    setEditingItem(null);
};


  const WelcomeContent = () => (
    <div className="text-center">
      <VaultIcon className="mx-auto h-16 w-16 text-primary mb-6" />
      <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
        Mikel
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Utiliza la búsqueda inteligente para encontrar lo que necesitas al instante, accede a tus descargas de MFC o visualiza todos tus items.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="flex h-16 items-center border-b px-4 md:px-6 shrink-0">
        <a href="/" className="flex items-center gap-2 font-semibold">
          <VaultIcon className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg">Mikel</span>
        </a>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="md:w-auto md:px-4">
                    <FolderArchive className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">MFC</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Descargas de MFC</DialogTitle>
                  <DialogDescription>
                    Aquí tienes los archivos necesarios para la instalación de MFC.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {mfcItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <AppWindow className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{item.categories.join(', ')}</p>
                        </div>
                      </div>
                      <Button asChild>
                        <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleShowAll} size="icon" className="md:w-auto md:px-4">
                <List className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Ver Todo</span>
            </Button>

            <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
                <DialogTrigger asChild>
                    <Button onClick={handleOpenNewItemDialog} size="icon" className="md:w-auto md:px-4">
                        <PlusCircle className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">Añadir Item</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                         <DialogTitle>{editingItem ? 'Editar Item' : 'Añadir Nuevo Item'}</DialogTitle>
                    </DialogHeader>
                    <NewItemForm 
                        onSave={handleSaveItem} 
                        onCancel={() => setIsNewItemDialogOpen(false)}
                        initialData={editingItem}
                    />
                </DialogContent>
            </Dialog>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 md:py-16 px-4">
        <div className="flex flex-col items-center">
          {!hasSearched && <WelcomeContent />}

          <form onSubmit={handleSearch} className="w-full max-w-2xl my-8">
            <div className="relative">
              <BrainCircuit className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Pregúntame lo que sea sobre tus items..."
                className="w-full rounded-full bg-card border-border h-14 pl-12 pr-24 text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full h-10 px-6"
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 md:hidden" />
                    <span className="hidden md:block">Buscar</span>
                  </>
                )}
                <span className="sr-only">Buscar</span>
              </Button>
            </div>
          </form>

          {isSearching && (
             <div className="text-center py-10">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Buscando...</p>
             </div>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
             <div className="text-center py-10">
                <p className="text-lg">No se encontraron resultados.</p>
              </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((item) => (
                <Card key={item.id} className="transition-all hover:shadow-lg flex flex-col">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                        {getIcon(item.type)}
                        <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                    </div>
                     <div className="flex flex-wrap gap-1">
                        {item.categories.map(cat => <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {item.type === 'photo' && item.imageUrl && (
                      <div className="mb-4 aspect-video relative">
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="rounded-md object-cover"
                          data-ai-hint="technical photo"
                        />
                      </div>
                    )}
                    <CardDescription className="line-clamp-4 whitespace-pre-wrap">
                      {item.content}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      {item.type === 'application' && item.downloadUrl && (
                          <Button asChild size="sm" className="mr-auto">
                              <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="mr-2 h-4 w-4" />
                                  Descargar
                              </a>
                          </Button>
                      )}
                      <Button variant="outline" size="icon" onClick={() => handleEditItem(item)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                      </Button>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta acción no se puede deshacer. Esto eliminará permanentemente el item de tu bóveda.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                      Eliminar
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 border-t text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Mikel. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
