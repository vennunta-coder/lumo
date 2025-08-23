import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { likeVideo } from '../api/client';
import { VideoItem } from '../types';
import CommentsModal from './CommentsModal';
export default function VideoCard({ item }:{ item: VideoItem }){
  const ref=useRef<Video>(null); const [liked,setLiked]=useState(false); const [open,setOpen]=useState(false);
  async function onLike(){ setLiked(true); try{ await likeVideo(item.id);}catch{} }
  async function onShare(){ try{ await Share.share({ message: item.url }); } catch {} }
  return (<View style={styles.container}>
    <Video ref={ref} source={{uri:item.url}} style={styles.video} resizeMode={ResizeMode.COVER} isLooping shouldPlay isMuted/>
    <View style={styles.overlay}>
      <View style={styles.meta}><Text style={styles.caption}>{item.caption||''}</Text><Text style={styles.user}>@{item.user?.username||'user'}</Text></View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onLike} style={styles.actionBtn}><Text style={styles.actionText}>{liked?'❤️':'🤍'}</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={()=>setOpen(true)}><Text style={styles.actionText}>💬</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onShare}><Text style={styles.actionText}>🔗</Text></TouchableOpacity>
      </View>
    </View>
    <CommentsModal visible={open} onClose={()=>setOpen(false)} videoId={item.id}/>
  </View>);
}
const styles=StyleSheet.create({container:{height:'100%',width:'100%',backgroundColor:'#000'},video:{height:'100%',width:'100%'},overlay:{position:'absolute',top:0,left:0,right:0,bottom:0,justifyContent:'space-between'},meta:{padding:16},caption:{color:'#fff',fontSize:16,marginBottom:8},user:{color:'#ddd',fontSize:13},actions:{position:'absolute',right:12,bottom:24,alignItems:'center',gap:16},actionBtn:{padding:8},actionText:{fontSize:24}});
