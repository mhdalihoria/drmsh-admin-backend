import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true },
    img: { type: String, required: true },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
});

export default mongoose.model('Category', categorySchema);