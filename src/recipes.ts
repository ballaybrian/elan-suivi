import {getAuth} from 'firebase/auth';
import {collection,deleteDoc,doc,getDocs,getFirestore,serverTimestamp,setDoc,updateDoc} from 'firebase/firestore';
import {deleteObject,getDownloadURL,getStorage,ref,uploadBytes} from 'firebase/storage';
import {initialize} from './firebase';

export type RecipeCategory='breakfast'|'meal'|'treat';
export type Recipe={id:string;title:string;category:RecipeCategory;imagePath:string};
const types=['image/jpeg','image/png','image/webp'];
const categories=['breakfast','meal','treat'];
const maxSize=8*1024*1024;

function validate(title:string,category:RecipeCategory,file:File|null){
  if(!title.trim()||title.length>100)throw new Error('Le titre doit contenir entre 1 et 100 caractères.');
  if(!categories.includes(category))throw new Error('Catégorie invalide.');
  if(file&&(!types.includes(file.type)||file.size>maxSize||file.size===0))throw new Error('Choisissez une image JPG, PNG ou WebP de 8 Mo maximum.');
}
async function authorized(){
  await initialize();
  const user=getAuth().currentUser;
  if(!user?.emailVerified)throw new Error('Vous devez être connecté avec un e-mail vérifié.');
  return user;
}
export async function listRecipes():Promise<Recipe[]>{
  await authorized();
  const snap=await getDocs(collection(getFirestore(),'recipes'));
  return snap.docs.map(x=>({id:x.id,...x.data()} as Recipe));
}
const urls=new Map<string,string>();
export async function getRecipeImageUrl(path:string){
  if(urls.has(path))return urls.get(path)!;
  await initialize();const url=await getDownloadURL(ref(getStorage(),path));urls.set(path,url);return url;
}
async function upload(id:string,file:File){
  validate('image','meal',file);
  const extension=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  const path=`recipes/${id}/${crypto.randomUUID()}.${extension}`;
  await uploadBytes(ref(getStorage(),path),file,{contentType:file.type});return path;
}
export async function createRecipe(title:string,category:RecipeCategory,file:File){
  await authorized();validate(title,category,file);
  const db=getFirestore(),record=doc(collection(db,'recipes'));
  const path=await upload(record.id,file);
  try{await setDoc(record,{title:title.trim(),category,imagePath:path,createdAt:serverTimestamp()});}
  catch(e){await deleteObject(ref(getStorage(),path)).catch(()=>{});throw e;}
}
export async function updateRecipe(recipe:Recipe,title:string,category:RecipeCategory,file:File|null){
  await authorized();validate(title,category,file);
  const path=file?await upload(recipe.id,file):recipe.imagePath;
  try{await updateDoc(doc(getFirestore(),'recipes',recipe.id),{title:title.trim(),category,imagePath:path});}
  catch(e){if(file)await deleteObject(ref(getStorage(),path)).catch(()=>{});throw e;}
  if(file){urls.delete(recipe.imagePath);await deleteObject(ref(getStorage(),recipe.imagePath)).catch(()=>{});}
}
export async function removeRecipe(recipe:Recipe){
  await authorized();await deleteDoc(doc(getFirestore(),'recipes',recipe.id));
  urls.delete(recipe.imagePath);await deleteObject(ref(getStorage(),recipe.imagePath)).catch(()=>{});
}
