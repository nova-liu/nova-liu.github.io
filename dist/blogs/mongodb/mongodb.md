# MongoDB 概览

本文将从开发者的角度，介绍 mongoDB 中最重要的特性。

mongoDB 是一个以 JSON 为数据模型的文档数据库，上市公司 MongoDB Inc.开发，总部位于美国。善于横向扩展，并发度超过 mysql。

<div align="center">

<img src="/blogs/mongodb/about-mongo.jpg" height="50%" width="50%"></img>

</div>

**mongoDB 支持动态的变更字段，也就是说同一个集合不同行结构是可以不同的。同时也可以选择性的开启限制，我的数据结构必须保持一致。**

# 数据类型

MongoDB 在保留 JSON 基本的键值对特性的基础上，添加了其他一些数据类型，称之为 BSON。在不同的编程语言下这些类型的表示有些差异。

| 数据类型       | 描述                                                                                                                             | 示例                                                                                                                                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 文档类型       | MongoDB 的最基本的数据类型，每个文档是一个 JSON 格式的数据结构，可以包含不同的字段和值。                                         | {"name": "John", "age": 30}                                                                                                                                                                                                          |
| 数组类型       | MongoDB 支持在文档中存储数组类型的数据，可以是任意类型的数组，如字符串、数字、文档等。                                           | ["apple", "banana", "orange"]                                                                                                                                                                                                        |
| 数值类型       | MongoDB 支持 32 位和 64 位的有符号整数、无符号整数、浮点数和双精度浮点数等数值类型。                                             | 42                                                                                                                                                                                                                                   |
| 日期类型       | MongoDB 支持日期类型，可以精确到毫秒级别。                                                                                       | ISODate("2022-01-01T00:00:00Z")                                                                                                                                                                                                      |
| 布尔类型       | MongoDB 支持布尔类型，可以存储 true 或 false。                                                                                   | true                                                                                                                                                                                                                                 |
| ObjectID 类型  | MongoDB 使用 ObjectID 类型来唯一标识每个文档，它是一个 12 字节的 BSON 类型数据，包含时间戳、机器标识符、进程 ID 和计数器等信息。 | ObjectId("61c6d4a6c5898b54f2bcec2e")                                                                                                                                                                                                 |
| 二进制数据类型 | MongoDB 支持二进制数据类型，可以存储任意类型的二进制数据，如图片、音频、视频等。                                                 | BinData(0,"JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwvTGluZWFyaXplZCAxL0wgNzI4MTcvTyAzMTYvRSA5MjcvSCBbIDMwMDM5OSAxMTEyXQovQ29sdW1ucyA2IDAgUiAvUm9vdCAxIDAgUiAvVHlwZSAvSW1hZ2VCYXNlCj4+CnN0cmVhbQp4nK1ZS2zUQBhF7/zaQAyILDMh9M9Cg==") |
| 正则表达式类型 | MongoDB 支持正则表达式类型，可以进行模糊匹配。                                                                                   | /regex/i                                                                                                                                                                                                                             |
| 空值类型       | MongoDB 支持空值类型，可以存储 null 值。                                                                                         | null                                                                                                                                                                                                                                 |

# mongoDB 的聚合框架

**mongoDB 的聚合框架是一个计算框架，它可以坐拥在一个或几个集合上，对集合中的数据进行一系列运算转化成期望的格式。**

```shell
db.<collection>.aggregate([
  <stage>,
  <stage>
])

```

<div align="center">

<img src="/blogs/mongodb/mongo-aggregate.jpg" height="50%" width="50%"></img>

</div>

# 事务

## 一致性：怎么保证多个节点数据一致的？

writeConcern 参数决定一个写操作落在多少个节点上才算成功，可以设置为 0 ～ n 表示节点个数，或者 majority 表示大多数节点。发起写操作的程序会阻塞到写操作达到指定的节点数为止。

## 持久性： mongoDB 怎么保证数据不丢失的？

journal 参数定义写到什么程度才算成功，值为 true 时表示写到日志里才算成功，false 时表示写到内存就算成功，当为 true 时类似 mysql 的 redolog。

## 隔离性：mongoDB client 能读到什么状态的数据？

这一点类似于 mysql 中的隔离级别。 在 mongoDB 中用 readConcern 这个参数来设置，有以下可选值。

- available 读所有，不管是否提交了
- local 针对用当前分片的 available
- majority 大多数节点上提交完的，成功写入的
- linearizable 保证可以读到之前的写操作
- snapshot 读取最近快照中的数据，开启事务时可以做这样一个快照，保证整个过程不被其他事务干扰

### 主从模式下 mongoDB 怎么选择从哪个结点读数据的？

readPreference 参数决定使用哪一个节点来度，有以下几个值

- primary 从主节点读，好处是总能读到最新的
- primaryPreferred 优先选择主节点
- secondary 只选择从节点
- secondaryPreferred 优先选择从节点
- nearest 选择最近的节点，ping time 决定

客户端可以直接设置这个参数。

## 原子性：一串操作要么都成功要么都失败

默认情况下开始事务后，未提交的修改对其他事务是不可见的，同时开启快照后，当前事务看不到其他事务已经提交的修改，实现可重复读。

**mongoDB 中两个事务同时写一个文档时，其中一个会出现报错，一般需要重复执行解决，在 mysql 中则是会阻塞住其中一个事务等待另一个的提交。**

**MongoDB 的索引与数据文件完全分开，索引结点保存的是 document 的指针。**

# 索引

<div align="center">

<img src="/blogs/mongodb/b-tree.png" height="50%" width="50%"></img>

</div>

如图所示 mongoDB 的索引采用 b-tree，搜索效率是 logn， 并且所有节点都存储数据，也就是说每次搜索并不一定非要查到叶子结点，最佳情况第一个节点就直接返回数据。

基本上，MongoDB 中的索引与其他数据库系统中的索引类似。MongoDB 在集合级别定义索引，并支持在 MongoDB 集合中文档的任何字段或子字段上的索引。

**利用索引已经排序好的特点，我们可以对要排序的字段建立索引，从而规避排序。**

**MongoDB 的索引与数据文件完全分开，索引结点保存的是 document 的指针，而 mysql 的索引保存的是数据源本身。**

# 总结

- mongoDB 支持动态的变更字段，也就是说同一个集合不同行结构是可以不同的。同时也可以选择性的开启限制，我的数据结构必须保持一致。
- mongoDB 的聚合框架是一个计算框架，它可以坐拥在一个或几个集合上，对集合中的数据进行一系列运算转化成期望的格式。
- writeConcern 参数决定一个写操作落在多少个节点上才算成功，可以设置为 0 ～ n 表示节点个数，或者 majority 表示大多数节点。
- journal 参数定义写到什么程度才算成功，值为 true 时表示写到日志里才算成功，false 时表示写到内存就算成功，当为 true 时类似 mysql 的 redolog。
- 在 mongoDB 中用 readConcern 这个参数来设置我可以读到什么状态的数据
- 默认情况下开始事务后，未提交的修改对其他事务是不可见的，同时开启快照后，当前事务看不到其他事务已经提交的修改，实现可重复读。
- mongoDB 中两个事务同时写一个文档时，其中一个会出现报错，一般需要重复执行解决，在 mysql 中则是会阻塞住其中一个事务等待另一个的提交。
- mongoDB 采用 b-树这个结构作为索引模型，每个节点都会存储数据，也就是说每次搜索并不一定非要查到叶子结点，最佳情况第一个节点就直接返回数据。
- mongoDB 同样使用联合索引来做覆盖索引，减少回表。
- 利用索引已经排序好的特点，我们可以对要排序的字段建立索引，从而规避排序。
- MongoDB 的索引与数据文件完全分开，索引结点保存的是 document 的指针，而 mysql 的索引保存的是数据源本身。
