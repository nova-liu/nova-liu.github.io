# golang programming tips.

# Slice

go语言中的slice并不是数组，而是一个结构体。

```go
type slice struct {
	array unsafe.Pointer
	len   int
	cap   int
}
```

从这个结构上看，它包含一个指向底层数组的指针，和两个int来表明长度和容量。所以**len(slice),cap(slice)都是从结构体中直接读结果，而不需要遍历数组。**

## 初始化

```go
sliceOne := make([]int,10,20)
sliceTwo := []int{}
var sliceThree []int

array:= [5]int{1,2,3,4,5}
sliceFour := array[1:4]
```

初始化一个slice有这四种方式，第一种方式使用内置的make函数，三个参数依次为类型、长度、容量，容量的默认值是和长度相同。
第二种使用字面量的方式会得到一个空切片，长度和容量都是0。第三种实际上只是声明了一个slice类型变量，不需要分配内存，变量值为零值nil。**所以应该使用零值切片而不是空切片，可以节约内存。**

最后一种是从一个数组中切取，需要注意的是这种方式生成的切片是和源数组共享一部分数据的。在这个例子里sliceFour将于array共享array中第二到最后一个元素。

```go
	array := [5]int{1, 2, 3, 4, 5}
	sliceFour := array[1:4]
	sliceFour[0] = 99
	sliceFour = append(sliceFour, 88)
	println(array[1]) //99
	println(array[4]) //88
```

## 扩容

当slice的长度等于容量时，再添加元素会触发扩容，每次扩容都是创建一个容量更大的新切片，再把旧切片的元素复制进去。

- 当容量小于1024，每次扩容到原来的2倍。
- 当容量大雨1024，每次扩容到原来的1.25倍。

所以**根据实际业务提前初始化好slice的容量，可以减少扩容带来的性能损耗。**

## 扩展表达式

在上面sliceFour的例子中，值切取了下标为1，2，3的三个元素。但是实际上下标为4的元素也被共享了。

```go
	array := [5]int{1, 2, 3, 4, 5}
	sliceFour := array[1:4:4]
	sliceFour[0] = 99
	sliceFour = append(sliceFour, 88)
	println(array[1]) //99
	println(array[4]) //5
```

扩展表达式array[start: end: max]限制了容量，避免了共享不必要的元素。

# String

**len(String)表示的是字符串的字节数，而不是字符数。**

对字符串进行拼接时，可以采取以下方法。

```go
stringOne := "a"
stringTwo := "b"

stringThree := stringOne + stringTwo //1

stringThree = fmt.Sprintf("%s%s", stringOne, stringTwo) //2

sb := strings.Builder{} //3
sb.WriteString(stringOne)
sb.WriteString(stringTwo)
stringThree = sb.String()

bb := bytes.Buffer{}  //4
bb.WriteString(stringOne)
bb.WriteString(stringTwo)
stringThree = bb.String()
```

前两种都是字符串的直接拼接，会触发内存的分配与拷贝，如果大量拼接的话性能会很差。

strings.Builder和bytes.Buffer内部都有一个[]byte缓存区，它的扩容就是slice的扩容，大量拼写时内存分配次数会比直接拼接少得多。

理论上string与[]byte互相转换会触发内存拷贝，性能并不是很好。但是编译器优化了 []byte向string的转换，可以避免内存拷贝。

# for-range

for-range用于遍历集合元素，包括array、slice、string、map、channel。

```go
//bad
func FindMonkey(s []string) bool{
    for _, v:= range s{
        if v == "Monkey" {
            return true
        }
    }
    return false
}
//good
func FindMonkey(s []string) bool{
    for i := range s{
        if s[i] == "Monkey" {
            return true
        }
    }
    return false
}
```

遍历集合时，获得的每一个元素是元素的副本，获得String的副本需要拷贝一次。性能上不如使用切片下标。

# goroutine

Golang 的协程调度包含以下三个实体

- G 代表 goroutine，即用户用go关键字创建的。
- P 代表 Logical Processor，是类似于 CPU 核心的概念，M要想执行一个协程必须获得P。
- M 是操作系统线程，由操作系统调度。
<div align="center">

<img src="/blogs/go-programming/mpg.png" height="20%" width="20%"></img>

</div>

```go
runtime.GOMAXPROCS()
```

这个函数可以设置P的数量，他保证了最多有几个线程在同时工作。P默认会被设置为cpu的逻辑核心数，可以充分利用cpu的计算能力。当goroutine进入系统调用的时候，当前M会被阻塞，新的M会被操作系统创建出来，**如果此时有空闲的P会快速的接管新的M，所以IO密集型的程序，P的数量可以略大于逻辑核数。**

在容器中，runtime.GOMAXPROCS()获取的是宿主机的CPU核心数，但是容器可能被限制了只能使用少量的，此时P设置过高，导致CPU上下文切换过多。可以用以下代码解决。

```go
import _ "go.uber.org/automaxprocs"

func main() {
  // Your application logic here
}
```

# 内存管理

go程序启动时会向操作系统申请一大块内存，每个P用其中一部分。内存回收的时候也不是理解还给操作系统，而是换个go自己维护的
这一大块内存。

一般我们期望局部变量，函数入参，返回值都分配到栈空间上，这样不需要gc，就会回收。但是局部变量超出了栈空间的大小，就只能分配到堆上了，另外接口类型的参数由于无法确定类型，所以也会分配到堆上，这种情况称为内存逃逸。内存逃逸会增加GC的压力。

除了内存逃逸，重用对象也能减少对内存分配。

```go
var studentPool = sync.Pool{
    New: func() interface{} {
        return new(Student)
    },
}
std := studentPool.Get().(*Student)

studentPool.Put(std)
```

# 并发

go语言中有3种方式控制并发，分别是Channel、WaitGroup、Context。

## Channel

```go
package main

import (
	"fmt"
	"time"
)

func Process(ch chan struct{}) {
	time.Sleep(time.Second)
	ch <- struct{}{}
}
func main() {
	channels := make([]chan struct{}, 10)
	for i := 0; i < 10; i++ {
		channels[i] = make(chan struct{})
		go Process(channels[i])
	}
	for index := range channels {
		<-channels[index]
		fmt.Println("Routine ", index, "quit!")
	}
}
```

每个子协程有一条channel去通知父协程，实现简单。但是对于子协程再创建子协程的情况不好控制。

## WaitGroup

**用WaitGroup可以方便的等待一组goroutine运行结束，但是一定要清晰的知道goroutine的数量。**

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var wg sync.WaitGroup
	wg.Add(2)
	go func() {
		time.Sleep(time.Second)
		wg.Done()
	}()
	go func() {
		time.Sleep(time.Second)
		wg.Done()
	}()
	wg.Wait()
	fmt.Println("All Goroutine finished!")
}
```

## Context

**对于嵌套子协程的情况，Context可以更好的控制。**

### cancelCtx

**用cancelCtx可以方便的实现父协程去主动通知子协程该结束了。**

```go
func ProcessOne(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("ProcessOne Done!")
			return
		default:
			time.Sleep(time.Second)
			fmt.Println("ProcessOne Running!")
		}
	}
}

func main() {
	ctx, cancel := context.WithCancel(context.Background())
	go ProcessOne(ctx)
	time.Sleep(time.Second * 5)
	cancel()
	time.Sleep(time.Second)
}
```

### timerCtx

**timerCtx在cancelCtx的基础上增加了指定结束时间。context.WithTimeout指定存活时间，context.WithDeadline指定最后期限。**

```go
package main

import (
	"fmt"
	"golang.org/x/net/context"
	"time"
)

func ProcessOne(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("ProcessOne Done!")
			return
		default:
			time.Sleep(time.Second)
			fmt.Println("ProcessOne Running!")
		}
	}
}

func main() {
	ctx, _ := context.WithTimeout(context.Background(), time.Second*3)
	go ProcessOne(ctx)
	time.Sleep(time.Second * 5)
}
```

### valueCtx

**valueCtx只用于在携程间传递数据，无法通过ctx.Done()通知子协程去结束，如果这个需求需要配合timerCtx或者cancelCtx。**

```go
package main

import (
	"fmt"
	"golang.org/x/net/context"
	"time"
)

func ProcessOne(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			fmt.Println("ProcessOne Done!")
			return
		default:
			time.Sleep(time.Second)
			fmt.Println("ProcessOne Running!", ctx.Value("key"))
		}
	}
}

func main() {
	ctx := context.WithValue(context.Background(), "key", "value")
	go ProcessOne(ctx)
	time.Sleep(time.Second * 2)
}
```

## 锁与原子操作

加锁是控制并发访问的主要手段，go语言提供了互斥锁和读写锁，互斥锁智能用于排他，读写锁可以共享也可以排他。

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

func main() {
	var num = 0
	var mu sync.Mutex
	for i := 0; i < 100000; i++ {
		go func(i int) {
			mu.Lock()
			defer mu.Unlock()
			num++
			fmt.Println(num)
		}(i)
	}
	time.Sleep(time.Second)
}
```

> 通过互斥锁来保证同一时刻只有一个协程在执行 num++ 和 fmt.Println(num)。

对于特定的情况，我们可以使用原子操作来代替锁，也可以保证同一时刻只有一条协程在执行特定的操作。这种情况是cpu级别支持的原子操作。

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var wg sync.WaitGroup
	var num int32
	wg.Add(100000)
	for i := 0; i < 100000; i++ {
		go func(i int) {
			atomic.AddInt32(&num, 1)
			wg.Done()
		}(i)
	}
	wg.Wait()
	fmt.Println(num)
}
```

> 使用原子操作在不同协程累加。

go语言中原子操作有五种分别是加法（add）、比较并交换（compare and swap，简称 CAS）、加载（load）、存储（store）和交换（swap）。

# pipeline

**利用channel实现一个pipeline， 这种方法可以很容易的把代码安单一职责原则进行拆分。**

用一串只能接收数据的channel把函数串起来。

```go
package main

import "fmt"

func echo(numbers []int) <-chan int {
	out := make(chan int)
	go func() {
		for index := range numbers {
			out <- numbers[index]
		}
		close(out)
	}()
	return out
}

func sq(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n * n
		}
		close(out)
	}()
	return out
}

func addOne(in <-chan int) <-chan int {
	out := make(chan int)
	go func() {
		for n := range in {
			out <- n + 1
		}
		close(out)
	}()
	return out
}

func main() {
	for out := range addOne(sq(echo([]int{1, 2, 3}))) {
		fmt.Println(out)
	}
}

```

# 错误处理

golang对错误的设计非常简洁，本质上就是一个返回值。**当你调用一个函数后，你必须先判断error，如果error不为nil，那么你一定不应该再使用你的value。如果即使检测到了error还要继续使用value，这种代码设计应视为一种缺陷或者说妥协。**

## 野生goroutine

```golang
go func(){
    doSomething()
}
```

这么写的代码，你是无法捕捉到内部的panic的，如果你以为这里做了兜底处理就是万事大吉了，那么迟早会有重大的事故等待着你。**不管是从异常处理，还是goroutine泄露的角度出发，我们都不应该使用野生的goroutine。比较好的做法是构建一个goroutine池，从任务队列里捞取任务去处理，想要开启异步任务的地方把任务丢到队列里就好了。**这样可以在goroutine池里统一的做异常处理，从安全的角度说也锁死了goroutine的总数。

## 错误只处理一次

在大型的项目当中，通常都是分成很多层的，比如数据操作层，业务处理层。比如当我们在数据操作层发生了一个异常后，把异常记录到日志里，并抛给了业务处理层，业务处理层捕捉到这个错误，也记录到了日志里，直到最后你会发现，同一个错误日志打的导出都是。所以**要么在当前函数处理这个错误，要么不管直接抛给上层，打印错误也算处理错误。**

## 包装错误

**在错误当前层添加一些上下文，然后抛给上层，最终在顶层只打印一次**，是比较优雅的方式。

```golang
_, err := ioutil.ReadAll(r)
if err != nil {
    return errors.Wrap(err, "read failed")
}
type causer interface {
    Cause() error
}

switch err := errors.Cause(err).(type) {
case *MyError:
// handle specifically
default:
// unknown error
}

```

# 总结

- 数据
  - 使用零值切片而不是空切片，可以节约内存。
  - 根据实际业务提前初始化好slice的容量，可以减少扩容带来的性能损耗。
  - 使用扩展表达式array[start: end: max]，只截取需要的容量，避免不必要的内存共享。
  - 字符串拼接很多的话，一定要使用strings.Builder或bytes.Buffer，相比于+=性能会提升1000倍以上。
  - 尽量避免String转换成[]byte，因为会把整个String的内存复制一遍。
- 控制
  - for-range遍历集合时，忽略元素值，用下标取值可以避免元素拷贝。
- 并发
  - 不管是从异常处理，还是goroutine泄露的角度出发，我们都不应该使用野生的goroutine。比较好的做法是构建一个goroutine池，从任务队列里捞取任务去处理，想要开启异步任务的地方把任务丢到队列里就好了。
  - CPU密集的程序，设置GOMAXPROCS等于CPU逻辑核心数。
  - IO密集型的程序，GOMAXPROCS可以略大于CPU逻辑核心数，更快的接管由于IO操作，操作系统创建出来的新的线程。
  - 在容器中运行时，导入go.uber.org/automaxprocs可以获取准确的被容器限制后的CPU核数。
  - 用WaitGroup可以方便的等待一组goroutine运行结束，但是一定要清晰的知道goroutine的数量。
  - 用cancelCtx可以方便的实现父协程去主动通知子协程该结束了;timerCtx在cancelCtx的基础上增加了指定结束时间。context.WithTimeout指定存活时间，context.WithDeadline指定最后期限;valueCtx只用于在携程间传递数据，无法通过ctx.Done()通知子协程去结束，如果这个需求需要配合timerCtx或者cancelCtx。
  - 利用channel实现一个pipeline， 这种方法可以很容易的把代码安单一职责原则进行拆分。
- 内存
  - go程序释放掉的内存并不会立即还给操作系统，大约有5分钟延迟，监控上看到程序内存高居不下，也许等一会就好了。
  - 使用sync.Pool来重用对象，也能减少堆内存分配进而减少GC的压力。
  - 局部变量超过栈大小、使用动态类型、都可能导致本应该在栈上的变量跑到堆上，增加GC压力。
- 错误
  - 当你调用一个函数后，你必须先判断error，如果error不为nil，那么你一定不应该再使用你的value。如果即使检测到了error还要继续使用value，这种代码设计应视为一种缺陷或者说妥协。
  - 要么在当前函数处理这个错误，要么不管直接抛给上层，打印错误也算处理错误。
  - 在错误当前层添加一些上下文，然后抛给上层，最终在顶层只打印一次
