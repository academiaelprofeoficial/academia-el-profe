# Sanity CMS Visual Editing — Guía para IA

Usa este prompt cuando le pidas a cualquier IA (DeepSeek, Claude, GPT) que haga editable desde Sanity CMS un nuevo campo o sección de la página.

---

## Prompt estándar para la IA

```
IMPORTANTE: Este proyecto usa Sanity CMS + Next.js App Router + Presentation Tool (Visual Editing).

Cuando agregues nuevos campos editables desde CMS, debes seguir este checklist de 5 pasos OBLIGATORIOS. 
Si omites alguno, los campos no serán editables desde la vista previa y el usuario tendrá que reportarlo.

## CHECKLIST OBLIGATORIO (no omitir ninguno)

### Paso 1 — Schema de Sanity
Archivo: `sanity/schemas/pageContent.ts`
- Agregar el nuevo campo en el schema con `defineField`
- Usar `fieldset: "nosotros"` (o el fieldset correspondiente)
- Los arrays deben usar `type: "array"` con `of: [{ type: "object", fields: [...] }]`

### Paso 2 — GROQ Query
Archivo: `src/lib/sanity.queries.ts`
- AGREGAR `_key` en TODOS los arrays (ej: `caracteristicas[] { _key, ... }`)
- Obligatorio: sin `_key`, Sanity no puede identificar elementos individuales del array
- Para objetos: `profesor { _key, nombre, ... }`

### Paso 3 — TypeScript Interface
Archivo: `src/lib/sanity.client.ts`
- Agregar `_key?: string` en TODAS las interfaces que representen objetos dentro de arrays
- Ej: `SanityCaracteristica { _key?: string; icono?: string; ... }`

### Paso 4 — Componente React (data-sanity-edit)
Archivo: donde se renderiza el contenido (ej: `NosotrosClient.tsx`)
- AGREGAR `data-sanity-edit` a CADA elemento HTML que deba ser editable
- Formato correcto:
  - Campo simple: `data-sanity-edit={`pageContent.{_id}.miCampo`}`
  - Objeto: `data-sanity-edit={`pageContent.{_id}.miObjeto`}` (en el contenedor)
  - Array item: `` data-sanity-edit={`pageContent.{_id}.miArray[_key=="${item._key}"]`} ``
- Si no pones `data-sanity-edit`, el Presentation Tool NO muestra el overlay azul

### Paso 5 — Verificación
- Abrir `/admin/cms` → buscar el documento editado
- Abrir la página pública en otra pestaña con Presentation Tool
- Hover sobre cada nuevo campo → debe aparecer el overlay azul con el lápiz
- Click → debe abrir el campo correcto en Sanity Studio

## Formato correcto de data-sanity-edit

```
Campo simple:         data-sanity-edit={`pageContent.${_id}.titulo`}
Objeto anidado:       data-sanity-edit={`pageContent.${_id}.profesor`}
Array con _key:       data-sanity-edit={`pageContent.${_id}.items[_key=="${item._key}"]`}
Campo dentro de objeto: (Sanity infiere la ruta, solo poner en el contenedor del objeto)
```

## Si NO incluyes _key en la GROQ query

Los arrays de objetos NO tendrán identificador único. Sanity no podrá abrir el item correcto
al hacer clic desde el Presentation Tool. El overlay azul no aparecerá.
```

---

## Ejemplo real (lo que hicimos en página /nosotros)

### Schema (`sanity/schemas/pageContent.ts`)
```ts
defineField({
  name: "caracteristicas",
  title: "Tarjetas de Características",
  fieldset: "nosotros",
  type: "array",
  of: [{
    type: "object",
    fields: [
      { name: "icono", title: "Icono (Lucide)", type: "string" },
      { name: "titulo", title: "Título", type: "string" },
      { name: "descripcion", title: "Descripción", type: "text", rows: 3 },
    ],
  }],
}),
```

### GROQ Query (`src/lib/sanity.queries.ts`)
```groq
caracteristicas[] { _key, icono, titulo, descripcion }
```

### TypeScript (`src/lib/sanity.client.ts`)
```ts
export interface SanityCaracteristica { 
  _key?: string;  // ← OBLIGATORIO
  icono?: string; 
  titulo?: string; 
  descripcion?: string; 
}
```

### Componente React
```tsx
{caracteristicas.map((item) => (
  <div 
    key={item._key}
    data-sanity-edit={`pageContent.${_id}.caracteristicas[_key=="${item._key}"]`}
  >
    <h3>{item.titulo}</h3>
    <p>{item.descripcion}</p>
  </div>
))}
```

---

## Referencia rápida de archivos

| Archivo | Propósito |
|---------|-----------|
| `sanity/schemas/pageContent.ts` | Schema de Sanity (definir campos) |
| `src/lib/sanity.queries.ts` | GROQ queries (incluir `_key` en arrays) |
| `src/lib/sanity.client.ts` | TypeScript interfaces (incluir `_key`) |
| `src/app/nosotros/NosotrosClient.tsx` | Componente React (agregar `data-sanity-edit`) |
