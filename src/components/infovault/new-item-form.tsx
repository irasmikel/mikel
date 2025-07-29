'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { InfoItem } from '@/lib/types';
import { getCategorySuggestions } from '@/app/actions';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  content: z.string().min(10, 'El contenido debe tener al menos 10 caracteres'),
  type: z.enum(['note', 'password', 'photo', 'application']),
  categories: z.array(z.string()).min(1, 'Se requiere al menos una categoría'),
  imageUrl: z.string().optional(),
  downloadUrl: z.string().optional(),
});

type NewItemFormProps = {
  onSave: (data: Omit<InfoItem, 'id' | 'createdAt'>, id?: string) => void;
  onCancel: () => void;
  initialData?: InfoItem | null;
};

export default function NewItemForm({ onSave, onCancel, initialData }: NewItemFormProps) {
  const { toast } = useToast();
  const [currentCategory, setCurrentCategory] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData
    } : {
      title: '',
      content: '',
      type: 'note',
      categories: [],
      imageUrl: '',
      downloadUrl: '',
    },
  });

  useEffect(() => {
    if (initialData) {
        reset(initialData);
    } else {
        reset({
            title: '',
            content: '',
            type: 'note',
            categories: [],
            imageUrl: '',
            downloadUrl: '',
        });
    }
  }, [initialData, reset]);

  const categories = watch('categories');
  const itemContent = watch('content');
  const itemType = watch('type');

  const handleAddCategory = () => {
    if (currentCategory && !categories.includes(currentCategory.toLowerCase())) {
      setValue('categories', [...categories, currentCategory.toLowerCase()]);
      setCurrentCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setValue('categories', categories.filter((c) => c !== categoryToRemove));
  };
  
  const handleSuggestCategories = async () => {
      if (!itemContent || itemContent.length < 20) {
          toast({
              title: 'Contenido demasiado corto',
              description: 'Por favor, escribe más contenido (al menos 20 caracteres) para obtener mejores sugerencias.',
              variant: 'destructive',
          });
          return;
      }
      setIsSuggesting(true);
      try {
          const suggestions = await getCategorySuggestions({ itemContent });
          if (suggestions && suggestions.length > 0) {
              const newCategories = [...new Set([...categories, ...suggestions])];
              setValue('categories', newCategories);
              toast({
                title: '¡Sugerencias añadidas!',
                description: 'Hemos añadido algunas sugerencias de categorías para ti.'
              });
          } else {
              toast({
                title: 'No se encontraron nuevas sugerencias.',
                description: 'No pudimos encontrar nuevas categorías para sugerir.'
              });
          }
      } catch (error) {
           toast({
              title: 'Error',
              description: 'No se pudieron obtener las sugerencias. Por favor, inténtalo de nuevo.',
              variant: 'destructive',
          });
      } finally {
          setIsSuggesting(false);
      }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    onSave(data, initialData?.id);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 py-4">
      <div className="grid gap-2">
        <label htmlFor="title">Título</label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <div className="flex justify-between items-center">
          <label htmlFor="content">Contenido / Descripción</label>
           {itemContent.length > 20 && (
            <Button type="button" variant="outline" size="sm" onClick={handleSuggestCategories} disabled={isSuggesting}>
                {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Sugerir Categorías
            </Button>
           )}
        </div>
        <Textarea id="content" {...register('content')} className="min-h-[120px]" />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

       <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
            <label>Tipo</label>
            <Controller
                control={control}
                name="type"
                render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="note">Nota</SelectItem>
                    <SelectItem value="password">Contraseña</SelectItem>
                    <SelectItem value="photo">Foto</SelectItem>
                    <SelectItem value="application">Aplicación</SelectItem>
                    </SelectContent>
                </Select>
                )}
            />
        </div>
        {itemType === 'photo' && (
            <div className="grid gap-2">
                <label htmlFor="imageUrl">URL de la Imagen</label>
                <Input id="imageUrl" {...register('imageUrl')} placeholder="https://placehold.co/800x600.png" />
            </div>
        )}
        {itemType === 'application' && (
            <div className="grid gap-2">
                <label htmlFor="downloadUrl">URL de Descarga</label>
                <Input 
                  id="downloadUrl" 
                  {...register('downloadUrl')} 
                  placeholder="https://firebasestorage.googleapis.com/..." 
                />
                <p className="text-xs text-muted-foreground">
                    Pega aquí la "URL de acceso" que obtienes de la consola de Firebase.
                </p>
            </div>
        )}
      </div>

      <div className="grid gap-2">
        <label>Categorías</label>
        <div className="flex items-center gap-2">
          <Input
            value={currentCategory}
            onChange={(e) => setCurrentCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="Añadir una categoría"
          />
          <Button type="button" variant="outline" size="icon" onClick={handleAddCategory}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
         {errors.categories && <p className="text-sm text-destructive">{errors.categories.message}</p>}
        <div className="flex flex-wrap gap-2 mt-2">
          {categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="flex items-center gap-1">
              {cat}
              <button type="button" onClick={() => handleRemoveCategory(cat)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>


      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Guardar Cambios' : 'Crear Item'}
        </Button>
      </div>
    </form>
  );
}
