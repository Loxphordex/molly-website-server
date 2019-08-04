const ImagesServices = {
  getById(db, id) {
    return db('images')
      .select('*')
      .where('images.id', id)
      .first();
  },
  getAllByCategory(db, category) {
    return db('images')
      .select('*')
      .where('images.category', category);
  },
  renameImage(db, id, newName) {
    return db('images')
      .where('images.id', id)
      .update({
        name: newName,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
  },
};

module.exports = ImagesServices;