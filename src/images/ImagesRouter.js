const express = require('express');
const ImagesRouter = express.Router();
const bodyParser = express.json();
const ImagesServices = require('./ImagesServices');
const requireAuth = require('../middleware/jwt-auth');
const path = require('path');

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
  .post(requireAuth, bodyParser, (req, res, next) => {
    const { category, url, name, year } = req.body;
    const newImage = { category, url, name, year };

    for (const [key, value] of Object.entries(newImage)) {
      if (key !== 'year' && !value) {
        return res.status(400).json({ error: `Missing ${key} in request body` });
      }
    }

    ImagesServices.insertImage(req.app.get('db'), newImage)
      .then(image => {
        return res.status(201)
          .location(path.posix.join(req.originalUrl, `/${image.id}`))
          .json(image);
      })
      .catch(next);
  })
  .patch(requireAuth, (req, res, next) => {
    const { id, name, year } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing ID in request query' });
    }
    if (!name && !year) {
      return res.status(400).json({ error: 'Missing name and year in request query' });
    }

    let resImage = {};

    if (name) {
      ImagesServices.renameImage(req.app.get('db'), id, name)
        .then(image => {
          if (!image) {
            return res.status(400).json({ error: `Image with name ${name} and id ${id} does not exist` });
          }
  
          resImage = image;
        })
        .catch(next);
    }

    if (year) {
      ImagesServices.alterYear(req.app.get('db'), id, year)
        .then(image => {
          if (!image) {
            return res.status(400).json({ error: `Image with name ${name} and id ${id} does not exist` });
          }

          resImage = image;
        })
        .catch(next);
    }

    return res.status(200).json({ resImage });

  })
  .delete(requireAuth, (req, res, next) => {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Missing ID in request query' });
    }

    ImagesServices.deleteImage(req.app.get('db'), id)
      .then(imageId => {

        if (!imageId) {
          return res.status(400).json({ error: `Image with ID ${id} does not exist` });
        }

        return res.status(200).json({ id: imageId });
      })
      .catch(next);
  });

module.exports = ImagesRouter;