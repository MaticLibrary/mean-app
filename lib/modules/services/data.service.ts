import type { IData, Query } from '../models/data.model';
import PostModel from '../schemas/data.schema';

class DataService {
   public async createPost(postParams: IData) {
       const dataModel = new PostModel(postParams);
       return dataModel.save();
   }

   public async query(query: Query<string | number | boolean>) {
       return PostModel.find(query, { __v: 0 });
   }

   public async getById(id: string) {
       return PostModel.findById(id, { __v: 0 });
   }

   public async deleteById(id: string) {
       return PostModel.deleteOne({ _id: id });
   }

   public async deleteAllPosts() {
       return PostModel.deleteMany({});
   }

   public async deleteData(query: Query<string | number | boolean>) {
       return PostModel.deleteMany(query);
   }

   public async updateById(id: string, postParams: Partial<IData>) {
      return await PostModel.findByIdAndUpdate(id, postParams, {
         new: true,
         runValidators: true
      }).select('-__v');
   }

   public async getPaginated(
       page: number,
       limit: number,
       sortField: string,
       sortOrder: 1 | -1
   ) {
       const [items, total] = await Promise.all([
          PostModel.find({}, { __v: 0 })
             .sort({ [sortField]: sortOrder })
             .skip((page - 1) * limit)
             .limit(limit),
          PostModel.countDocuments()
       ]);

       return {
          items,
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
       };
   }

   public async search(phrase: string) {
       const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const regex = new RegExp(escaped, 'i');

       return PostModel.find(
          { $or: [{ title: regex }, { text: regex }] },
          { __v: 0 }
       ).sort({ createdAt: -1 });
   }

   public async getStats() {
       const [stats] = await PostModel.aggregate([
          {
             $group: {
                _id: null,
                count: { $sum: 1 },
                oldest: { $min: '$createdAt' },
                newest: { $max: '$createdAt' }
             }
          }
       ]);

       return stats ?? { count: 0, oldest: null, newest: null };
   }
}
export default DataService;
