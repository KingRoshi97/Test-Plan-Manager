# Systems Engineering Best Practices

## High-Performance Systems

### Performance Design Principles
- Measure before optimizing (profile, don't guess)
- Optimize the hot path (the code that runs most frequently)
- Reduce allocations in critical paths (object pooling, stack allocation)
- Minimize copies: use references, slices, and views where possible
- Batch operations for throughput (process N items at once, not one at a time)

### Latency Optimization
- Identify and eliminate unnecessary work on critical path
- Use caching aggressively (L1 > L2 > L3 > memory > disk > network)
- Pre-compute expensive results where access patterns are predictable
- Co-locate data that's accessed together (cache line awareness)
- Minimize system calls and context switches

### Throughput Optimization
- Pipeline processing stages (one stage's output feeds the next)
- Batch I/O operations (write many rows at once, not one by one)
- Use async I/O for I/O-bound workloads (event loop, io_uring)
- Parallel processing for CPU-bound workloads (worker threads, SIMD)
- Back-pressure: slow down producers when consumers can't keep up

## Concurrency and Parallelism

### Concurrency Models
- **Threads**: OS-level parallelism, shared memory, explicit synchronization
- **Async/await**: cooperative multitasking on single thread, good for I/O-bound
- **Actor model**: message-passing between isolated actors, no shared state
- **CSP (Communicating Sequential Processes)**: channels between goroutines/tasks
- Choose based on workload: I/O-bound → async, CPU-bound → threads, complex → actors

### Synchronization Primitives
- **Mutex**: mutual exclusion for shared data (hold briefly, avoid nesting)
- **RWLock**: multiple readers OR single writer (read-heavy workloads)
- **Semaphore**: limit concurrent access to a resource (connection pools)
- **Condition variable**: wait for a condition to be true (producer-consumer)
- **Atomic operations**: lock-free primitives for counters and flags

### Lock-Free Patterns
- Use atomics for simple counters and flags (compare-and-swap)
- Lock-free queues for producer-consumer patterns (MPSC, SPSC)
- Avoid lock-free data structures unless profiling proves locks are bottleneck
- Test thoroughly: lock-free bugs are subtle and hard to reproduce

### Deadlock Prevention
- Lock ordering: always acquire locks in the same order across all code paths
- Lock timeout: give up after a bounded wait (fail rather than deadlock)
- Minimize lock scope: hold locks for the shortest possible duration
- Prefer channels/message passing over shared mutable state

### Thread Pooling
- Size pool to match workload: CPU-bound = number of cores, I/O-bound = cores * ratio
- Use work-stealing for balanced load distribution
- Don't create threads per request (pool reuse is essential)
- Monitor: queue depth, thread utilization, task wait time

## Memory Management

### Allocation Strategies
- Stack allocation for short-lived objects (fastest, automatic cleanup)
- Arena/pool allocation for related objects with same lifetime
- Object pooling for expensive-to-create objects (connections, buffers)
- Avoid heap fragmentation: allocate similar-sized objects together

### Memory Safety
- Use memory-safe languages where possible (Rust, Go, managed languages)
- C/C++: use smart pointers, RAII, sanitizers (ASan, MSan, TSan)
- Bounds checking: validate all array/buffer accesses
- Use-after-free prevention: clear pointers after deallocation, use lifetime tracking

### Memory Profiling
- Track: peak memory usage, allocation rate, leak detection
- Use memory profilers: Valgrind, heaptrack, Instruments (macOS)
- Set memory budgets per component
- Handle memory pressure: shed load, reduce caches, fail gracefully

### Garbage Collection Tuning
- Understand GC pauses and their impact on latency
- Tune heap size (too small = frequent GC, too large = long pauses)
- Use GC-friendly patterns: reuse objects, avoid excessive allocation
- Consider off-heap storage for large data (manual lifecycle management)

## Low-Latency Networking and I/O

### Network Programming
- Use non-blocking I/O for high-connection-count servers
- Event-driven: epoll (Linux), kqueue (macOS/BSD), IOCP (Windows)
- Connection pooling for client-side networking
- TCP tuning: Nagle algorithm (disable for low-latency), keep-alive, buffer sizes

### Protocol Design
- Choose format based on requirements: JSON (readable), protobuf (compact), MessagePack (balanced)
- Frame messages with length prefix or delimiters
- Version protocol from day one (version field in header)
- Handle backward compatibility (new fields optional, old fields preserved)
- Define error responses in protocol specification

### I/O Optimization
- Buffer I/O operations (don't read/write one byte at a time)
- Use memory-mapped files for large file access (mmap)
- Async file I/O where supported (io_uring, IOCP)
- Direct I/O for bypassing OS page cache when appropriate (databases)

## Operating System Interactions

### Process Management
- Fork/exec for child processes, communicate via pipes/sockets/shared memory
- Handle signals: SIGTERM (graceful shutdown), SIGHUP (reload config), SIGINT (interrupt)
- Process supervision: restart on crash (systemd, supervisord)
- Resource limits: set max file descriptors, memory limits, CPU quotas (ulimit, cgroups)

### File System
- Use atomic write patterns (write to temp file, then rename)
- Handle file locking for concurrent access (advisory locks)
- Watch for file changes (inotify, FSEvents, ReadDirectoryChanges)
- Respect file system limitations: path length, filename characters, case sensitivity

### Time and Clock Correctness
- Use monotonic clock for duration measurement (not wall clock)
- Wall clock for timestamps in logs and data (UTC, ISO 8601)
- Handle clock skew in distributed systems (NTP, logical clocks)
- Leap seconds: use POSIX time (smeared) or handle explicitly

## Storage Systems

### Storage Patterns
- Write-ahead log (WAL): durability before applying changes
- Log-structured merge tree (LSM): optimize for write throughput
- B-tree: balanced read/write performance (traditional databases)
- Append-only: immutable history, compaction for space reclamation

### Data Serialization
- **Protobuf**: compact binary, schema-driven, backward-compatible evolution
- **FlatBuffers**: zero-copy access, no parsing overhead
- **MessagePack**: compact binary JSON-like, schema-optional
- **JSON**: human-readable, universal, larger than binary formats
- **CBOR**: binary JSON, self-describing, good for embedded/constrained environments

### Compression
- **LZ4**: fastest compression/decompression, moderate ratio
- **Zstd**: excellent balance of speed and ratio, dictionary support
- **gzip**: universal compatibility, moderate speed
- Choose based on: access pattern (random vs sequential), CPU budget, compression ratio needs

## Fault Tolerance

### Failure Modes
- Crash failures: process dies (detection: health check, heartbeat)
- Byzantine failures: process produces incorrect results (detection: checksums, quorum)
- Transient failures: temporary network/disk errors (mitigation: retry with backoff)
- Cascading failures: one failure triggers others (mitigation: circuit breakers, bulkheads)

### Resilience Patterns
- **Circuit breaker**: stop calling failing service, allow recovery time
- **Bulkhead**: isolate failures to a subsystem (separate thread pools, resource limits)
- **Retry with backoff**: retry transient failures with increasing delays and jitter
- **Timeout**: bound all external calls, fail fast on timeout
- **Fallback**: degrade gracefully when a dependency is unavailable

### Distributed Systems Fundamentals
- CAP theorem: choose consistency vs. availability during partition
- Eventual consistency: system converges to consistent state given no new updates
- Consensus: Raft, Paxos for leader election and state replication
- Idempotency: make operations safe to retry (use idempotency keys)

### Graceful Degradation Under Load
- Load shedding: reject excess requests with 503 (better than slow responses for all)
- Backpressure: signal upstream to slow down (queue depth limits, flow control)
- Priority queues: process critical requests first during overload
- Feature degradation: disable non-essential features under load

## Performance Profiling and Benchmarking

### Profiling Tools
- CPU profiler: identify hot functions and call paths (perf, Instruments, pprof)
- Memory profiler: track allocations and leaks (Valgrind, heaptrack)
- I/O profiler: identify disk/network bottlenecks (strace, dtrace)
- Flame graphs: visualize CPU or memory usage by call stack

### Benchmarking
- Benchmark representative workloads (not microbenchmarks in isolation)
- Use statistical methods: run multiple iterations, report median and percentiles
- Control variables: same hardware, same data, warm caches
- Regression testing: compare against baseline in CI (detect performance regressions)
- Set performance budgets and gate releases on meeting them

### Load Testing
- Simulate realistic traffic patterns (ramp up, sustained, spike)
- Test at 2-3x expected peak load
- Identify: maximum throughput, latency at percentiles, breaking point
- Monitor system resources during test (CPU, memory, disk I/O, network)

## Security at the Systems Layer

### Memory Safety
- Prefer memory-safe languages (Rust eliminates entire classes of vulnerabilities)
- C/C++: use sanitizers in CI (AddressSanitizer, MemorySanitizer, ThreadSanitizer)
- Bounds checking on all buffer operations
- Stack canaries and ASLR for compiled binaries

### Sandboxing and Isolation
- Principle of least privilege: minimal permissions for each process
- Containers: namespace and cgroup isolation
- Seccomp: restrict available system calls
- Capabilities: fine-grained privilege assignment (instead of running as root)

### Secure Communication
- TLS 1.3 for all network communication (mutual TLS for internal services)
- Certificate management: automated rotation (Let's Encrypt, cert-manager)
- Private key protection: HSM or secure key storage
- Network segmentation: restrict which services can communicate

## Reliability Engineering

### Testing for Reliability
- Race condition detection: ThreadSanitizer, Go race detector, Rust borrow checker
- Fuzz testing: random input generation to find crashes and panics
- Chaos testing: inject failures in production-like environment
- Soak testing: run under sustained load for hours/days (detect slow leaks)
- Performance regression testing: automated benchmarks in CI

### Deterministic Testing
- Seed random number generators for reproducible tests
- Mock time for time-dependent logic
- Use in-memory I/O for filesystem tests
- Deterministic concurrency testing (interleave threads deterministically)

### Hardware Integration
- GPU compute: CUDA, OpenCL, Vulkan Compute for parallel workloads
- Network accelerators: DPDK, io_uring for high-throughput networking
- Storage: NVMe direct access for lowest latency
- Monitor hardware health: temperature, error rates, SMART data
