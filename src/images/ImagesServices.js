const ImagesServices = {
  getAllByCategory(db, category) {
    return db('images')
      .select('*')
      .where('images.category', category);
  }
};

module.exports = ImagesServices;