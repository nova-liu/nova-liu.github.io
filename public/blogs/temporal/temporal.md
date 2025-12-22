# Temporal: A Powerful Workflow Orchestration Engine for Go Developers

This blog post introduces Temporal, a robust open-source workflow orchestration engine that simplifies the development of reliable and scalable applications. We'll explore how Temporal works, its key features, and provide a simple "Hello World" example to get you started.

#### Why use temporal

- Reliable distributed applications
- Productive development paradigms and code structure
- Visible distributed application state

#### Hello World Workflow

```go
type HelloWorldRequest struct {
    Name string
}

type HelloWorldResponse struct {
    Greeting string
}

// SayHelloActivity
func SayHelloActivity(ctx context.Context, request HelloWorldRequest) (HelloWorldResponse, error) {
    greeting := fmt.Sprintf("Hello, %s! Welcome to Temporal!", request.Name)

    result := HelloWorldResponse{
        Greeting: greeting,
    }

    return result, nil
}

// HelloWorldWorkflow is a sample workflow definition.
func HelloWorldWorkflow(ctx workflow.Context, request HelloWorldRequest) (HelloWorldResponse, error) {
    // retry strategy for activity
    activityOptions := workflow.ActivityOptions{
        StartToCloseTimeout: time.Second * 10,
        RetryPolicy: &workflow.RetryPolicy{
            MaximumAttempts: 3,
        },
    }

    ctx = workflow.WithActivityOptions(ctx, activityOptions)

    var result HelloWorldResponse
    err := workflow.ExecuteActivity(ctx, SayHelloActivity, request).Get(ctx, &result)
    if err != nil {
        return HelloWorldResponse{}, err
    }

    return result, nil
}

func main() {
    // init temporal client
    c, err := client.Dial(client.Options{
        HostPort: client.DefaultHostPort,
    })
    if err != nil {
        log.Fatalln("Unable to create client", err)
    }
    defer c.Close()

    // create worker
    w := worker.New(c, "hello-world-task-queue", worker.Options{})

    // register workflow and activities
    w.RegisterWorkflow(HelloWorldWorkflow)
    w.RegisterActivity(SayHelloActivity)

    // start Worker (run in background)
    go func() {
        err = w.Run(worker.InterruptCh())
        if err != nil {
            log.Fatalln("Unable to start worker", err)
        }
    }()

    // execute workflow
    workflowOptions := client.StartWorkflowOptions{
        ID:        "hello-world-workflow",
        TaskQueue: "hello-world-task-queue",
    }

    request := HelloWorldRequest{Name: "World"}

    we, err := c.ExecuteWorkflow(context.Background(), workflowOptions, HelloWorldWorkflow, request)
    if err != nil {
        log.Fatalln("Unable to execute workflow", err)
    }

    // get result
    var result HelloWorldResponse
    err = we.Get(context.Background(), &result)
    if err != nil {
        log.Fatalln("Unable to get workflow result", err)
    }

    log.Println("Workflow completed!")
    log.Printf("Result: %s\n", result.Greeting)
}
```

#### How to define Workflow parameters

- All Workflow Definition parameters must be serializable and can't be channels, functions, variadic, or unsafe pointers. And workflow return values must also be serializable. [doc](https://docs.temporal.io/develop/go/core-application)

- A single argument is limited to a maximum size of 2 MB. And the total size of a gRPC message, which includes all the arguments, is limited to a maximum of 4 MB. [doc](https://docs.temporal.io/develop/go/core-application)

What kind of data is serializable? there are some common types that are serializable:

```go
package example

// WorkflowInput demonstrates all Temporal-serializable field types.
type WorkflowInput struct {
	// --- Basic types ---
	StringValue string    `json:"string_value"`  // ✅ string
	IntValue    int       `json:"int_value"`     // ✅ int
	Int32Value  int32     `json:"int32_value"`   // ✅ int32
	Int64Value  int64     `json:"int64_value"`   // ✅ int64
	FloatValue  float64   `json:"float_value"`   // ✅ float64
	BoolValue   bool      `json:"bool_value"`    // ✅ bool
	TimeValue   time.Time `json:"time_value"`    // ✅ time.Time (serialized as RFC3339)

	// --- Pointer types ---
	StringPtr *string `json:"string_ptr,omitempty"` // ✅ pointers are fine
	IntPtr    *int    `json:"int_ptr,omitempty"`

	// --- Slices ---
	StringSlice []string  `json:"string_slice"` // ✅ JSON array
	IntSlice    []int     `json:"int_slice"`
	StructSlice []Address `json:"struct_slice"` // ✅ slice of structs

	// --- Maps ---
	StringMap map[string]string `json:"string_map"` // ✅ JSON object
	StructMap map[string]Address `json:"struct_map"` // ✅ map of structs
	AnyMap    map[string]any     `json:"any_map"`   // ⚠️ works but type-unsafe; use sparingly

	// --- Nested structs ---
	NestedStruct Address  `json:"nested_struct"`      // ✅ nested struct
	NestedPtr    *Address `json:"nested_ptr,omitempty"` // ✅ pointer to struct

	// --- Binary data ---
	ByteArray []byte `json:"byte_array"` // ✅ serialized as base64 string

	// --- Arbitrary JSON blobs ---
	RawJSON map[string]any `json:"raw_json,omitempty"` // ✅ use for dynamic JSON input

	// --- Enum-like field ---
	Status string `json:"status"` // ✅ strings are safe for enum representation
}

// Nested struct example
type Address struct {
	Country string  `json:"country"`
	City    string  `json:"city"`
	ZipCode *string `json:"zip_code,omitempty"`
}

```

some example that are not serializable:

```go
// InvalidWorkflowInput demonstrates all types that CANNOT be used
// as Workflow or Activity parameters in Temporal.
type InvalidWorkflowInput struct {
	// --- Function and channel types ---
	Callback func() error       // ❌ functions are not serializable
	EventCh  chan string        // ❌ channels cannot be serialized

	// --- Unsafe or system-level pointers ---
	UnsafePtr unsafe.Pointer    // ❌ unsafe, cannot be serialized

	// --- Synchronization primitives ---
	Mutex   sync.Mutex          // ❌ contains internal state, not serializable
	WaitGrp sync.WaitGroup      // ❌ same as above

	// --- Context types ---
	Ctx context.Context         // ❌ Temporal provides its own workflow.Context
	CtxPtr *context.Context     // ❌ also invalid

	// --- IO or network handles ---
	FileHandle *os.File         // ❌ cannot serialize open file descriptors
	NetConn    net.Conn         // ❌ connections not serializable
	Reader     io.Reader        // ❌ interfaces with runtime state
	Writer     io.Writer        // ❌ same reason

	// --- Complex interfaces or untyped data ---
	AnyInterface interface{}    // ⚠️ technically possible, but unsafe (not deterministic)
	CustomFunc   any            // ⚠️ functions inside interfaces are invalid

	// --- Non-deterministic values ---
	RandomValue int             // ⚠️ integers are fine, but if set from random source (e.g. rand.Int()),
	                            // it breaks determinism unless you store it deterministically.
}
```

**recommend to define a struct as the input and output of Workflow and Activity.**

#### How to handle token expiration

Option 1: consider this as normal. we only support short running tasks. If the token expired, we can't retry the task. User should call the API again to create a new task.

pro:

- strictly follow auth mechanism.

con:

- we can't retry the task if the token expired.

Option 2: We can validate the token before we start the workflow. After that, we can generate a system token to call downstream services.

pro:

- we can validate the user permission at the beginning.
- we can retry the task even if the token expired.

con:

- we validate the user permission only at the beginning. If the user permission changed during the workflow execution, we can't catch that.

#### Worker

##### Could a worker run multiple workflows and activities concurrently?

The worker continuously polls the Task Queue from the Temporal Server and executes multiple workflow tasks and activity tasks concurrently using goroutines.

There is a example of how to configure the worker concurrency:

```go
w := worker.New(c, "MY_TASK_QUEUE", worker.Options{
	MaxConcurrentActivityExecutionSize:     10, // run up to 10 activities at once
	MaxConcurrentWorkflowTaskExecutionSize: 50, // run up to 50 workflow tasks at once
	MaxConcurrentActivityTaskPollers:       2,  // 2 goroutines polling activity tasks
	MaxConcurrentWorkflowTaskPollers:       2,  // 2 goroutines polling workflow tasks
})
```

If one worker still can not handle the load, we can start more workers to scale out.

##### Deploy the worker with in the same process of the service or a separate process?

Run your Temporal worker in a separate process (or deployment) from your HTTP / API service.

- Your HTTP service handles short-lived API requests (milliseconds → seconds).
- Your Temporal worker executes long-running workflows or activities (seconds → hours → days).

Mixing them in one process risks:

- Blocking or slowing your API server under heavy workflow load.
- Harder scaling (API CPU vs workflow CPU have different profiles).

Example deployment:

```lua
+------------------+           +----------------+
| HTTP API Service |  --->     | Temporal Server|
+------------------+           +----------------+
        |                            ^
        v                            |
+------------------+                 |
| Temporal Worker  |----------------+
+------------------+
```

#### lifecycle of a workflow

**Big Picture: Temporal Architecture**

```
┌────────────────────────────┐
│     Your Application       │
│ (Client / HTTP Service)    │
└────────────┬───────────────┘
             │  ExecuteWorkflow()
             ▼
┌────────────────────────────┐
│     Temporal Frontend      │  (gRPC API layer)
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│  Temporal Server Core      │
│  • History Service         │
│  • Matching Service        │
│  • Persistence (DB)        │
└────────────┬───────────────┘
             │
             ▼
┌────────────────────────────┐
│         Worker(s)          │
│ (Workflow + Activity code) │
└────────────────────────────┘
```

---

- 1. **Your Service starts a workflow**

```go
we, err := client.ExecuteWorkflow(ctx, client.StartWorkflowOptions{
    ID:        "order-123",
    TaskQueue: "ORDER_TASK_QUEUE",
}, ProcessOrderWorkflow, order)
```

What happens:

1. The **client SDK** sends a `StartWorkflowExecution` gRPC request to the **Frontend service**.
2. The **Frontend** writes a “WorkflowStarted” event to the **History service** (stored in DB).
3. The **Matching service** adds a **workflow task** to the `ORDER_TASK_QUEUE`.

At this point, the workflow **exists**, but nothing has run yet — it’s waiting for a **worker** to pick it up.

- 2. **Worker polls for workflow tasks**

Worker does this continuously in the background:

```go
PollWorkflowTaskQueue()
```

When the **Matching service** has a task in that queue, it returns it to the worker.

What the worker receives:

- Workflow ID
- Run ID
- History events (the workflow’s current state)
- Task token (used to respond back)

---

- 3. **Worker executes your workflow code (deterministically)**

Inside the worker:

- The SDK **replays** all history events locally to reconstruct the workflow state.
- Then it executes your workflow function.
- When the workflow calls an activity:

  ```go
  err := workflow.ExecuteActivity(ctx, ChargeCreditCard, input).Get(ctx, nil)
  ```

  the SDK **does not call your activity directly** — instead, it records a **Command** (`ScheduleActivityTask`) in memory.

---

- 4. **Server schedules activities**

The **History service** records the “ActivityScheduled” event.

The **Matching service** then enqueues a new **ActivityTask** into the same Task Queue (e.g., `ORDER_TASK_QUEUE`).

---

- 5. **Worker polls for activity tasks**

The worker also continuously polls for activity tasks:

```go
PollActivityTaskQueue()
```

When it receives one:

- It runs your registered Go function for that activity.
- It can run multiple activities concurrently (based on your config).

After finishing, it calls:

```go
RespondActivityTaskCompleted()
```

or

```go
RespondActivityTaskFailed()
```

- 6. **Server records activity result**

The **History service** records `ActivityCompleted` or `ActivityFailed` in the workflow’s event history.

Then, it enqueues a **new WorkflowTask** (to continue workflow execution).

- 7. **Worker picks up next WorkflowTask**

The worker gets the new workflow task, replays the updated history, resumes execution after the activity, and continues the workflow logic.

This cycle repeats until:

- The workflow function returns successfully → `WorkflowCompleted`
- Or errors → `WorkflowFailed`
- Or is canceled / timed out

---

##### Worker Determinism (Key Concept)

When a worker restarts, it **replays** all events from the beginning to restore state — this is why **workflow code must be deterministic**.

Example:

- Random numbers or `time.Now()` without workflow APIs would break replay.
- Workflow APIs like `workflow.Now()` and `workflow.SideEffect()` are safe — they record the result into history.

---

##### End State

- **Workflow Execution** is completed in the server.
- The **result** is persisted and can be fetched anytime:

  ```go
  var result OrderResult
  err := we.Get(ctx, &result)
  ```

#### Nexus

##### A example to explain why it's useful

You have two independent teams:
| Team | Namespace | Responsibility | Owns Workflow |
| ---------- | ---------- | ------------------ | ----------------- |
| **Team A** | `payments` | Payment processing | `PaymentWorkflow` |
| **Team B** | `orders` | Order management | `OrderWorkflow` |

Team B’s order workflow needs to call Team A’s payment logic.
Each team runs its own Temporal namespace and has separate workers and permissions.

##### Without Nexus: the Limitation

In plain Temporal, child workflows can only run within the same namespace.
That means your OrderWorkflow (in orders namespace) cannot directly start a PaymentWorkflow (in payments namespace).
You have only two bad options:

- Call Team A’s payment service through an external HTTP or gRPC API, or
- Manually connect to another namespace using the Temporal SDK.

##### With Nexus: the Clean Solution

With Temporal Nexus, Team A can define a Nexus Operation inside the payments namespace:

```go
// In payments namespace
func HandlePayment(ctx context.Context, input PaymentInput) (PaymentOutput, error) {
    // Launch a real workflow or activity
    result, err := workflow.ExecuteChildWorkflow(ctx, PaymentWorkflow, input).Get(ctx, nil)
    return result, err
}
```

Register it as a Nexus operation:

```bash
temporal nexus operation create payments.PaymentService/Charge
```

Then Team B’s OrderWorkflow in the orders namespace can invoke it directly:

```go
output, err := nexus.ExecuteOperation(ctx, nexus.Operation{
    Namespace: "payments",
    Service:   "PaymentService",
    Operation: "Charge",
    Input:     PaymentInput{Amount: 100},
})
if err != nil {
    return err
}
```

Now Team B can call Team A’s logic durably, safely, and observably, without ever exposing HTTP endpoints or credentials.
