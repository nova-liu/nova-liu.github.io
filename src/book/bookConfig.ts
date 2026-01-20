export interface Book {
  id: string;
  coverImage: string;
  doubanUrl: string;
  title: string;
  author: string;
}

export const books: Book[] = [
  {
    id: "1",
    coverImage: "/book/fluent-python.jpg",
    doubanUrl: "https://book.douban.com/subject/27028517/",
    title: "Fluent Python",
    author: "Luciano Ramalho",
  },
  {
    id: "2",
    coverImage: "/book/python-advance.jpg",
    doubanUrl: "https://book.douban.com/subject/26932642/",
    title: "Python Cookbook",
    author: "David Beazley",
  },
  {
    id: "3",
    coverImage: "/book/tcp-ip.jpg",
    doubanUrl: "https://book.douban.com/subject/26825411/",
    title: "TCP/IP Illustrated",
    author: "W. Richard Stevens",
  },
  {
    id: "4",
    coverImage: "/book/learn-go.jpg",
    doubanUrl: "https://book.douban.com/subject/26832468/",
    title: "The Go Programming Language",
    author: "Alan A. A. Donovan",
  },
  {
    id: "5",
    coverImage: "/book/kubernetes-in-action.jpg",
    doubanUrl: "https://book.douban.com/subject/30418855/",
    title: "Kubernetes in Action",
    author: "Marko Luksa",
  },
  {
    id: "6",
    coverImage: "/book/bird.jpg",
    doubanUrl: "https://book.douban.com/subject/4889838/",
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
  },
  {
    id: "7",
    coverImage: "/book/operation-system.jpg",
    doubanUrl: "https://book.douban.com/subject/5333562/",
    title: "Modern Operating Systems",
    author: "Andrew S. Tanenbaum",
  },
  {
    id: "8",
    coverImage: "/book/mysql.jpg",
    doubanUrl: "https://book.douban.com/subject/23008813/",
    title: "High Performance MySQL",
    author: "Baron Schwartz",
  },
  {
    id: "9",
    coverImage: "/book/little-prince.jpg",
    doubanUrl: "https://book.douban.com/subject/1084336/",
    title: "The Little Prince",
    author: "Antoine de Saint-Exupéry",
  },
  {
    id: "10",
    coverImage: "/book/steve.jpg",
    doubanUrl: "https://book.douban.com/subject/25810506/",
    title: "Steve Jobs",
    author: "Walter Isaacson",
  },
  {
    id: "11",
    coverImage: "/book/wander.jpg",
    doubanUrl: "https://book.douban.com/subject/25882167/",
    title: "Wandering Earth",
    author: "Cixin Liu",
  },
  {
    id: "12",
    coverImage: "/book/you-dont-know-js-get-start.jpg",
    doubanUrl: "https://book.douban.com/subject/35374384/",
    title: "You Don't Know JS",
    author: "Kyle Simpson",
  },
  {
    id: "13",
    coverImage: "/book/ts-deep-dive.jpg",
    doubanUrl: "https://book.douban.com/subject/27124985/",
    title: "TypeScript Deep Dive",
    author: "Basarat Ali Syed",
  },
];
