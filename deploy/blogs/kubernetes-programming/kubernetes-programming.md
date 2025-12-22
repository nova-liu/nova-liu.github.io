# Kubernetes 编程入门

如果你想让你的应用充分利用kubernetes提供的能力，本文将提供一些思路和代码示例。

## 本文较长，把重要结论置顶

- 如果程序运行在pod里，kubelet会自动挂在一个服务账号，路径是/var/run/secrets/kubernetes.io/serviceaccount，它可以替代kubeconfig文件。client-go里的rest.InClusterConfig()会自动去这个目录下找。
- 设置config.ContentType = "application/vnd.kubernetes.protobuf" 是为了让client-go使用protobuf编码访问kubernetes，这种格式比json更加轻量快速，但是自定义资源不支持。
- kubernetes 的api服务对于两个并发的写请求，会拒绝后面一个。对于pod或其他资源的写请求，可能来自我们自己的代码也可能来自kubelet或其他组件，所以我们需要一直假设我这个请求可能是会被拒绝的。当一个对象的metadata.resourceVersion是最新的值，更新才能被接受。
- watch过程中如果发生了错误或者调用了Stop()watch的channel会被关闭。
- AllowWatchBookmarks设置为true，这表示我们启用了bookmark的能力。上面讲到的乐观锁机制，kubernetes的api只接受对最新版本对象的修改，如果我的watch断开连接重新连接后错过了几个event导致我缓存的不是最新版本对象了，那么我就要重新list一遍最新的对象，但是这太消耗资源了，Bookmark就是解决这个问题的，我只传resourceversion极大的减少了数据传输，拿到最新的版本号后，我的更新请求就又可以被接受了。

- 在实践中我们往往不直接使用watch，因为client-go还有informer机制，他对watch进行了封装，提供了缓存并加以索引查询。并且他能自动处理watch channel关闭的情况。informer帮我们保证了他的缓存中就是kubernetes集群中实际资源对象的最新状态。
- 共享informer工厂允许应用中不同控制循环共享一个watch连接，可以减少与kubernetes通信的压力。其中defaultResync代表我们多长时间要向 kubernetes api 进行一次list。
- informerFactory.WaitForCacheSync(wait.NeverStop)表示代码要在这里等第一次list结束再往下执行，这对依赖缓存填充完毕的应用很重要。
- 在informer缓存机制下，我们不应该去修改informer缓存中的对象，这会造成难以排查的问题，一定要深拷贝后再修改。
- 自定的资源就和kubernetes自身的pod，deployment等一样，都是一等公民，都存放在etcd里。
- 动态类型客户端失去了方便性，获得了通用性，不需要在编译器就确定我要对哪种资源生效，一般用在垃圾回收控制器，不需要复杂的逻辑，只删除各种父对象已经不存在的子对象。
- controller自己有一个工作队列，informer会把需要处理的资源对象放到队列里，controller每次从队列里取出资源都会检查他的实际状态（通过监控系统）与期望状态是否相符，如果相符就不需要操作，也不用再放回队列里。如果不相符，那么控制器需要进行调谐，改变实际状态，如果改变成功，就更新资源的status，同时不用再放回队列里了，如果改变失败还要放回队列里，等待下轮循环继续处理。
- Operator实际上就是上面讲到的自定义资源(CR)自定义资源的定义(CRD)和用户的自定义控制器的一个总称，再细分一下就是CR+CRD+informer+workQueue+ContorllerLoop。
- contorller 从workQueue里取出待调谐对象后去informer查最新情况也体现了kubernetes只关心最终状态的设计特点，另外对于notfound的err要忽略，因为它无法通过重试解决。
- 准入webhook有两种，都是作用在资源落库到etcd之前。一个用于修改api对象比如注入默认字段，另一个用于验证API对象的各个字段是否合法，这比crd里的schema的校验更加灵活。

# 什么是云原生应用

对于非云原生应用，它设计之初不会考虑将来要运行在kubernetes上，也许它只是运行在虚拟机，或者docker，现在迁移到了kubernetes集群中，被kubernetes管理，但是它本身并不会去访问kubernetes的api服务。

对于云原生应用则相反，他设计之初就是考虑到要利用kubernetes的能力，它会调用kubernetes的api，因此大部分时候它也只能部署在kubernetes。但是好处是，现在云服务商大规模的使用kubernetes，因此它可以很方便的在服务商之间迁移，并且kubernetes声明式的机制，能帮我我们完成一些应用的自动化运维。

# client-go

client-go是一个典型的web服务客户端，它支持kubernetes中所有官方的API类型。下面代码用client-go在kubernetes集群中对一个pod进行CURD。

```go
package main

import (
	"context"
	"flag"
	"fmt"
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
	"time"
)

const NAMESPACE = "default"
const NAME = "foo"

func main() {
	var config *rest.Config
	if env := os.Getenv("KUBECONFIG"); len(env) > 0 {
		inClusterConfig, err := rest.InClusterConfig()
		if err != nil {
			panic(err)
		}
		config = inClusterConfig
	} else {
		kubeconfig := flag.String("kubeconfig", "~/.kube/config", "kubeconfig file")
		flag.Parse()
		flagConfig, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err)
		}
		config = flagConfig
	}
	config.AcceptContentTypes = "application/vnd.kubernetes.protobuf,application/json"
	config.ContentType = "application/vnd.kubernetes.protobuf"
	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Name: NAME,
			Labels: map[string]string{
				"k": "v",
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{Name: "busybox", Image: "busybox:latest", Command: []string{"sleep", "1000"}},
			},
		},
	}
	_, err = clientSet.CoreV1().Pods(NAMESPACE).Create(context.Background(), pod, metav1.CreateOptions{})
	if err != nil {
		fmt.Printf("create pods err:%s", err.Error())
	}
	pod, err = clientSet.CoreV1().Pods(NAMESPACE).Get(context.Background(), NAME, metav1.GetOptions{})
	if err != nil {
		fmt.Printf("get pods err:%s", err.Error())
	}
	fmt.Println(pod.ObjectMeta.Labels)
	ticker := time.NewTicker(time.Second * 3)
	times := 1
	defer ticker.Stop()
	for range ticker.C {
		pod, err = clientSet.CoreV1().Pods(NAMESPACE).Get(context.Background(), NAME, metav1.GetOptions{})
		if err != nil {
			fmt.Printf("get pods err:%s", err.Error())
			continue
		}
		pod.ObjectMeta.Labels = map[string]string{"patch": "v1"}
		_, err = clientSet.CoreV1().Pods(NAMESPACE).Update(context.Background(), pod, metav1.UpdateOptions{})
		if err == nil {
			break
		}
		fmt.Printf("update pods err:%s\n", err.Error())
		if times > 3 {
			break
		}
		fmt.Println("we will try again in 3 second")
		times++
	}
	pod, err = clientSet.CoreV1().Pods(NAMESPACE).Get(context.Background(), NAME, metav1.GetOptions{})
	if err != nil {
		fmt.Printf("get pods err:%s", err.Error())
	}
	fmt.Println(pod.ObjectMeta.Labels)
	err = clientSet.CoreV1().Pods(NAMESPACE).Delete(context.Background(), NAME, metav1.DeleteOptions{})
	if err != nil {
		fmt.Printf("get pods err:%s", err.Error())
	}
}

```

首先要读取集群的配置文件，里面包含了服务器名称，身份认证信息等客户端数据。
**如果程序运行在pod里，kubelet会自动挂在一个服务账号，路径是/var/run/secrets/kubernetes.io/serviceaccount，它可以替代kubeconfig文件。client-go里的rest.InClusterConfig()会自动去这个目录下找。**
所以我们通过环境变量判断是否运行在容器，然后分别用 rest.InClusterConfig 和 clientcmd.BuildConfigFromFlags 获取两种场景下的配置文件。**设置config.ContentType = "application/vnd.kubernetes.protobuf" 是为了让client-go使用protobuf编码访问kubernetes，这种格式比json更加轻量快速，但是自定义资源不支持。**
然后初始化客户端，之后客户端分别进行了对pod的CURD操作。

## 乐观并发

在上面的代码中，对pod进行修改的时候，我们又get了一次集群中的pod，并且整个过程放在了循环里。这是因为kubernetes的api服务采用的乐观并发的模型。**kubernetes 的api服务对于两个并发的写请求，会拒绝后面一个。对于pod或其他资源的写请求，可能来自我们自己的代码也可能来自kubelet或其他组件，所以我们需要一直假设我这个请求可能是会被拒绝的。当一个对象的metadata.resourceVersion是最新的值，更新才能被接受。**

## watch与informer

watch 提供了发现对象各种变化的机制，如添加、删除、更新。下面代码实现了对default namespace内 pod 的watch

```go
package main

import (
	"context"
	"flag"
	"fmt"
	v1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
)

const NAMESPACE = "default"
const NAME = "foo"

func main() {
	var config *rest.Config
	if env := os.Getenv("KUBECONFIG"); len(env) > 0 {
		inClusterConfig, err := rest.InClusterConfig()
		if err != nil {
			panic(err)
		}
		config = inClusterConfig
	} else {
		kubeconfig := flag.String("kubeconfig", "~/.kube/config", "kubeconfig file")
		flag.Parse()
		flagConfig, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err)
		}
		config = flagConfig
	}
	config.AcceptContentTypes = "application/vnd.kubernetes.protobuf,application/json"
	config.ContentType = "application/vnd.kubernetes.protobuf"
	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	watcher, err := clientSet.CoreV1().Pods(NAMESPACE).Watch(context.Background(), metav1.ListOptions{AllowWatchBookmarks: true})
	if err != nil {
		panic(err)
	}
	for event := range watcher.ResultChan() {
		switch event.Type {
		case watch.Added:
			fmt.Printf("added evnet from %s\n", event.Object.(*v1.Pod).Name)
		case watch.Modified:
			fmt.Printf("modified evnet from %s\n", event.Object.(*v1.Pod).Name)
		case watch.Deleted:
			fmt.Printf("deleted evnet from %s\n", event.Object.(*v1.Pod).Name)
		case watch.Bookmark:
			fmt.Println("`Bookmark` means watch has synced here, just update the resourceVersion")
		case watch.Error:
			fmt.Printf("unable to understand watch event%v\n", event)
		}
	}
	fmt.Println("watcher channel closed")
}

```

首先通过clientSet创建一个 watch pod 的 watcher，watcher.ResultChan()会返回一个只能接收的channel，所有被watch到的事件都会被发送到这个channel中。其中有两点需要注意。

- **watch过程中如果发生了错误或者调用了Stop()watch的channel会被关闭。**
- **AllowWatchBookmarks设置为true，这表示我们启用了bookmark的能力。上面讲到的乐观锁机制，kubernetes的api只接受对最新版本对象的修改，如果我的watch断开连接重新连接后错过了几个event导致我缓存的不是最新版本对象了，那么我就要重新list一遍最新的对象，但是这太消耗资源了，Bookmark就是解决这个问题的，我只传resourceversion极大的减少了数据传输，拿到最新的版本号后，我的更新请求就又可以被接受了。**

**在实践中我们往往不直接使用watch，因为client-go还有informer机制，他对watch进行了封装，提供了缓存并加以索引查询。并且他能自动处理watch channel关闭的情况。informer帮我们保证了他的缓存中就是kubernetes集群中实际资源对象的最新状态。**

下面代码实现了一个informer。

```go
package main

import (
	"flag"
	"fmt"
	v1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/wait"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/cache"
	"k8s.io/client-go/tools/clientcmd"
	"os"
	"time"
)

const NAMESPACE = "default"
const NAME = "foo"

func main() {
	var config *rest.Config
	if env := os.Getenv("KUBECONFIG"); len(env) > 0 {
		inClusterConfig, err := rest.InClusterConfig()
		if err != nil {
			panic(err)
		}
		config = inClusterConfig
	} else {
		kubeconfig := flag.String("kubeconfig", "~/.kube/config", "kubeconfig file")
		flag.Parse()
		flagConfig, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err)
		}
		config = flagConfig
	}
	config.AcceptContentTypes = "application/vnd.kubernetes.protobuf,application/json"
	config.ContentType = "application/vnd.kubernetes.protobuf"
	clientSet, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	informerFactory := informers.NewSharedInformerFactory(clientSet, time.Minute*30)
	podInformer := informerFactory.Core().V1().Pods()
	_, err = podInformer.Informer().AddEventHandler(cache.ResourceEventHandlerFuncs{
		AddFunc: func(obj interface{}) {
			fmt.Printf("add pod :%s\n", obj.(*v1.Pod).Name)
		},
		UpdateFunc: func(oldObj, newObj interface{}) {
			fmt.Printf("update pod :%s\n", oldObj.(*v1.Pod).Name)
		},
		DeleteFunc: func(obj interface{}) {
			fmt.Printf("delete pod :%s\n", obj.(*v1.Pod).Name)
		},
	})
	if err != nil {
		panic(err)
	}
	informerFactory.Start(wait.NeverStop)
	informerFactory.WaitForCacheSync(wait.NeverStop)
	<-wait.NeverStop
}
```

我们用共享informer工厂创建了一个pod的informer，**共享informer工厂允许应用中不同控制循环共享一个watch连接，可以减少与kubernetes通信的压力。其中defaultResync代表我们多长时间要向 kubernetes api 进行一次list。**

**informerFactory.WaitForCacheSync(wait.NeverStop)表示代码要在这里等第一次list结束再往下执行，这对依赖缓存填充完毕的应用很重要。**

**在这种缓存机制下，我们不应该去修改informer缓存中的对象，这会造成难以排查的问题，一定要深拷贝后再修改。**

# 自定义资源

## CR与CRD

自定义资源（Custom Resource，CR），它是整个kubernetes生态中最核心的扩展机制。
**自定的资源就和kubernetes自身的pod，deployment等一样，都是一等公民，都存放在etcd里。**
kubernetes在1.7版本开始支持自定义资源功能。

```yaml
apiVersion: cnat.programming-kubernetes.info/v1alpha1
kind: At
metadata:
  name: example-at
spec:
  schedule: '2019-07-03T02:00:00Z'
```

> 一个简单的CR

现在很明显的一个问题是，kubernetes肯定不会认识我这个CR的，所以我们还需要一个Custom Resource Definition（CRD）来告诉kubernetes这些定义是什么含义。

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  # 名字必需与下面的 spec 字段匹配，并且格式为 '<名称的复数形式>.<组名>'
  name: ats.cnat.programming-kubernetes.info
spec:
  # 组名称，用于 REST API: /apis/<组>/<版本>
  group: cnat.programming-kubernetes.info
  # 列举此 CustomResourceDefinition 所支持的版本
  versions:
    - name: v1alpha1
      # 每个版本都可以通过 served 标志来独立启用或禁止
      served: true
      # 其中一个且只有一个版本必需被标记为存储版本
      storage: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                schedule:
                  type: string
  # 可以是 Namespaced 或 Cluster
  scope: Namespaced
  names:
    kind: At
    listKind: AtList
    plural: ats
    singular: at
```

这个crd就是用来定义上面的cr的，其中schema是kubernetes提供的一种验证cr是否合法的机制。

现在，光有自定义资源是没有意义的，我们要在应用程序里感知到这些自定义资源，进而执行有实际意义的程序。在上面我们已经看到用client-go访问原生资源pod，那么怎么访问自定义资源呢？

## 在程序中使用自定义资源

常用的用来访问自定义资源的客户端有以下几种

- client-go的动态类型客户端
- 强类型客户端
  - kubernetes-sigs/controller-runtime 提供的客户端，Operator SDK 和 kuberbuilder中使用的这种。
  - client-gen生成的客户端，与k8s.io/client-go/kubernetes中使用的一样。

### client-go动态客户端

这种客户端对类型完全无感知，它的输出本质上就是json.Unmarshal的一个封装，下面代码用动态客户端获得了集群中的一个CR。

```go
package main

import (
	"context"
	"flag"
	"fmt"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"os"
)

const NAMESPACE = "default"
const NAME = "foo"

func main() {
	var config *rest.Config
	if env := os.Getenv("KUBECONFIG"); len(env) > 0 {
		inClusterConfig, err := rest.InClusterConfig()
		if err != nil {
			panic(err)
		}
		config = inClusterConfig
	} else {
		kubeconfig := flag.String("kubeconfig", "~/.kube/config", "kubeconfig file")
		flag.Parse()
		flagConfig, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			panic(err)
		}
		config = flagConfig
	}
	config.AcceptContentTypes = "application/vnd.kubernetes.protobuf,application/json"
	config.ContentType = "application/vnd.kubernetes.protobuf"
	client, err := dynamic.NewForConfig(config)
	if err != nil {
		panic(err)
	}
	atGVR := schema.GroupVersionResource{
		Group:    "cnat.programming-kubernetes.info",
		Version:  "v1alpha1",
		Resource: "ats",
	}
	at, err := client.Resource(atGVR).Namespace(NAMESPACE).Get(context.Background(), "example-at", v1.GetOptions{})
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(at)
}
```

**动态类型客户端失去了方便性，获得了通用性，不需要在编译器就确定我要对哪种资源生效，一般用在垃圾回收控制器，不需要复杂的逻辑，只删除各种父对象已经不存在的子对象。**

### 强类型客户端

强类型客户端不使用通用的数据结构，而是为每种GVK创建专用的Go语言类型，这样的客户端需要通过工具生成。kubernetes官方的客户端不仅支持强类型客户端，也有一些其他的功能，下面详细介绍这种工具。

# k8s.io/code-generator

code-generator提供了一组可以在外部使用的代码生成器，通过调用代码包中的generate-group.sh脚本，就可以为我们生成包括强类型客户端以及其他代码。使用它的前提是，我们要用复合生成器语法的方式，定义我们要生成的内容。

生成操作自定义资源的客户端需要以下四个部分，都是上面文章中提到过的。

- deepcopy-gen: 生成深拷贝方法，所有的kubernetes对象都支持深拷贝，自定义的当然也要支持。
- client-gen: 生成强类型的客户端。
- informer-gen: 生成自定义资源的informer。
- lister-gen: 生成lister对象，能够查询informer中缓存的资源对象。

这些生成的代码和kubernetes原生控制器的代码逻辑一致，是能够用于生产级别的可靠的实践。

## 生成器语法

要使用生成器，就要遵循生成器的语法。

+<tag_name>[=value]格式的注释，就是 Kubernetes 进行代码生成要用的 Annotation 风格的注释

作为生成器的原材料，基本代码结构如下。

```shell
solar@solardeMacBook-Air kubernetesapi % tree pkg
pkg
└── apis
    └── cnat
        ├── register.go
        └── v1alpha1
            ├── doc.go
            ├── register.go
            └── types.go
```

其中pkg/apis/cnat/register.go里面用于存放全局变量。

```go
package cnat

const (
	GroupName = "cnat.programming-kubernetes.info"
	Version   = "v1alpha1"
)
```

pkg/apis/cnat/v1alpha1/ 目录下的三个文件，doc.go用于定义这个版本下的全局的生成器标签。

```go
// +k8s:deepcopy-gen=package
// +groupName=cnat.programming-kubernetes.info

// Package v1alpha1 is the v1alpha1 version of the API.
package v1alpha1
```

types.go 用于定义你的自定义类型。

```go
package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

const (
	PhasePending = "PENDING"
	PhaseRunning = "RUNNING"
	PhaseDone    = "DONE"
)

// AtSpec defines the desired state of At
type AtSpec struct {
	// Schedule is the desired time the command is supposed to be executed.
	// Note: the format used here is UTC time https://www.utctime.net
	Schedule string `json:"schedule,omitempty"`
	// Important: Run "make" to regenerate code after modifying this file
}

// AtStatus defines the observed state of At
type AtStatus struct {
	// Phase represents the state of the schedule: until the command is executed
	// it is PENDING, afterwards it is DONE.
	Phase string `json:"phase,omitempty"`
	// Important: Run "make" to regenerate code after modifying this file
}

// +genclient
// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// At runs a command at a given schedule.
type At struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   AtSpec   `json:"spec,omitempty"`
	Status AtStatus `json:"status,omitempty"`
}

// +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object

// AtList contains a list of At
type AtList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []At `json:"items"`
}
```

register.go用于把类型注册到客户端，核心就是addKnowTypes函数，它是非常固定的。

```go
package v1alpha1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"kubernetesapi/pkg/apis/cnat"
)

// SchemeGroupVersion is group version used to register these objects
var SchemeGroupVersion = schema.GroupVersion{Group: cnat.GroupName, Version: cnat.Version}

// Kind takes an unqualified kind and returns back a Group qualified GroupKind
func Kind(kind string) schema.GroupKind {
	return SchemeGroupVersion.WithKind(kind).GroupKind()
}

// Resource takes an unqualified resource and returns a Group qualified GroupResource
func Resource(resource string) schema.GroupResource {
	return SchemeGroupVersion.WithResource(resource).GroupResource()
}

var (
	SchemeBuilder = runtime.NewSchemeBuilder(addKnownTypes)
	AddToScheme   = SchemeBuilder.AddToScheme
)

// Adds the list of known types to Scheme.
func addKnownTypes(scheme *runtime.Scheme) error {
	scheme.AddKnownTypes(SchemeGroupVersion,
		&At{},
		&AtList{},
	)
	metav1.AddToGroupVersion(scheme, SchemeGroupVersion)
	return nil
}
```

下面解释一下上面代码中出现的生成器注释

- // +k8s:deepcopy-gen=package
  - 为这个自定义类型创建深拷贝方法，这是每个类型都必须要有的，一般放在doc.go文件里作为全局的注释标签。
- // +groupName=cnat.programming-kubernetes.info
  - groupName和crd里的group保持一致，一般放在doc.go文件里作为全局的注释标签。
- // +genclient
  - 这个注释表示会为该类型生成强类型的cilentSet 以及 informer和lister。
- // +k8s:deepcopy-gen:interfaces=k8s.io/apimachinery/pkg/runtime.Object
  - 它的意思是，请在生成 DeepCopy 的时候，实现 Kubernetes 提供的 runtime.Object 接口。否则，在某些版本的 Kubernetes 里，你的这个类型定义会出现编译错误。这是一个固定的操作，记住即可。

最后通过代码生成工具，就得到了一个自定义类型的cientSet、informer、lister。

```shell
generate-groups.sh <generators> <output-package> <apis-package> <groups-versions>
```

# 自定义控制器

<div align="center">
<img src="/blogs/kubernetes-programming/custom-controller.png" height="40%" width="40%"></img>

> custom controller

</div>

上图就是一个自定义控制器的全貌，实际上左半部分我们已经多次提到了，kubenetes 的api服务和 informer，其中informer可以用client-go构建，对于自定义类型也可以使用k8s.io/code-generator构建。

有了informer，我们就有了一块缓存，里面保存的是我们想要的kubernetes资源，并且可以监听它的变化。这里的变化一般都是用户修改了资源的spec字段，这是资源的期望状态，期望状态有了变化之后该怎么办呢，就是图中右半部分要做的事。

**controller自己有一个工作队列，informer会把需要处理的资源对象放到队列里，controller每次从队列里取出资源都会检查他的实际状态（通过监控系统）与期望状态是否相符，如果相符就不需要操作，也不用再放回队列里。如果不相符，那么控制器需要进行调谐，改变实际状态，如果改变成功，就更新资源的status，同时不用再放回队列里了，如果改变失败还要放回队列里，等待下轮循环继续处理。**

# Operator

**Operator实际上就是上面讲到的自定义资源(CR)自定义资源的定义(CRD)和用户的自定义控制器的一个总称，再细分一下就是CR+CRD+informer+workQueue+ContorllerLoop。**

实际工作中，我们通常使用kubebuilder或者operator SDK来编写operator。本文会介绍kubebuilder的核心用法。

## 使用kubebuilder

因为用到了go mod，使用kubebuilder前需要先初始化一个go mod

```go
go mod init my.domain
```

然后使用kubebuilder初始化项目。

```shell
kubebuilder init my.domain
```

创建api，这一步会帮我们创建好controller的框架和resource，同时定义好了资源的GVK。

```shell
kubebuilder create api --group webapp --version v1 --kind Guestbook
```

此时在config/crd/当中crd的生成模版就已经创建好了，config/samples/里有一个对应的CR可供测试。并且对于这个CR的informer和workQueue、controllerLoop的框架都已经搭建好了，需要我们修改的是api/v1/guestbook_types.go和controllers/guestbook_controller.go，这两个文件定义的分别是我的资源有那些信息，以及如何调谐。

```go
func (r *GuestbookReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	_ = log.FromContext(ctx)
	instance := &webappv1.Guestbook{}
	err := r.Get(ctx, req.NamespacedName, instance)
	if err != nil {
		if errors.IsNotFound(err) {
			// Request object not found, could have been deleted after reconcile request - return and don't requeue:
			return reconcile.Result{}, nil
		}
		// Error reading the object - requeue the request:
		return reconcile.Result{}, err
	}
	/*
		get instance real status by monitoring
	*/
	// Update the At instance
	err = r.Status().Update(context.TODO(), instance)
	return ctrl.Result{}, err
}
```

这个方法就是用来实现调谐逻辑的，其中req就是从workQueue中取出来的待处理的对象，只包含了了name和Namespace，所以我们还需要去informer的缓存中拿出完整的定义来，然后查看资源的实际状态。

**其中从workQueue里取出待调谐对象后去informer查最新情况也体现了kubernetes只关心最终状态的设计特点，另外对于notfound的err要忽略，因为它无法通过重试解决。**

kubebuilder生成的makefile文件里，还定义了如何打包部署的脚本，具体使用可以参考官方文档。

### 准入 Webhooks

准入 webhook 是 HTTP 的回调，它可以接受准入请求，处理它们并且返回准入响应。

Kubernetes 提供了下面几种类型的准入 webhook：

- **变更准入 Webhook** 这种类型的 webhook 会在对象创建或是更新且没有存储前改变操作对象，然后才存储。它可以用于资源请求中的默认字段，比如在 Deployment 中没有被用户制定的字段。它可以用于注入 sidecar 容器。
- **验证准入 Webhook** 这种类型的 webhook 会在对象创建或是更新且没有存储前验证操作对象，然后才存储。它可以有比纯基于 schema 验证更加复杂的验证。比如：交叉字段验证和 pod 镜像白名单。

利用kubebuilder实现这两个webhook非常容易。

```shell
kubebuilder create webhook --group webapp --version v1 --kind Guestbook --defaulting --programmatic-validation
```

其中参数--defaulting --programmatic-validation代表我们需要上述两种webhook。命令执行成功后会在api/v1目录下找到对应的webhook文件，其中Default()方法用来修改api对象，比如注入一些默认值。另外还有3个Validate方法，分别对api对象的创建、修改、删除动作进行拦截，检测字段是否合法，这里可以实现比crd中的schema更为完善的检测机制。
