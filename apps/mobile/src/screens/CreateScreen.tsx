import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadVideo } from '../api/client';
export default function CreateScreen(){
  const [caption,setCaption]=useState(''); const [file,setFile]=useState<{uri:string;name?:string}|null>(null);
  async function pick(){ const res=await DocumentPicker.getDocumentAsync({ type:['video/*'], copyToCacheDirectory:true }); if(res.type==='success'){ setFile({uri:res.uri,name:res.name}); } }
  async function send(){ if(!file) return Alert.alert('Selecione um vídeo primeiro'); try{ await uploadVideo(file.uri, caption); Alert.alert('Sucesso','Vídeo enviado!'); setFile(null); setCaption(''); } catch { Alert.alert('Erro','Falha ao enviar vídeo'); } }
  return (<View style={{flex:1,alignItems:'center',justifyContent:'center',gap:12,padding:16}}>
    <Text style={{fontSize:18}}>Criar</Text>
    <TextInput placeholder="Legenda (opcional)" value={caption} onChangeText={setCaption} style={{width:'100%',borderWidth:1,borderColor:'#ccc',padding:10,borderRadius:8}}/>
    <Button title={file ? `Arquivo: ${file.name||'video'}` : 'Selecionar Vídeo'} onPress={pick}/>
    <Button title="Enviar" onPress={send}/>
  </View>);
}
