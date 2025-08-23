import axios from 'axios';
export const api = axios.create({ baseURL: 'http://localhost:4000/api' });
export async function loginDemo(){ const {data}=await api.post('/auth/login',{username:'demo',password:'password'}); api.defaults.headers.common['Authorization']=`Bearer ${data.token}`; return data.token as string; }
export async function fetchFeed(cursor?:string){ const {data}=await api.get('/videos',{params:{cursor,take:10}}); return data as {items:any[];nextCursor?:string}; }
export async function likeVideo(id:string){ await api.post(`/videos/${id}/like`); }
export async function uploadVideo(uri:string, caption?:string){
  const form=new FormData(); const filename=uri.split('/').pop()||'video.mp4';
  // @ts-ignore
  form.append('file',{ uri, name: filename, type:'video/mp4'});
  if(caption) form.append('caption', caption);
  const {data}=await api.post('/videos', form, { headers:{'Content-Type':'multipart/form-data'} });
  return data;
}
export async function fetchComments(id:string){ const {data}=await api.get(`/videos/${id}/comments`); return data as Array<{id:string;text:string;user:{username:string}}>; }
export async function postComment(id:string, text:string){ const {data}=await api.post(`/videos/${id}/comment`, {text}); return data; }
