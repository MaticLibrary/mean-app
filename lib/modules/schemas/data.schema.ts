import { Schema, model } from 'mongoose';
import type { IData } from '../models/data.model';

export const DataSchema: Schema = new Schema({
   title: { type: String, required: true },
   text: { type: String, required: true },
   image: { type: String, required: true },
});

export default model<IData>('Post-RKK', DataSchema);
