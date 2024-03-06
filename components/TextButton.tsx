import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TextStyle, TouchableOpacityProps } from 'react-native';

interface TextButtonProps extends TouchableOpacityProps {
  color?: string;
  size?: number;
}

const TextButton: React.FC<TextButtonProps> = ({ color = 'black', size = 14, style, children, onPress, ...rest }) => {
  return (
    <TouchableOpacity style={style} onPress={onPress} {...rest}>
      <Text style={[styles.text, { color, fontSize: size }]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TextButton;
