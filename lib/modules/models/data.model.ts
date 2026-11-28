export interface IData {
   title: string;
   text: string;
   image: string;
   createdAt?: Date;
   updatedAt?: Date;

}

export type IPost = IData;

export type Query<T> = {
   [key: string]: T;
};
