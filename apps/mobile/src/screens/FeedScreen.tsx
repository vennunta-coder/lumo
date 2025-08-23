import React, { useEffect } from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import VideoCard from '../components/VideoCard';
import { useFeed } from '../hooks/useFeed';
import { loginDemo } from '../api/client';
import SideBar from '../components/SideBar';
const { height } = Dimensions.get('window');
export default function FeedScreen(){
  const { items, loadMore } = useFeed();
  useEffect(()=>{ (async()=>{ try{ await loginDemo(); }catch{} })(); },[]);
  return (<View style={{ flex:1, backgroundColor:'#000' }}>
    <FlatList data={items} keyExtractor={(it)=>it.id} renderItem={({item})=> <VideoCard item={item}/>} pagingEnabled onEndReached={loadMore} onEndReachedThreshold={0.6} getItemLayout={(_d,i)=>({length:height,offset:height*i,index:i})}/>
    <SideBar/>
  </View>);
}
