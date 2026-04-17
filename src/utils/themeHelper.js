import { THEMES } from '../data/themes.js';

export function applyThemeToElement(element, themeId) {
  const theme = THEMES[themeId] || THEMES.light;
  const overrides = element._overrides || [];

  const newProps = { ...element.props };

  // Keys that represent backgrounds
  if (!overrides.includes('backgroundColor')) {
    newProps.backgroundColor = theme.elementBackground;
  }

  // Keys that represent text colors
  if (!overrides.includes('textColor')) {
    newProps.textColor = theme.textColor;
  }

  // Keys that represent primary buttons/tags
  if (!overrides.includes('buttonColor')) {
    newProps.buttonColor = theme.primaryColor;
  }

  // Specific fallbacks for buttons where the background is the primary color
  if (element.type.startsWith('button-')) {
    if (!overrides.includes('backgroundColor') && element.type !== 'button-outline') {
      newProps.backgroundColor = theme.primaryColor;
    }
  }

  return { ...element, props: newProps };
}
