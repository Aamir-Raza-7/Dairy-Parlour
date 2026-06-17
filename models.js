const mongoose = require('mongoose');

// Product Schema
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  volume: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  description: { type: String, default: "" },
  nutrition: {
    Energy: { type: String, default: "" },
    Protein: { type: String, default: "" },
    Fats: { type: String, default: "" },
    Calcium: { type: String, default: "" },
    Carbohydrates: { type: String, default: "" }
  },
  ingredients: { type: String, default: "" },
  shelfLife: { type: String, default: "" },
  storage: { type: String, default: "" },
  svgType: { type: String, default: "" }
});

// Booth Schema
const BoothSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  distance: { type: String, default: "" },
  timings: { type: String, default: "" },
  x: { type: Number, required: true },
  y: { type: Number, required: true }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. SAHIL-1001
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userEmail: { type: String, default: "" },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [
    {
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true }
    }
  ],
  pricing: {
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    delivery: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  timeSlot: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: "Ordered" }, // Ordered, Packed, Out for Delivery, Delivered
  progress: { type: Number, default: 0 }, // 0, 33, 66, 100
  step: { type: Number, default: 1 }, // 1, 2, 3, 4
  createdAt: { type: Date, default: Date.now }
});

// Subscription Schema
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  userEmail: { type: String, default: "" },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  frequency: { type: String, required: true },
  quantity: { type: Number, required: true },
  timeSlot: { type: String, required: true },
  startDate: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Franchise Enquiry Schema
const FranchiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  space: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User Schema for Authentication & Dashboard Profile
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  loyaltyPoints: { type: Number, default: 150 }, // 150 starter points
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);
const Booth = mongoose.model('Booth', BoothSchema);
const Order = mongoose.model('Order', OrderSchema);
const Subscription = mongoose.model('Subscription', SubscriptionSchema);
const FranchiseEnquiry = mongoose.model('FranchiseEnquiry', FranchiseSchema);
const User = mongoose.model('User', UserSchema);

module.exports = {
  Product,
  Booth,
  Order,
  Subscription,
  FranchiseEnquiry,
  User
};
