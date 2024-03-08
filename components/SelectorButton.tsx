import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
//import Ionicons from "@expo/vector-icons"; // Import icon library
//import Ionicons from "react-native-vector-icons/Ionicons";
import Ionicons from "react-native-vector-icons/Ionicons";

interface SelectorButtonProps {
    iconName: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    disabled?: boolean;
    selected?: boolean;
    selectedColor?: string;
    color?: string;
    size?: number;
    text: string
}


const SelectorButton: React.FC<SelectorButtonProps> = ({
    iconName,
    onPress,
    disabled,
    selected,
    selectedColor,
    color,
    size,
    text,
    ...rest
  }) => {

    return (
      <TouchableOpacity
        onPress={() => onPress()}
        {...rest}
        disabled={disabled === undefined ? false : true}
      >
        <View style={styles.controller_button_container}>
            <Ionicons name={iconName} size={size} color={selected ? selectedColor : color} />
            <Text style={[styles.controller_button_text, { color: selected ? selectedColor : color }]}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    controller_button_container: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 15,
    },
    controller_button_text: {
      fontSize: 15,
      fontWeight: "normal",
      color: "#9214bc",
      textAlign: "center",
    },
  });

  export default SelectorButton;