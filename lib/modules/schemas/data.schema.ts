import { Schema, model } from 'mongoose';
import type { IData } from '../models/data.model';

export const DataSchema: Schema = new Schema({
   title: {
      type: String,
      required: [true, 'Tytuł jest wymagany'],
      trim: true,
      unique: true,
      minlength: [3, 'Tytuł musi mieć co najmniej 3 znaki'],
      maxlength: [100, 'Tytuł może mieć maksymalnie 100 znaków']
   },
   text: {
      type: String,
      required: [true, 'Treść jest wymagana'],
      trim: true
   },
   image: {
      type: String,
      required: [true, 'Adres obrazu jest wymagany'],
      trim: true,
      match: [/^https?:\/\/.+/, 'Obraz musi mieć poprawny adres URL']
   }
}, { timestamps: true });


export default model<IData>('Post-RKK', DataSchema);
