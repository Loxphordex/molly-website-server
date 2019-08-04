const express = require('express');
const ImagesRouter = express.Router();
const bodyParser = express.json();
const ImagesServices = require('./ImagesServices');

ImagesRouter
  .route('/')
  .get((req, res) => {
    const { category } = req.query;

    if (!category) {
      return res.status(400).json({ error: 'Missing category in request query' });
    }

    ImagesServices.getAllByCategory(req.app.get('db'), category)
      .then(images => {
        if (!images) {
          return res.status(400).json({ error: `No images for category ${category}` });
        }

        return res.status(200).json({ images });
      });
  })
  .patch((req, res, next) => {
    console.log('REQ QUERY: ', req.query);
    const { id, name } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing ID in request body' });
    }
    if (!name) {
      return res.status(400).json({ error: 'Missing name in request body' });
    }

    ImagesServices.renameImage(req.app.get('db'), id, name)
      .then(image => {
        if (!image) {
          return res.status(400).json({ error: `Image with name ${name} and id ${id} does not exist` });
        }

        return res.status(200).json({ image });
      })
      .catch(next);
  });

module.exports = ImagesRouter;