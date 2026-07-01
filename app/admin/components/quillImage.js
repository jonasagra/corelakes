export default function registerQuillImage() {
  if (typeof window === 'undefined') return;

  import('react-quill').then(({ Quill }) => {
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
