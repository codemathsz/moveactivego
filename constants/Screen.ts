// colors.js

const colors = {
  primary: '#268e50',

  success: '#3fdc81',
  danger: '#ee5252',
  alert: '#f3ba2f',
  info: '#299bdb',

  lines: '#bcbec9',
  background: '#f9f9f9',
  border: '#ededed',

  textPrimary: '#212121',
  textSecondary: '#4c4c4c',
  lightText: '#9E9D9D',
};

const screens = {
  transparentHeader: {
    headerTransparent: true,
    headerTitle: '',
  },
  withHeader: {
    headerShown: true,
    headerTintColor: colors.primary,
    headerShadowVisible: false,
    headerStyle: {
      backgroundColor: colors.background,
    },
    headerTitleStyle: {
      color: colors.textSecondary,
      textAlign: 'center',
      fontFamily: 'Poppins-Bold',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0.08,
    },
    headerTitleAlign: 'center',
    headerBackTitle: 'Back',
  },
  withoutHeader: {
    headerShown: false,
  },
};

export { colors, screens };