/* Imagem customizada do Quill — guarda a `class` no modelo do editor.
 *
 * Por quê: o sanitizador do servidor (api/_lib/validate.js) só deixa passar
 * `class` em <img> (remove style e data-*). Então tamanho e alinhamento da
 * imagem são guardados como classes CSS (img-w-*, img-align-*). A imagem
 * padrão do Quill descarta a classe; aqui estendemos para preservá-la,
 * inclusive ao re-renderizar a partir do Delta. */
import { Quill } from 'react-quill';

const BaseImage = Quill.import('formats/image');

// Atributos que a imagem passa a entender (o original cobre alt/height/width).
const ATTRIBUTES = ['alt', 'height', 'width', 'class'];

export class CorelakesImage extends BaseImage {
  static formats(domNode) {
    return ATTRIBUTES.reduce((formats, attr) => {
      if (domNode.hasAttribute(attr)) formats[attr] = domNode.getAttribute(attr);
      return formats;
    }, {});
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) this.domNode.setAttribute(name, value);
      else this.domNode.removeAttribute(name);
    } else {
      super.format(name, value);
    }
  }
}

CorelakesImage.blotName = 'image';
CorelakesImage.tagName = 'IMG';

// `true` = substitui o formato de imagem padrão do Quill.
Quill.register(CorelakesImage, true);
