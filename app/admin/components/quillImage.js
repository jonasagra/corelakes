export default function registerQuillImage() {
  if (typeof window === 'undefined') return;

  // react-quill-new expõe o Quill como propriedade estática do componente
  // (mod.default.Quill); algumas versões também exportam nomeado (mod.Quill).
  import('react-quill-new').then((mod) => {
    const Quill = mod.Quill ?? mod.default?.Quill;
    if (!Quill) return;

    const BaseImage = Quill.import('formats/image');
    const ATTRIBUTES = ['alt', 'height', 'width', 'class'];

    class CorelakesImage extends BaseImage {
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
    Quill.register(CorelakesImage, true);
  });
}
