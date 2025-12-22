export interface Book {
  id: string;
  coverImage: string;
  doubanUrl: string;
}

export const books: Book[] = [
  {
    id: "1",
    coverImage: "/book/fluent-python.jpg",
    doubanUrl: "https://book.douban.com/subject/27028517/",
  },
  {
    id: "2",
    coverImage: "/book/python-advance.jpg",
    doubanUrl: "https://book.douban.com/subject/26932642/",
  },
  {
    id: "3",
    coverImage: "/book/tcp-ip.jpg",
    doubanUrl: "https://book.douban.com/subject/26825411/",
  },
  {
    id: "4",
    coverImage: "/book/learn-go.jpg",
    doubanUrl: "https://book.douban.com/subject/26832468/",
  },
  {
    id: "5",
    coverImage: "/book/kubernetes-in-action.jpg",
    doubanUrl: "https://book.douban.com/subject/30418855/",
  },
  {
    id: "5",
    coverImage: "/book/bird.jpg",
    doubanUrl: "https://book.douban.com/subject/4889838/",
  },
  {
    id: "6",
    coverImage: "/book/operation-system.jpg",
    doubanUrl: "https://book.douban.com/subject/5333562/",
  },
  {
    id: "7",
    coverImage: "/book/mysql.jpg",
    doubanUrl: "https://book.douban.com/subject/23008813/",
  },
];
