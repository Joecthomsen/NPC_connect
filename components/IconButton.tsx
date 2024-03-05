import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Import icon library

interface IconButtonProps extends TouchableOpacityProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ iconName, onPress, ...rest }) => {
  return (
    <TouchableOpacity onPress={onPress} {...rest}>
      <Ionicons name={iconName} size={36} color="white" />
    </TouchableOpacity>
  );
};

export default IconButton;