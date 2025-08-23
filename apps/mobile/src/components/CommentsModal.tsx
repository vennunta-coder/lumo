import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { fetchComments, postComment } from '../api/client';
export default function CommentsModal({ visible, onClose, videoId }: { visible: boolean; onClose: () => void; videoId: string }){
  const [items,setItems]=useState<any[]>([]); const [text,setText]=useState('');
  useEffect(()=>{ if(visible){ fetchComments(videoId).then(setItems).catch(()=>{}); } },[visible,videoId]);
  async function send(){ if(!text.trim())return; const c=await postComment(videoId,text.trim()); setItems(p=>[...p,{...c,user:{username:'you'}}]); setText(''); }
  return (<Modal visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.container}>
    <Text style={styles.title}>Comentários</Text>
    <FlatList style={{flex:1}} data={items} keyExtractor={(it)=>it.id} renderItem={({item})=>(<View style={styles.comment}><Text style={styles.user}>@{item.user?.username||'user'}</Text><Text style={styles.text}>{item.text}</Text></View>)}/>
    <View style={styles.inputRow}><TextInput value={text} onChangeText={setText} placeholder="Escreva um comentário..." style={styles.input}/><Button title="Enviar" onPress={send}/></View>
    <Button title="Fechar" onPress={onClose}/>
  </View></Modal>);}
const styles=StyleSheet.create({container:{flex:1,padding:16,paddingTop:48,backgroundColor:'#111'},title:{color:'#fff',fontSize:20,marginBottom:12},comment:{paddingVertical:8,borderBottomWidth:1,borderBottomColor:'#333'},user:{color:'#aaa',marginBottom:4},text:{color:'#fff'},inputRow:{flexDirection:'row',alignItems:'center',gap:8},input:{flex:1,backgroundColor:'#222',color:'#fff',padding:10,borderRadius:8}});
