require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const products = await Product.find({});
    console.log(`Total Products in DB: ${products.length}`);
    
    const publicProducts = products.filter(p => p.affiliateLink && p.affiliateLink.trim() !== '');
    console.log(`Products with Affiliate Links (Visible to Public): ${publicProducts.length}`);
    
    if (publicProducts.length === 0) {
      console.log('NOTE: No products will appear on the Storefront because none of them have affiliateLinks.');
      // If there are products but no affiliate links, let's add a dummy link to the first one just so it shows up for testing
      if (products.length > 0) {
        products[0].affiliateLink = 'https://amazon.com/test';
        await products[0].save();
        console.log('Added a test affiliate link to the first product so it will show on the storefront!');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
