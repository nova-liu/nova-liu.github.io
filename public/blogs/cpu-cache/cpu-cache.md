# cpu-cache的结构

现代cpu通常有l1、l2、l3级别的缓存。这些设备使用了SRAM这种存储技术，相比主存使用的DRAM，SRAM的读写速度都要快得多。所以把主存的数据缓存到cpu-cache中，
让cpu尽量的去读写cpu-cache去完成整个程序，会大幅度提升执行效率。

一个完整的高速缓存结构，通常分成多个缓存组，每一组包含多个缓存行，每个缓存行包含1字节的有效位，这表示这个缓存行是否有效，t个字节的标记位，用来表示缓存了哪些内存地址的数据，
剩下的字节用来缓存内存中的数据。

<div align="center">

<img src="/blogs/cpu-cache/cpu-cache.png" height="50%" width="50%"></img>

> 高速缓存

</div>

一个内存地址被解读成3个部分标记、组索引、块偏移。通过这三部分的值，**要么能够在高速缓存中找到一个字节的数据，此时就是缓存命中，要么找不到，此时就是缓存补命中**

**cpu-cache缓存主存中的数据，并不是一次缓存一个字节，大部分情况下是一次缓存多个字节的**

整个过程分为3步

1. 组选择
2. 行匹配
3. 字抽取

组选择和行匹配就是由上面提到的组索引和标记这两个值完成的。关键是字抽取的时候**计算块偏移后的值w作为第一个字节，w+1会作为第二个字节，一直填满这一行**

**简单来说，cpu总会把从主存读到的字节，以及这个字节后面紧挨着的n个字节一起缓存到cpu-cache**

# 什么是局部性？

一个编写良好的计算机程序通常有好的局部性。也就是，他倾向于引用邻近于其他最近引用过的数据，或者最近引用过的数据本身。

局部性通常有两种不同的形势

- 空间局部性

  一个具有良好空间局部性的程序，如果一个内存位置被引用了一次，那么很可能马上会引用这个位置附近的一个内存位置。

- 时间局部性

  一个具有良好时间局部性的程序，被引用过一次的内存位置，很可能马上再次被引用。

## go程序的例子

```go
package locality

import (
	"testing"
)

const ArrayLength = 5000

type ArrayV [ArrayLength][ArrayLength]int64

func SumArrayRows(array ArrayV) {
	for i := 0; i < ArrayLength; i++ {
		for j := 0; j < ArrayLength; j++ {
			array[i][j] += 1
		}
	}
	return
}

func SumArrayCols(array ArrayV) {
	for i := 0; i < ArrayLength; i++ {
		for j := 0; j < ArrayLength; j++ {
			array[j][i] += 1
		}
	}
	return
}

func BenchmarkSumArrayRows(b *testing.B) {
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		SumArrayRows(ArrayV{})
	}
}

func BenchmarkSumArrayCols(b *testing.B) {
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		SumArrayCols(ArrayV{})
	}
}

```

性能测试结果如下

```shell
goos: darwin
goarch: arm64
pkg: demo/locality
BenchmarkSumArrayRows
BenchmarkSumArrayRows-8               70          16062236 ns/op
BenchmarkSumArrayCols
BenchmarkSumArrayCols-8               16          68836344 ns/op
PASS
ok      demo/locality   4.214s
```

在这个例子中程序分别对一个5000\*5000的二维数组中每一个值进行+1操作，唯一的区别是SumArrayRows操作的顺序是

array[0][0]+=1,array[0][1]+=1...array[5000][5000]+=1

SumArrayCols操作的顺序是

array[0][0]+=1,array[1][0]+=1...array[5000][5000]+=1

**array[0][0]和array[0][1]在内存中是连续的，array[0][0]和array[1][0]在内存中，间隔着4999个int64**

所以前者有更好的空间局部性，这些符合我们刚才对cpu-cache习惯的分析。这就是前者性能远高于后者的原因。

同时+=操作最终会编译成cpu的指令，cpu需要从内存中读取这些指令。for循环体里的指令在内存中是连续执行的，因此具有良好的空间局部性。因为循环体被执行多次，
所以有良好的时间局部性。

# 总结

从cpu-cache出发，我们可以总结出以下写代码的好习惯

- 重复引用相同的变量的程序具有良好的时间局部性
- 引用内存中连续的字节的程序具有良好的空间局部性
- 对于取指令，循环具有良好的时间和空间局部性，循环体越小越好
