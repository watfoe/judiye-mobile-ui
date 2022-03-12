import {fonts as watfoeFonts} from '../watfoe/fonts';

const {regular, bold} = watfoeFonts;

const fonts: Judiye.Theme.Fonts = {
  regularFontFamily: regular.family,
  regularFontWeight: regular.weight,

  boldFontFamily: bold.family,
  boldFontWeight: bold.weight,

  defaultSize: 14,
  inputErrorSize: 11,
  inputLabelSize: 12,

  lineHeight: 16,
};

export default fonts;