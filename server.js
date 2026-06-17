require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Product, Booth, Order, Subscription, FranchiseEnquiry, User } = require('./models');
const { defaultProducts, defaultBooths } = require('./defaultData');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "sahil_dairy_corporate_secret_key";

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files from the current directory
app.use(express.static(path.join(__dirname)));

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Access token required" });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// State Variable to check database connectivity
let isDbConnected = false;

// Mock orders for seeding
const defaultOrders = [
  { id: "SAHIL-101", customer: { name: "Rajesh Kumar", phone: "9876543210", address: "Sector 3, Malviya Nagar" }, items: [{ productId: "milk-gold", name: "Sahil's Gold Premium Milk", price: 66, quantity: 2 }], pricing: { subtotal: 132, discount: 0, gst: 7, delivery: 30, total: 169 }, timeSlot: "6:00 AM - 7:30 AM", paymentMethod: "cod", status: "Delivered", progress: 100, step: 4, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: "SAHIL-102", customer: { name: "Anjali Sharma", phone: "9876543211", address: "Amrapali Marg, Vaishali Nagar" }, items: [{ productId: "pure-ghee", name: "Sahil's Pure Cow Ghee", price: 680, quantity: 1 }], pricing: { subtotal: 680, discount: 0, gst: 34, delivery: 0, total: 714 }, timeSlot: "7:30 AM - 9:00 AM", paymentMethod: "cod", status: "Out for Delivery", progress: 66, step: 3, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1) },
  { id: "SAHIL-103", customer: { name: "Vikram Singh", phone: "9876543212", address: "Vijay Path, Mansarovar" }, items: [{ productId: "premium-paneer", name: "Sahil's Fresh Premium Paneer", price: 90, quantity: 3 }], pricing: { subtotal: 270, discount: 0, gst: 14, delivery: 0, total: 284 }, timeSlot: "6:00 AM - 7:30 AM", paymentMethod: "cod", status: "Packed & Ready", progress: 33, step: 2, createdAt: new Date(Date.now() - 1000 * 60 * 10) },
  { id: "SAHIL-104", customer: { name: "Sahil Rawat", phone: "9876543213", address: "Subhash Marg, C-Scheme" }, items: [{ productId: "milk-toned", name: "Sahil's Toned Lite Milk", price: 27, quantity: 4 }], pricing: { subtotal: 108, discount: 0, gst: 5, delivery: 30, total: 143 }, timeSlot: "7:30 AM - 9:00 AM", paymentMethod: "cod", status: "Ordered", progress: 0, step: 1, createdAt: new Date(Date.now() - 1000 * 60 * 2) }
];

// In-Memory Storage Fallback (if MongoDB is not running)
const memoryDb = {
  products: [...defaultProducts],
  booths: [...defaultBooths],
  orders: {},
  subscriptions: [],
  franchises: [],
  users: {}
};

// Seed default orders into memoryDb
defaultOrders.forEach(o => {
  memoryDb.orders[o.id] = { ...o };
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sahil_dairy';
console.log(`Attempting to connect to MongoDB at: ${mongoURI}`);

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("Connected to MongoDB successfully!");
  isDbConnected = true;
  seedDatabase();
})
.catch((err) => {
  console.warn("\n==========================================================");
  console.warn("WARNING: Could not connect to MongoDB. Local MongoDB server might be offline.");
  console.warn("Falling back to a clean IN-MEMORY database storage.");
  console.warn("Everything in the application will work perfectly out-of-the-box!");
  console.warn("==========================================================\n");
  isDbConnected = false;
});

// Database Seeder
async function seedDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log("Seeding products in MongoDB...");
      await Product.insertMany(defaultProducts);
    }

    const boothCount = await Booth.countDocuments();
    if (boothCount === 0) {
      console.log("Seeding store booths in MongoDB...");
      await Booth.insertMany(defaultBooths);
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log("Seeding tracker mock orders in MongoDB...");
      await Order.insertMany(defaultOrders);
    }

    console.log("Database seeded / checked successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

// Live Status Progression Helper (Ordered -> Packed -> Out for Delivery -> Delivered)
function getOrderStatusDetails(order) {
  if (order.status === "Delivered") {
    return {
      status: order.status,
      progress: order.progress,
      step: order.step
    };
  }

  // Calculate difference in seconds
  const elapsedSeconds = (Date.now() - new Date(order.createdAt).getTime()) / 1000;

  // Real-time fast transition:
  // 0 - 30 seconds: Ordered (step 1)
  // 30 - 60 seconds: Packed & Ready (step 2)
  // 60 - 90 seconds: Out for Delivery (step 3)
  // > 90 seconds: Delivered (step 4)
  if (elapsedSeconds < 30) {
    return { status: "Ordered", progress: 0, step: 1 };
  } else if (elapsedSeconds < 60) {
    return { status: "Packed & Ready", progress: 33, step: 2 };
  } else if (elapsedSeconds < 90) {
    return { status: "Out for Delivery", progress: 66, step: 3 };
  } else {
    // Update order persistence
    order.status = "Delivered";
    order.progress = 100;
    order.step = 4;
    return { status: "Delivered", progress: 100, step: 4 };
  }
}

// --- API ROUTES ---

// --- AUTHENTICATION & PROFILE ENDPOINTS ---

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Missing required fields (name, email, password)" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    if (isDbConnected) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || "",
        address: address || "",
        loyaltyPoints: 150 
      });
      await newUser.save();
      
      const token = jwt.sign({ id: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: "Registration successful",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          loyaltyPoints: newUser.loyaltyPoints
        }
      });
    } else {
      // Memory DB fallback
      if (memoryDb.users[normalizedEmail]) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const mockId = `MOCK-USR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser = {
        id: mockId,
        name,
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || "",
        address: address || "",
        loyaltyPoints: 150
      };
      memoryDb.users[normalizedEmail] = newUser;
      
      const token = jwt.sign({ id: mockId, email: normalizedEmail }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({
        message: "Registration successful (Offline fallback)",
        token,
        user: {
          id: mockId,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          loyaltyPoints: newUser.loyaltyPoints
        }
      });
    }
  } catch (err) {
    console.error("Sign up error:", err);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing email or password" });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    
    let user = null;
    if (isDbConnected) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryDb.users[normalizedEmail];
    }
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const userId = isDbConnected ? user._id : user.id;
    const token = jwt.sign({ id: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    return res.json({
      message: "Login successful",
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        loyaltyPoints: user.loyaltyPoints
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Failed to sign in" });
  }
});

// Retrieve User Profile (Me) Route
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    let user = null;
    if (isDbConnected) {
      user = await User.findById(req.user.id);
    } else {
      user = memoryDb.users[req.user.email];
    }
    
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }
    
    return res.json({
      id: isDbConnected ? user._id : user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      loyaltyPoints: user.loyaltyPoints
    });
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ error: "Failed to retrieve user profile" });
  }
});

// Update Profile settings
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    if (isDbConnected) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { $set: { name, phone, address } },
        { new: true }
      );
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      
      return res.json({
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          loyaltyPoints: updatedUser.loyaltyPoints
        }
      });
    } else {
      const user = memoryDb.users[req.user.email];
      if (!user) return res.status(404).json({ error: "User not found" });
      
      user.name = name || user.name;
      user.phone = phone || user.phone;
      user.address = address || user.address;
      
      return res.json({
        message: "Profile updated successfully (Offline fallback)",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          loyaltyPoints: user.loyaltyPoints
        }
      });
    }
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// User Orders Route
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.json(orders);
    } else {
      const userOrders = Object.values(memoryDb.orders).filter(order => {
        return order.userEmail === req.user.email;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(userOrders);
    }
  } catch (err) {
    console.error("Fetch user orders error:", err);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// User Subscriptions Route
app.get('/api/user/subscriptions', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected) {
      const subscriptions = await Subscription.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.json(subscriptions);
    } else {
      const userSubs = memoryDb.subscriptions.filter(sub => {
        return sub.userEmail === req.user.email;
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(userSubs);
    }
  } catch (err) {
    console.error("Fetch user subscriptions error:", err);
    return res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

// 1. GET Products
app.get('/api/products', async (req, res) => {
  try {
    if (isDbConnected) {
      const products = await Product.find({});
      return res.json(products);
    } else {
      return res.json(memoryDb.products);
    }
  } catch (err) {
    console.error("Error fetching products:", err);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
});

// 2. GET Store Booths
app.get('/api/booths', async (req, res) => {
  try {
    if (isDbConnected) {
      const booths = await Booth.find({});
      return res.json(booths);
    } else {
      return res.json(memoryDb.booths);
    }
  } catch (err) {
    console.error("Error fetching booths:", err);
    return res.status(500).json({ error: "Failed to fetch booths" });
  }
});

// 3. POST Place Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, pricing, timeSlot, paymentMethod } = req.body;

    if (!customer || !items || !pricing || !timeSlot || !paymentMethod) {
      return res.status(400).json({ error: "Missing required order parameters" });
    }

    // Check if order is placed by an authenticated user
    let orderUserId = null;
    let orderUserEmail = "";

    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        orderUserId = decoded.id;
        orderUserEmail = decoded.email.toLowerCase().trim();
      } catch (jwtErr) {
        console.warn("Failed to decode token for order placement, proceeding anonymously.");
      }
    }

    // Generate Order ID
    const orderId = `SAHIL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderData = {
      id: orderId,
      userId: orderUserId,
      userEmail: orderUserEmail,
      customer,
      items,
      pricing,
      timeSlot,
      paymentMethod,
      status: "Ordered",
      progress: 0,
      step: 1,
      createdAt: new Date()
    };

    if (isDbConnected) {
      const dbOrder = new Order(newOrderData);
      await dbOrder.save();
      // Reward user with 20 points for shopping order
      if (orderUserId) {
        await User.findByIdAndUpdate(orderUserId, { $inc: { loyaltyPoints: 20 } });
      }
    } else {
      memoryDb.orders[orderId] = { ...newOrderData };
      // Fallback: Reward user in memoryDb
      if (orderUserEmail && memoryDb.users[orderUserEmail]) {
        memoryDb.users[orderUserEmail].loyaltyPoints += 20;
      }
    }

    console.log(`Order placed successfully: ${orderId} (User: ${orderUserEmail || 'Anonymous'})`);
    return res.status(201).json(newOrderData);
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// 4. GET Track Order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id.trim().toUpperCase();

    let order = null;
    if (isDbConnected) {
      order = await Order.findOne({ id: orderId });
    } else {
      order = memoryDb.orders[orderId];
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Process live status progression
    const progressDetails = getOrderStatusDetails(order);
    
    // Save updated status if progressed to Delivered
    if (progressDetails.status === "Delivered" && order.status !== "Delivered") {
      if (isDbConnected) {
        await Order.updateOne({ id: orderId }, { $set: { status: "Delivered", progress: 100, step: 4 } });
      } else {
        memoryDb.orders[orderId].status = "Delivered";
        memoryDb.orders[orderId].progress = 100;
        memoryDb.orders[orderId].step = 4;
      }
    }

    // Return order object with active live tracking progression values
    const responsePayload = {
      id: order.id,
      customer: order.customer,
      items: order.items,
      pricing: order.pricing,
      timeSlot: order.timeSlot,
      status: progressDetails.status,
      progress: progressDetails.progress,
      step: progressDetails.step,
      createdAt: order.createdAt
    };

    return res.json(responsePayload);
  } catch (err) {
    console.error("Error tracking order:", err);
    return res.status(500).json({ error: "Failed to retrieve order" });
  }
});

// 5. POST Create Subscription
app.post('/api/subscriptions', async (req, res) => {
  try {
    const { productId, productName, frequency, quantity, timeSlot, startDate } = req.body;

    if (!productId || !productName || !frequency || !quantity || !timeSlot || !startDate) {
      return res.status(400).json({ error: "Missing subscription parameters" });
    }

    // Check if subscription is placed by an authenticated user
    let subUserId = null;
    let subUserEmail = "";

    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        subUserId = decoded.id;
        subUserEmail = decoded.email.toLowerCase().trim();
      } catch (jwtErr) {
        console.warn("Failed to decode token for subscription placement, proceeding anonymously.");
      }
    }

    const subscriptionData = {
      userId: subUserId,
      userEmail: subUserEmail,
      productId,
      productName,
      frequency,
      quantity,
      timeSlot,
      startDate,
      createdAt: new Date()
    };

    if (isDbConnected) {
      const dbSub = new Subscription(subscriptionData);
      await dbSub.save();
      // Reward user with 50 points for subscription plan activation
      if (subUserId) {
        await User.findByIdAndUpdate(subUserId, { $inc: { loyaltyPoints: 50 } });
      }
    } else {
      memoryDb.subscriptions.push(subscriptionData);
      // Fallback: Reward user in memoryDb
      if (subUserEmail && memoryDb.users[subUserEmail]) {
        memoryDb.users[subUserEmail].loyaltyPoints += 50;
      }
    }

    console.log(`Subscription activated for product ${productId} (User: ${subUserEmail || 'Anonymous'})`);
    return res.status(201).json({ message: "Subscription activated", subscription: subscriptionData });
  } catch (err) {
    console.error("Error creating subscription:", err);
    return res.status(500).json({ error: "Failed to create subscription" });
  }
});

// 6. POST Franchise Enquiry
app.post('/api/franchises', async (req, res) => {
  try {
    const { name, email, phone, city, space } = req.body;

    if (!name || !email || !phone || !city || !space) {
      return res.status(400).json({ error: "Missing franchise parameter fields" });
    }

    const enquiryData = {
      name,
      email,
      phone,
      city,
      space: Number(space),
      createdAt: new Date()
    };

    if (isDbConnected) {
      const dbEnquiry = new FranchiseEnquiry(enquiryData);
      await dbEnquiry.save();
    } else {
      memoryDb.franchises.push(enquiryData);
    }

    console.log(`Franchise enquiry received from: ${name}`);
    return res.status(201).json({ message: "Franchise proposal received", proposal: enquiryData });
  } catch (err) {
    console.error("Error submitting franchise proposal:", err);
    return res.status(500).json({ error: "Failed to submit franchise proposal" });
  }
});

// Fallback Route: Serve index.html for undefined requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==========================================================`);
  console.log(`Sahil's Dairy Corporate Server listening on http://localhost:${PORT}`);
  console.log(`==========================================================\n`);
});