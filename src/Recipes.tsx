import {useEffect,useState} from 'react';
import {ArrowLeft,ChevronRight,ImagePlus,Pencil,Plus,Trash2,UtensilsCrossed,X} from 'lucide-react';
import {createRecipe,updateRecipe,removeRecipe,getRecipeImageUrl, type Recipe,type RecipeCategory} from './recipes';

const categories: {id:RecipeCategory;label:string;emoji:string}[]=[
  {id:'breakfast',label:'Petit Déj',emoji:'🥐'},
  {id:'meal',label:'Plat',emoji:'🥗'},
  {id:'treat',label:'Gourmandise',emoji:'🍰'}
];

function RecipeImage({recipe,large=false}:{recipe:Recipe;large?:boolean}){
  const [url,setUrl]=useState('');
  useEffect(()=>{let active=true;setUrl('');getRecipeImageUrl(recipe.imagePath).then(x=>{if(active)setUrl(x)}).catch(()=>{});return()=>{active=false}},[recipe.imagePath]);
  return url?<img src={url} alt={large?`Fiche recette : ${recipe.title}`:''} loading={large?'eager':'lazy'}/>:<div className="recipe-image-placeholder" aria-label="Chargement de l’image">🍽️</div>;
}
export default function Recipes({items,isAdmin,demo,onRefresh}: {items:Recipe[];isAdmin:boolean;demo:boolean;onRefresh:()=>Promise<void>}) {
  const [category,setCategory]=useState<RecipeCategory>('breakfast');
  const [view,setView]=useState<string|null>(null);
  const [editing,setEditing]=useState<Recipe|true|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const selected=items.find(x=>x.id===view);
  const visible=items.filter(x=>x.category===category).sort((a,b)=>a.title.localeCompare(b.title,'fr'));
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();setError('');setNotice('');
    if(demo){setError('Les ajouts sont désactivés en mode aperçu.');return;}
    const form=new FormData(e.currentTarget);
    const title=String(form.get('title')||'').trim();
    const cat=String(form.get('category')||'') as RecipeCategory;
    const file=form.get('image');
    const img=file instanceof File&&file.size?file:null;
    if(!title||title.length>100||!categories.some(c=>c.id===cat)){setError('Vérifiez le titre et la catégorie.');return;}
    if(!img&&editing===true){setError('Choisissez une image de la recette.');return;}
    setBusy(true);
    try {
      if(editing===true)await createRecipe(title,cat,img!);
      else if(editing)await updateRecipe(editing,title,cat,img);
      await onRefresh();setCategory(cat);setEditing(null);setNotice('Recette enregistrée.');
    }catch(e:any){setError(e?.message||'Enregistrement impossible.');}
    finally{setBusy(false);}
  }
  async function remove(recipe:Recipe){
    if(!confirm(`Supprimer « ${recipe.title} » ?`))return;
    setBusy(true);setError('');
    try{await removeRecipe(recipe);await onRefresh();setEditing(null);setView(null);setNotice('Recette supprimée.');}
    catch(e:any){setError(e?.message||'Suppression impossible.');}
    finally{setBusy(false);}
  }
  return <div className="recipes">
    {error&&<div className="alert" role="alert">{error} <button onClick={()=>setError('')}>Fermer</button></div>}
    {notice&&<div className="toast" role="status">{notice}<button aria-label="Fermer" onClick={()=>setNotice('')}><X size={16}/></button></div>}
    {selected?<section className="panel recipe-detail">
      <button className="recipe-back" onClick={()=>setView(null)}><ArrowLeft size={18}/> Retour aux recettes</button>
      <span className="eyebrow">{categories.find(x=>x.id===selected.category)?.label}</span>
      <h2>{selected.title}</h2>
      <RecipeImage recipe={selected} large/>
      {isAdmin&&<div className="recipe-actions"><button className="secondary" onClick={()=>setEditing(selected)}><Pencil size={16}/> Modifier</button><button className="secondary" disabled={busy||demo} onClick={()=>remove(selected)}><Trash2 size={16}/> Supprimer</button></div>}
    </section>:<>
      <div className="recipe-toolbar"><div className="recipe-tabs" role="group" aria-label="Catégorie de recettes">{categories.map(c=><button key={c.id} className={category===c.id?'chosen':''} aria-pressed={category===c.id} onClick={()=>setCategory(c.id)}><span aria-hidden="true">{c.emoji}</span> {c.label}</button>)}</div>{isAdmin&&<button className="button" onClick={()=>{setError('');setEditing(true)}}><Plus size={17}/> Ajouter une recette</button>}</div>
      <section className="panel recipe-list">{visible.length?visible.map(r=><div className="recipe-row" key={r.id}><button className="recipe-open" onClick={()=>setView(r.id)}><RecipeImage recipe={r}/><strong>{r.title}</strong><ChevronRight size={19}/></button>{isAdmin&&<div className="recipe-row-actions"><button className="icon-button" aria-label={`Modifier ${r.title}`} onClick={()=>{setError('');setEditing(r)}}><Pencil size={17}/></button><button className="icon-button" aria-label={`Supprimer ${r.title}`} disabled={busy||demo} onClick={()=>remove(r)}><Trash2 size={17}/></button></div>}</div>):<div className="empty"><UtensilsCrossed size={32}/><h3>Aucune recette pour le moment</h3><p>{isAdmin?'Ajoutez une fiche recette pour la rendre accessible aux clientes.':'De nouvelles gourmandises arrivent bientôt !'}</p></div>}</section>
    </>}
    {editing&&<div className="modal-backdrop"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="recipe-form-title"><button className="modal-close icon-button" aria-label="Fermer" disabled={busy} onClick={()=>{setEditing(null);setError('')}}><X/></button><span className="eyebrow">GESTION DES RECETTES</span><h2 id="recipe-form-title">{editing===true?'Ajouter une recette':'Modifier la recette'}</h2><p>Importez la fiche recette créée avec ChatGPT. La même image apparaîtra en miniature dans la liste et en grand à l’ouverture.</p><form onSubmit={submit}><label>Titre de la recette<input name="title" maxLength={100} required defaultValue={editing===true?'':editing.title} placeholder="Ex. Pancakes moelleux"/></label><label>Catégorie<select name="category" defaultValue={editing===true?category:editing.category}>{categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}</select></label><label><span className="recipe-upload-label"><ImagePlus size={18}/> Image de la recette (JPG, PNG ou WebP)</span><input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={editing===true}/></label><p className="footnote">Taille maximale : 8 Mo. {editing!==true?'Laissez ce champ vide pour conserver l’image actuelle.':''}</p>{error&&<div className="alert" role="alert">{error}</div>}<button className="button full" disabled={busy||demo} type="submit">{busy?'Enregistrement en cours…':'Enregistrer la recette'}</button>{demo&&<p>Fonction désactivée en mode aperçu.</p>}</form></section></div>}
  </div>
}
