// App.js - Improved security by removing direct AES key storage and added better user interaction feedback.

import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import CryptoJS from 'crypto-js';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseConfig from './firebase/firebaseConfig';

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const bleManager = new BleManager();

// Function to establish encrypted Bluetooth connection
async function connectToDevice(deviceId) {
  try {
    const device = await bleManager.connectToDevice(deviceId);
    const encryptedData = await device.readCharacteristicForService(
      'encryption_service_uuid',
      'encrypted_data_characteristic_uuid'
    );
    const decryptedData = aesDecrypt(encryptedData, process.env.AES_KEY);
    return decryptedData;
  } catch (error) {
    Alert.alert('Connection Error', 'Failed to connect to device: ' + error.message);
    throw error;
  }
}

// Function to encrypt data using AES
function aesEncrypt(data, key) {
  const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
  return encryptedData;
}

// Function to decrypt data using AES
function aesDecrypt(encryptedData, key) {
  const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
  return decryptedData;
}

export default function App() {
  const [deviceData, setDeviceData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
      } else {
        Alert.alert('Login Required', 'Please login to access this functionality.');
      }
    });
  }, []);

  useEffect(() => {
    connectToDevice('device_id_here').then(data => {
      setDeviceData(data);
    }).catch(error => {
      console.error('Error:', error);
    });
  }, []);

  function communicateWithComBadge(badgeNumber, department, homePlanet, missionStatus, name, position, rank, shipAssignment, specializations) {
    const usersRef = firebase.firestore().collection('users');
    usersRef.where('badgeNumber', '==', badgeNumber).where('department', '==', department).get()
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          querySnapshot.forEach(doc => {
            const userData = doc.data();
            Alert.alert('ComBadge Communication', `Contacting ${userData.name} in department ${userData.department}`);
          });
        } else {
          Alert.alert('ComBadge Communication', 'Sorry, member not found.');
        }
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
      });
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {deviceData ? (
        <Text>Decrypted Device Data: {deviceData}</Text>
      ) : (
        <Text>Loading...</Text>
      )}
      {currentUser && (
        <Button
          title="Contact ComBadge"
          onPress={() => communicateWithComBadge(currentUser.badgeNumber, currentUser.department, currentUser.homePlanet, currentUser.missionStatus, currentUser.name, currentUser.position, currentUser.rank, currentUser.shipAssignment, currentUser.specializations)}
        />
      )}
    </View>
  );
}
