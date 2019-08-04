const express = require('express');
const ImagesRouter = express.Router();
const bodyParser = express.json();
const ImagesServices = require('./ImagesServices');

ImagesRouter
  .route('/')
  .get((req, res) => {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: 'Missing category in request body' });
    }

    ImagesServices.getAllByCategory(req.app.get('db'), category)
      .then(images => {
        if (!images) {
          return res.status(400).json({ error: `No images for category ${category}` });
        }

        return res.status(200).json({ images });
      });
  })