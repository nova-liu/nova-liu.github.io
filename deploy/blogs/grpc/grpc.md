# grpc简介

本文简单介绍grpc的作用和原理，然后介绍一些实用的功能，帮你构建一个安全高效的grpc服务。

第一个作用是沟通，应用程序可以用不同的编程语言构建，比如golang，python，java，swift。这些程序之间字幕沟通呢？
通常我们使用的是微服务框架，它要保证后端不同语言的服务遵循相同的api约定来进行沟通。比如沟通渠道，验证机制，载荷格式，数据模型，错误处理。

第二个是要沟通的迅速，尤其是服务端信息交换量巨大的时候，我们希望能尽量变得轻巧，来加快交换速度。

第三是我们希望沟通简单，我们希望有某种框架把非业务逻辑的代码都搞定，我们只关注业务逻辑。

# 工作原理

grpc是一个开源的高性能的rpc框架，最开始由google开发，现在属于cncf。

rcp的全称是Remote Procedure Calls，代表远程过程调用，它允许程序执行位于其他计算机上的程序，即使他们是不同语言的，并且程序员不必关系网络交换的代码。

grpc通过存根实现了这一点，客户端上的存根实现了和服务端一样的方法，存根在后台调用grpc框架，进而到真正的服务器上执行相应的方法。网络通信方面grpc在应用层是基于http2实现的，有更小的报文，并且不会有对头阻塞的问题。

grpc有四种通信方式，分别是一次发送一次响应，多次发送一次响应，一次发送多次响应，多次发送多次响应。

<div align="center">
<img src="/blogs/grpc/grpc.png" height="40%" width="40%"></img>

> grpc的四种通信类型

</div>

在最后一种双向数据流的模型里，双方都不需要等待对方的响应，便可以畅通无阻的发送。

**流传输可以让我们边传输边处理，减少服务器的压力，传大文件时很实用。**

# protobuf

grpc使用protobuf这种载荷进行通信，它是一个.proto后缀的文件，我们可以用pb编译器配合这个文件来生成代码，也就是上面提到的存根。它的官方定义是这样的。

protocol buffers 是一种语言无关、平台无关、可扩展的序列化结构数据的方法，它可用于（数据）通信协议、数据存储等。

```proto
// 声明语法是proto3
syntax = "proto3";
// 包的名称
package pb;
// 声明golang package的名称因为不同语言包名称规则不同所以采取这种选项
option go_package = "pb";
// 导入其他proto
import "other.proto";
// 定义一个类型
message MyHome {
  /*
  字段类型和编号从1开始，这些编号用来在message编码后的二进制数据中来区分各个字段，
  一旦你的message开始使用就不可以改变其字段的编号，1-15占1字节应该留给常用字段。
   */
  string Name = 1;
  // repeated 代表是一个数组，这里就是int32数组。
  repeated int32 Position = 2;
  /*
   协议缓冲区 (Protobuf) 中的向后兼容性保证依赖于字段编号始终表示相同的数据项。
   如果从服务的新版本的消息中删除字段，则永远不应重复使用该字段编号。
   用reserved的保留字段保证其他人不能用。
   */
  reserved 3;
  //string OldName = 3;

  // map类型的表示方法。
  map<string,string> Member = 4;
  // 枚举类型,枚举变量必须是32位的int
  enum Furniture {
    TV = 0;
    TABLE = 1;
  }
  Furniture furniture = 5;
}

// 定义一个rpc服务，包含全部四种不同类型的方法
service Server {
  rpc Unary(MyHome) returns (MyHome);
  rpc ServerStream(MyHome) returns (stream MyHome);
  rpc ClientStream(stream MyHome) returns (MyHome);
  rpc BiDirectionalStream(stream MyHome) returns (stream MyHome);
}
```

> 一个简单的proto示例

通过protoc编译器，可以将此文件生成各种不同语言的代码。

其他的 proto type 与各编程语言类型的对应关系如图

<div align="center">
<img src="/blogs/grpc/proto-type.png" height="40%" width="40%"></img>

> proto type

</div>

# 拦截器

它是一个 middleware function， 服务端和客户端都可以添加。通常**我们可以在拦截器上实现日志、跟踪、限流、认证、授权。**

<div align="center">
<img src="/blogs/grpc/grpc-middleware.jpg" height="40%" width="40%"></img>

> grpc-middleware

</div>

grpc提供了两种类型拦截器，分别是 UnaryServerInterceptor 和 StreamServerInterceptor 分别针对一次传输和流传输的情况。他的签名如下

```go
// UnaryServerInterceptor provides a hook to intercept the execution of a unary RPC on the server. info
// contains all the information of this RPC the interceptor can operate on. And handler is the wrapper
// of the service method implementation. It is the responsibility of the interceptor to invoke handler
// to complete the RPC.
type UnaryServerInterceptor func(ctx context.Context, req interface{}, info *UnaryServerInfo, handler UnaryHandler) (resp interface{}, err error)


// StreamServerInterceptor provides a hook to intercept the execution of a streaming RPC on the server.
// info contains all the information of this RPC the interceptor can operate on. And handler is the
// service method implementation. It is the responsibility of the interceptor to invoke handler to
// complete the RPC.
type StreamServerInterceptor func(srv interface{}, ss ServerStream, info *StreamServerInfo, handler StreamHandler) error

```

在UnaryServerInterceptor拦截器中可以获取上下文，请求参数，rpc服务信息和handler信息。StreamServerInterceptor中的参数包含了服务端数据流的行为，以及流服务信息和handler。

# 双向TLS(mTLS)

微服务中通常使用mTLS来保证数据传输的安全性，相比于TLS，mTLS需要双方互相确认身份，双方都需要提供证书。grpc框架中也提供了使用mTLS的方式。

和tls一样首先要先创建ca证书、ca公钥、服务端证书和公钥，然后再代码中加载服务端的这两个文件、ca证书文件，代码如下。

```golang
func loadTLSCredentials() (credentials.TransportCredentials, error) {
	// Load certificate of the CA who signed client's certificate
	pemClientCA, err := ioutil.ReadFile(clientCACertFile)
	if err != nil {
		return nil, err
	}

	certPool := x509.NewCertPool()
	if !certPool.AppendCertsFromPEM(pemClientCA) {
		return nil, fmt.Errorf("failed to add client CA's certificate")
	}

	// Load server's certificate and private key
	serverCert, err := tls.LoadX509KeyPair(serverCertFile, serverKeyFile)
	if err != nil {
		return nil, err
	}

	// Create the credentials and return it
	config := &tls.Config{
		Certificates: []tls.Certificate{serverCert},
		ClientAuth:   tls.RequireAndVerifyClientCert,
		ClientCAs:    certPool,
	}

	return credentials.NewTLS(config), nil
}

func run(listener net.Listener)error  {
	tlsCredentials, err := loadTLSCredentials()
	if err != nil {
		return fmt.Errorf("cannot load TLS credentials: %w", err)
	}
	grpcServer := grpc.NewServer(grpc.Creds(tlsCredentials))
	log.Printf("Start GRPC server at %s, TLS = true", listener.Addr().String())
	return grpcServer.Serve(listener)
}
```

同样的方式在客户端也需要开启tls认证，这样一个mTLS的grpc服务就搭建好了。

# 总结

- grpc基于http2进行通信，压缩了数据报文，并且不会有http1.1中对头阻塞的问题。
- grpc在发送端和响应端都支持unary和stream，传送大量数据是用stream可以边传边处理，分摊压力。
- grpc使用 protocol buffers 这种序列化结构，编码解码性能超过JSON。
- grpc提供拦截器，我们可以在拦截器上实现日志、跟踪、限流、认证、授权功能。
- grpc提供了实现双向TLS(mTLS)认证的机制。
