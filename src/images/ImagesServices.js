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
      .where('images.category', category)
      .orderBy('id', 'desc');
  },
  insertImage(db, newImage) {
    return db
      .insert(newImage)
      .into('images')
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id));
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
  alterYear(db, id, newYear) {
    return db('images')
      .where('images.id', id)
      .update({
        year: newYear,
        thisKeyIsSkipped: undefined
      })
      .returning('*')
      .then(([ image ]) => image)
      .then(image => ImagesServices.getById(db, image.id))
  },
  deleteImage(db, id) {
    return db('images')
      .select('*')
      .where('id', id)
      .del()
      .returning('*');
  }
};

module.exports = ImagesServices;