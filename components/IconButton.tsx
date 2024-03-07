import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { Ionicons } from '@expo/vector-icons'; // Import icon library

interface IconButtonProps extends TouchableOpacityProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  color?: string;
  size?: number;
}

const IconButton: React.FC<IconButtonProps> = ({ iconName, onPress, disabled, color, size, ...rest }) => {
  return (
    <TouchableOpacity onPress={onPress} {...rest} disabled={disabled === undefined ? false : true} >
      <Ionicons name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

export default IconButton;