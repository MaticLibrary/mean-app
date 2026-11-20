export interface IData {
   title: string;
   text: string;
   image: string;
}

export type IPost = IData;

export type Query<T> = {
   [key: string]: T;
};
