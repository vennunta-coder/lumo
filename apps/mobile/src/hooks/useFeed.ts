import { useEffect, useState } from 'react';
import { fetchFeed } from '../api/client';
import { VideoItem } from '../types';
export function useFeed(){
  const [items,setItems]=useState<VideoItem[]>([]);
  const [cursor,setCursor]=useState<string|undefined>(undefined);
  const [loading,setLoading]=useState(false);
  async function loadMore(){ if(loading)return; setLoading(true); const data=await fetchFeed(cursor); setItems(p=>[...p,...data.items as VideoItem[]]); setCursor(data.nextCursor); setLoading(false); }
  useEffect(()=>{ loadMore(); },[]);
  return { items, loadMore, loading };
}
