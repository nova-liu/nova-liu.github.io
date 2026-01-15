# golang中的数据对齐

许多计算机系统对基本数据类型的合法地址做出了一些限制，要求某种类型对象的地址必须是某个值的K(通常是2、4、8)的倍数。这种对齐限制简化了形成处理器和内存系统之间接口的硬件设计。
假设处理器总是从内存读取8字节，某数据的地址对齐8的倍数，可以总是一个内存操作就读或写该数据。否则，可能执行两次内存访问，因为对象可能被分放在两个8字节内存块中。

go语言中数据对齐需要同时满足两个条件

- 成员对齐

  基础类型变量x的起始地址需要是unsafe.AlignOf(x)的倍数

- 整体对齐

  结构体类型变量s，整体内存占用需要是unsafe.AlignOf(s)的倍数

# 写代码时需要注意什么？

通过一段golang程序来展示一下内存对齐时的内存占用

```go
package main

import (
	"fmt"
	"unsafe"
)

type ints struct {
	i1 int32
	i2 int8
	i3 int32
	i4 int8
	i5 [10]int8
}

func main() {
	i := ints{}
	fmt.Printf("Alignof:%T, %d\n", i, unsafe.Alignof(i))
	fmt.Printf("Sizeof:%T, %d\n", i, unsafe.Sizeof(i))
	fmt.Printf("i1-Offsetof: %d, i1-Alignof: %d\n", unsafe.Offsetof(i.i1), unsafe.Alignof(i.i1))
	fmt.Printf("i2-Offsetof: %d, i2-Alignof: %d\n", unsafe.Offsetof(i.i2), unsafe.Alignof(i.i2))
	fmt.Printf("i3-Offsetof: %d, i3-Alignof: %d\n", unsafe.Offsetof(i.i3), unsafe.Alignof(i.i3))
	fmt.Printf("i4-Offsetof: %d, i4-Alignof: %d\n", unsafe.Offsetof(i.i4), unsafe.Alignof(i.i4))
	fmt.Printf("i5-Offsetof: %d, i5-Alignof: %d\n", unsafe.Offsetof(i.i5), unsafe.Alignof(i.i5))
}
```

执行该程序会输出

```shell
Alignof:main.ints, 4
Sizeof:main.ints, 24
i1-Offsetof: 0, i1-Alignof: 4
i2-Offsetof: 4, i2-Alignof: 1
i3-Offsetof: 8, i3-Alignof: 4
i4-Offsetof: 12, i4-Alignof: 1
i5-Offsetof: 13, i5-Alignof: 1
```

这表示一个ints结构体占用了24个字节。i2本应该只占1字节，为了使i3满足与4对齐，需要在i2后面用3个字节占位。对于最后的int8数组，我们可以把它看成内存中一串连续的
int8，所以需要和1字节对齐，任意起始地址都满足对齐1。i5本身占用10个字节，最后还需要补1字节使整体占用24字节以满足整体对齐规则。

# golang中怎么节约结构体内存？

通过上面的例子，可以猜到，节约内存就是减少占位的情况，还是刚才那个例子，如果我们把int32类型提前

```go
type ints struct {
	i1 int32
	i2 int32
	i3 int8
	i4 int8
	i5 [10]int8
}
```

这样的话就能避免了i2的补位，节约3个字节。同时自然满足了整体对齐，不需要再额外补一位，一共只需要20字节。

**在结构体中，把内存占用大的数据类型放在前面，总是一个不错的选择**

# 特殊的空结构体

```go
type ints struct {
	i1 int8
	s1 struct{}
}
```

对于这个结构体，我们期望的是i1占1字节，s1占0字节，整体占1字节，并且满足了上面提到的数据对齐规则。但是实际上他占用了2字节。

对于这个问题，在[github](https://github.com/golang/go/issues/38194)上有人给出了回答。

总结来说是为了s1是一个合法地址，所以给他分配了内存，不至于访问s1的时候超出了该结构体的地址范围，所以我们**最好避免把空结构体放在最后**

# 总结

- 内存对齐是为了让cpu能够只需一次内存访问就读取或写入目标数据
- 对于go程序，在结构体中，把内存占用大的数据类型放在前面，总是一个不错的选择
- 对于go程序，最好避免把空结构体放在最后
