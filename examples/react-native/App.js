import { StatusBar } from 'expo-status-bar';
import { TextInput, StyleSheet, Text, SafeAreaView, Button } from 'react-native';
import { useState, useEffect } from "react";

const hostname = "wss://substreams-sink-websockets-production.up.railway.app"
const ws = new WebSocket(hostname);

export default function App() {
  const [moduleHash, setModuleHash] = useState('0a363b2a63aadb76a525208f1973531d3616fbae');
  const [messages, setMessages] = useState([]);

  function handlePress() {
    ws.send(moduleHash);
  }

  useEffect(() => {
    ws.onmessage = event => {
      const json = JSON.parse(event.data);
      const { message, clock, manifest, data } = json;
      const payload = message ?? `Block: ${clock.number} | Transactions: ${data.transactionTraces}`;
      if ( payload ) setMessages((prevMessages) => [...prevMessages, payload]);
    };
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Substreams WebSockets</Text>
      <Text>Hash Module</Text>
      <TextInput
        style={styles.input}
        onChangeText={setModuleHash}
        value={moduleHash}
      />
      <Button
        onPress={handlePress}
        title="Send"
        color="#111"
        accessibilityLabel="Learn more about this purple button"
      />
      {messages.map((message, index) => {
        return <Text key={index}>{message}</Text>;
      })}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
