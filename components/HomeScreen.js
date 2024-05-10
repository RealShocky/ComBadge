// HomeScreen.js

import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import firebase from 'firebase/app';
import 'firebase/auth';

const HomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Check if user is logged in
    firebase.auth().onAuthStateChanged(user => {
      if (!user) {
        // If user is not logged in, navigate to the login screen
        navigation.navigate('Login');
      }
    });
  }, []);

  const handleLogout = () => {
    firebase.auth().signOut()
      .then(() => {
        // Sign-out successful, navigate to login screen
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Logout error:', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to LCARS</Text>
      <Text style={styles.subtitle}>Library Computer Access and Retrieval System</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFCC00',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 20,
  },
});

export default HomeScreen;
