# How to implement a unit test for a function that needs to call a remote service

The unit test code may fail when it's calling a remote service, then we can't write a test function to cover it. there are some ways we can use to avoid the failing.

### using real configuration

actually, we can use a real configuration to make a client, then use it to call the remote service, and get the result.
it's a way that is really easy to understand, but there also are some cons. You must make sure the service works correctly, and that your unit test code has the right config for this service.

### using mock type

we can construct a mock type to implement the same method as the real type of the instance. whenever the code calls the remote service, we can skip it instead of using the mock type method. in order to achieve this, our code must have a really good abstract, so we can contrast mock type to expand it.

### Monkey Patching

this is an almost magic way. it allows you to replace any function or method with another one. Anywhere your unit test can not go past, replace it! You can get more info here: https://bou.ke/blog/monkey-patching-in-go/

## example

here are two examples to show you how it works using a mock type or using monkey patching.

#### using mock type

```go
package main

import (
	"context"
	"testing"
)

func TestMock(t *testing.T) {
	client := &mockClient{}

  client.run() // doSomeRemoteCall() in run()

}

// LaunchDarkly provides a launchdarkly
type mockClient struct {

}

func (m *mockClient) doSomeRemoteCall() error {
	return nil
}

```

#### Monkey Patching

```go
package main

import (
	"syscall"
	"unsafe"
)

func a() int { return 1 }
func b() int { return 2 }

func getPage(p uintptr) []byte {
	return (*(*[0xFFFFFF]byte)(unsafe.Pointer(p & ^uintptr(syscall.Getpagesize()-1))))[:syscall.Getpagesize()]
}

func rawMemoryAccess(b uintptr) []byte {
	return (*(*[0xFF]byte)(unsafe.Pointer(b)))[:]
}

func assembleJump(f func() int) []byte {
	funcVal := *(*uintptr)(unsafe.Pointer(&f))
	return []byte{
		0x48, 0xC7, 0xC2,
		byte(funcVal >> 0),
		byte(funcVal >> 8),
		byte(funcVal >> 16),
		byte(funcVal >> 24), // MOV rdx, funcVal
		0xFF, 0x22,          // JMP rdx
	}
}

func replace(orig, replacement func() int) {
	bytes := assembleJump(replacement)
	functionLocation := **(**uintptr)(unsafe.Pointer(&orig))
	window := rawMemoryAccess(functionLocation)

	page := getPage(functionLocation)
	syscall.Mprotect(page, syscall.PROT_READ|syscall.PROT_WRITE|syscall.PROT_EXEC)

	copy(window, bytes)
}

func main() {
	replace(a, b)
	print(a())
}

```

## tips

- if you are using a computer that whit apple a apple chip, you should change GOARCH to amd64 in order to use bou.ke/monkey
- [monkey LICENSE](https://github.com/bouk/monkey/blob/master/LICENSE.md)
