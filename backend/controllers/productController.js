const Product = require('../models/Product');

// @desc    Get all products with search & category filter
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
      // Check if search is a valid Mongo ObjectId
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const { name, price, stockQuantity, minStockThreshold, category, sku } = req.body;

    if (!name || price === undefined || stockQuantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and stock quantity are required' });
    }

    const product = await Product.create({
      name,
      price: Number(price),
      stockQuantity: Number(stockQuantity),
      minStockThreshold: minStockThreshold !== undefined ? Number(minStockThreshold) : 5,
      category: category || 'General',
      sku: sku || `SKU-${Date.now().toString().slice(-6)}`
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    const { name, price, stockQuantity, minStockThreshold, category, sku } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    if (price !== undefined) product.price = Number(price);
    if (stockQuantity !== undefined) product.stockQuantity = Number(stockQuantity);
    if (minStockThreshold !== undefined) product.minStockThreshold = Number(minStockThreshold);
    if (category) product.category = category;
    if (sku) product.sku = sku;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
