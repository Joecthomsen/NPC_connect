import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Import icon library

interface IconButtonProps extends TouchableOpacityProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({ iconName, onPress, disabled, ...rest }) => {
  return (
    <TouchableOpacity onPress={onPress} {...rest} disabled={disabled === undefined ? false : true} >
      <Ionicons name={iconName} size={36} color="white" />
    </TouchableOpacity>
  );
};

export default IconButton;