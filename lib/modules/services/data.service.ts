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
}

export default DataService;
