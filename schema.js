const Joi = require('joi');

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    price: Joi.number().required().min(0),
    // allow empty string or null when image not provided (your multer/cloud storage will handle actual upload)
    image: Joi.string().allow('', null),
    // lat/lng required for map functionality (will be parsed as numbers by controller)
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).required()
}).options({ convert: true });

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    Comment: Joi.string().required()
  }).required()
});
