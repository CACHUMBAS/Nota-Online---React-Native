import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return <View style={styles.screen}><StatusBar style="dark" /><Text style={styles.title}>Nota Online</Text><Text>Una voz para cada trabajo.</Text></View>;
}
const styles = StyleSheet.create({screen:{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#f5f7fb'},title:{fontSize:32,fontWeight:'800',color:'#172947'}});
