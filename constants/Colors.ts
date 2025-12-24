// Cores principais
export const PRIMARY_GREEN = '#11CF6A';
export const SECONDARY_GREEN = '#278e50';
export const NAVY_BLUE = '#2D3C52';

// Greyscale
export const GRAY_LIGHT = '#EAEAEA';
export const GRAY_VERY_LIGHT = '#E6E7EC';
export const GRAY_MEDIUM = '#7C7D82';
export const GRAY_DARK = '#292A2E';
export const WHITE = '#FFFFFF';
export const BLACK = '#000000';

const tintColorLight = PRIMARY_GREEN;
const tintColorDark = PRIMARY_GREEN;

export const Colors = {
  light: {
    text: GRAY_DARK,
    background: WHITE,
    tint: tintColorLight,
    icon: GRAY_MEDIUM,
    tabIconDefault: GRAY_MEDIUM,
    tabIconSelected: PRIMARY_GREEN,
    primary: PRIMARY_GREEN,
    secondary: SECONDARY_GREEN,
    accent: NAVY_BLUE,
    textSecondary: GRAY_MEDIUM,
    border: GRAY_LIGHT,
    backgroundSecondary: GRAY_VERY_LIGHT,
  },
  dark: {
    text: WHITE,
    background: GRAY_DARK,
    tint: tintColorDark,
    icon: GRAY_LIGHT,
    tabIconDefault: GRAY_LIGHT,
    tabIconSelected: PRIMARY_GREEN,
    primary: PRIMARY_GREEN,
    secondary: SECONDARY_GREEN,
    accent: NAVY_BLUE,
    textSecondary: GRAY_MEDIUM,
    border: GRAY_MEDIUM,
    backgroundSecondary: NAVY_BLUE,
  },
};
