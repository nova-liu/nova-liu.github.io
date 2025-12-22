export interface BlogPost {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  path: string;
  tags?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "temporal",
    title: "Temporal: A Powerful Workflow Orchestration Engine",
    date: "2025-11-05",
    description:
      "Introduction to Temporal, a robust open-source workflow orchestration engine that simplifies building reliable and scalable applications",
    path: "/blogs/temporal/temporal.md",
    tags: ["Workflow", "Go", "Distributed Systems"],
  },
  {
    id: "golang-toolchain",
    title: "Understanding Go Toolchain",
    date: "2025-06-18",
    description:
      "Deep dive into what Go Toolchain is and why there are two different versions in go.mod",
    path: "/blogs/golang-toolchain/golang-toolchain.md",
    tags: ["Go", "Toolchain"],
  },
  {
    id: "golang-unit-test",
    title: "Golang Unit Testing",
    date: "2023-11-10",
    description: "Best practices for unit testing in Go programming language",
    path: "/blogs/golang-unit-test/golang-unit-test.md",
    tags: ["Go", "Testing"],
  },

  {
    id: "recursive-function",
    title: "递归函数",
    date: "2023-06-26",
    description: "深入理解递归函数的原理和应用",
    path: "/blogs/recursive-function/recursive-function.md",
    tags: ["算法", "递归"],
  },
  {
    id: "mongodb",
    title: "MongoDB 概览",
    date: "2023-03-17",
    description: "从开发者的角度介绍 MongoDB 中最重要的特性",
    path: "/blogs/mongodb/mongodb.md",
    tags: ["数据库", "MongoDB", "NoSQL"],
  },
  {
    id: "dns",
    title: "DNS 解析",
    date: "2022-09-19",
    description: "了解 DNS 域名解析的工作原理",
    path: "/blogs/dns/dns.md",
    tags: ["网络", "DNS"],
  },
  {
    id: "kubernetes-programming",
    title: "Kubernetes 编程",
    date: "2022-02-19",
    description: "Kubernetes 开发和编程指南",
    path: "/blogs/kubernetes-programming/kubernetes-programming.md",
    tags: ["Kubernetes", "云原生", "Go"],
  },
  {
    id: "grpc",
    title: "gRPC 入门指南",
    date: "2021-11-10",
    description: "入门 gRPC 的原理和使用方法",
    path: "/blogs/grpc/grpc.md",
    tags: ["RPC", "微服务", "后端"],
  },
  {
    id: "cyber-security",
    title: "网络安全",
    date: "2021-09-25",
    description: "网络安全基础知识和最佳实践",
    path: "/blogs/cyber-security/cyber-security.md",
    tags: ["安全", "网络"],
  },

  {
    id: "go-programming",
    title: "Go 语言编程",
    date: "2020-07-22",
    description: "Go 语言编程基础和进阶技巧",
    path: "/blogs/go-programming/go-programming.md",
    tags: ["Go", "编程语言"],
  },
  {
    id: "cpu-cache",
    title: "CPU 缓存",
    date: "2020-05-22",
    description: "理解 CPU 缓存的工作原理和性能优化",
    path: "/blogs/cpu-cache/cpu-cache.md",
    tags: ["计算机组成", "性能优化"],
  },
  {
    id: "alignment-data",
    title: "数据对齐",
    date: "2020-04-12",
    description: "数据对齐的原理和重要性",
    path: "/blogs/alignment-data/alignment-data.md",
    tags: ["计算机组成", "内存"],
  },
  {
    id: "network",
    title: "计算机网络",
    date: "2020-04-05",
    description: "计算机网络基础知识和协议详解",
    path: "/blogs/network/network.md",
    tags: ["网络", "TCP/IP"],
  },
  {
    id: "mysql0x3",
    title: "MySQL 深入解析（三）",
    date: "2020-03-02",
    description: "MySQL 索引和查询优化",
    path: "/blogs/mysql0x3/mysql0x3.md",
    tags: ["数据库", "MySQL", "索引"],
  },
  {
    id: "mysql0x2",
    title: "MySQL 深入解析（二）",
    date: "2020-02-25",
    description: "MySQL 事务和锁机制",
    path: "/blogs/mysql0x2/mysql0x2.md",
    tags: ["数据库", "MySQL", "事务"],
  },
  {
    id: "mysql0x1",
    title: "MySQL 深入解析（一）",
    date: "2020-02-23",
    description: "MySQL 架构和存储引擎",
    path: "/blogs/mysql0x1/mysql0x1.md",
    tags: ["数据库", "MySQL"],
  },
  {
    id: "mysql0x0",
    title: "MySQL 基础入门",
    date: "2020-02-19",
    description: "MySQL 数据库基础知识",
    path: "/blogs/mysql0x0/mysql0x0.md",
    tags: ["数据库", "MySQL"],
  },
  {
    id: "data-lab",
    title: "数据实验室",
    date: "2019-03-09",
    description: "数据结构和算法实验",
    path: "/blogs/data-lab/data-lab.md",
    tags: ["算法", "数据结构"],
  },
];

// 按年份和月份分组文章
export interface ArchiveGroup {
  year: number;
  months: {
    month: number;
    posts: BlogPost[];
  }[];
}

export function getArchiveGroups(): ArchiveGroup[] {
  const groups: Map<number, Map<number, BlogPost[]>> = new Map();

  blogPosts.forEach((post) => {
    const date = new Date(post.date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!groups.has(year)) {
      groups.set(year, new Map());
    }

    const yearGroup = groups.get(year)!;
    if (!yearGroup.has(month)) {
      yearGroup.set(month, []);
    }

    yearGroup.get(month)!.push(post);
  });

  const result: ArchiveGroup[] = [];
  const sortedYears = Array.from(groups.keys()).sort((a, b) => b - a);

  sortedYears.forEach((year) => {
    const monthsMap = groups.get(year)!;
    const sortedMonths = Array.from(monthsMap.keys()).sort((a, b) => b - a);

    result.push({
      year,
      months: sortedMonths.map((month) => ({
        month,
        posts: monthsMap
          .get(month)!
          .sort((a, b) => b.date.localeCompare(a.date)),
      })),
    });
  });

  return result;
}
