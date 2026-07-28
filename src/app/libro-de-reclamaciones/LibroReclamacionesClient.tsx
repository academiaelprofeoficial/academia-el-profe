'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function LibroReclamacionesClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [correlative, setCorrelative] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    consumerName: '',
    consumerIdType: 'DNI',
    consumerId: '',
    consumerPhone: '',
    consumerEmail: '',
    consumerAddress: '',
    isMinor: false,
    parentName: '',
    parentId: '',
    contractType: 'Producto',
    amount: '',
    description: '',
    claimType: 'Reclamo',
    claimDetail: '',
    consumerRequest: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/reclamaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ocurrió un error al enviar el reclamo');
      }

      setCorrelative(data.correlative);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <h2 className="text-2xl font-bold">¡Reclamación Registrada!</h2>
        <p className="text-muted-foreground">
          Tu hoja de reclamación ha sido enviada exitosamente. Conserva este número para cualquier consulta.
        </p>
        <div className="bg-muted px-6 py-3 rounded-lg text-xl font-mono font-bold mt-4 tracking-widest">
          {correlative}
        </div>
        <p className="text-xs text-muted-foreground mt-6 max-w-md">
          De conformidad con la ley, el proveedor deberá dar respuesta al reclamo en un plazo no mayor a quince (15) días hábiles improrrogables.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* 1. Datos del Consumidor */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">1. Identificación del Consumidor Reclamante</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="consumerName">Nombre Completo <span className="text-destructive">*</span></Label>
            <input required id="consumerName" name="consumerName" type="text" value={formData.consumerName} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerEmail">Correo Electrónico <span className="text-destructive">*</span></Label>
            <input required id="consumerEmail" name="consumerEmail" type="email" value={formData.consumerEmail} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerIdType">Tipo de Documento <span className="text-destructive">*</span></Label>
            <select id="consumerIdType" name="consumerIdType" value={formData.consumerIdType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="DNI">DNI</option>
              <option value="CE">Carné de Extranjería</option>
              <option value="Pasaporte">Pasaporte</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerId">N° de Documento <span className="text-destructive">*</span></Label>
            <input required id="consumerId" name="consumerId" type="text" value={formData.consumerId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerPhone">Teléfono</Label>
            <input id="consumerPhone" name="consumerPhone" type="tel" value={formData.consumerPhone} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="consumerAddress">Domicilio (Dirección Completa)</Label>
            <input id="consumerAddress" name="consumerAddress" type="text" value={formData.consumerAddress} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>

          <div className="flex items-center space-x-2 md:col-span-2 pt-2">
            <input type="checkbox" id="isMinor" name="isMinor" checked={formData.isMinor} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
            <Label htmlFor="isMinor" className="font-normal cursor-pointer">Soy menor de edad</Label>
          </div>
        </div>

        {formData.isMinor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="parentName">Nombre del Padre/Madre/Apoderado <span className="text-destructive">*</span></Label>
              <input required={formData.isMinor} id="parentName" name="parentName" type="text" value={formData.parentName} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">DNI del Apoderado <span className="text-destructive">*</span></Label>
              <input required={formData.isMinor} id="parentId" name="parentId" type="text" value={formData.parentId} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
            </div>
          </div>
        )}
      </section>

      {/* 2. Bien Contratado */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">2. Identificación del Bien Contratado</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contractType">Tipo <span className="text-destructive">*</span></Label>
            <select id="contractType" name="contractType" value={formData.contractType} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <option value="Producto">Producto (Curso / Material)</option>
              <option value="Servicio">Servicio</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monto Reclamado (S/ o USD)</Label>
            <input id="amount" name="amount" type="number" step="0.01" value={formData.amount} onChange={handleChange} placeholder="0.00" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Descripción (Nombre del curso o producto) <span className="text-destructive">*</span></Label>
            <input required id="description" name="description" type="text" value={formData.description} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          </div>
        </div>
      </section>

      {/* 3. Detalle de Reclamación */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">3. Detalle de la Reclamación y Pedido del Consumidor</h2>
        
        <div className="space-y-4">
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="claimType" value="Reclamo" checked={formData.claimType === 'Reclamo'} onChange={handleChange} className="text-brand-primary focus:ring-brand-primary" />
              <span>Reclamo</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="radio" name="claimType" value="Queja" checked={formData.claimType === 'Queja'} onChange={handleChange} className="text-brand-primary focus:ring-brand-primary" />
              <span>Queja</span>
            </label>
          </div>
          
          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
            <strong>Reclamo:</strong> Disconformidad relacionada a los productos o servicios.<br/>
            <strong>Queja:</strong> Disconformidad no relacionada a los productos o servicios; o malestar respecto a la atención al público.
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimDetail">Detalle <span className="text-destructive">*</span></Label>
            <textarea required id="claimDetail" name="claimDetail" rows={4} value={formData.claimDetail} onChange={handleChange} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" placeholder="Describe los hechos de manera clara..."></textarea>
          </div>

          <div className="space-y-2">
            <Label htmlFor="consumerRequest">Pedido <span className="text-destructive">*</span></Label>
            <textarea required id="consumerRequest" name="consumerRequest" rows={3} value={formData.consumerRequest} onChange={handleChange} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" placeholder="¿Qué solicitas como solución?"></textarea>
          </div>
        </div>
      </section>

      <div className="pt-4 border-t">
        <Button type="submit" className="w-full h-12 text-base font-bold bg-brand-primary hover:bg-brand-primary-hover text-white" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Enviando reclamo...
            </>
          ) : (
            'Enviar Hoja de Reclamación'
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          La formulación del reclamo no impide acudir a otras vías de solución de controversias ni es requisito previo para interponer una denuncia ante el INDECOPI.
        </p>
      </div>
    </form>
  );
}
