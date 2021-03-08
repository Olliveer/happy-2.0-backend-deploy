import Image from "../models/Image";



export default {
  render(image: Image) {
    return {
      id: image.id,
      name: image.name,
      size: image.size,
      url: image.url,
      key: image.key,
      created_at: image.created_at
    };
  },

  renderMany(images: Image[]) {
    return images.map((image) => this.render(image));
  },
};
