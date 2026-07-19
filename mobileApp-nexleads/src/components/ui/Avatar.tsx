import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle, StyleProp } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/spacing';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  borderColor?: string;
  style?: ViewStyle;
}

export function Avatar({
  uri,
  name,
  size = 40,
  borderColor = Colors.primary,
  style,
}: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor,
  };
  const imageStyle = style as StyleProp<ImageStyle>;
  const viewStyle = style as StyleProp<ViewStyle>;

  if (uri) {
    return (
      <Image source={{ uri }} style={[containerStyle, styles.image, imageStyle]} />
    );
  }

  return (
    <View
      style={[
        containerStyle,
        styles.placeholder,
        { backgroundColor: Colors.light.blue300 },
        viewStyle,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontFamily: 'Poppins_700Bold',
    color: Colors.light.blue900,
  },
});
