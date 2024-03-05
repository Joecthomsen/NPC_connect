import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ onPress, title, color, disabled }) => {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled !== undefined ? disabled : false}>
        <View style={[styles.button, { backgroundColor: color }]}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const styles = StyleSheet.create({
    button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: 'center',
      width: 200,
      height: 45,
      justifyContent: 'center',
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default CustomButton;