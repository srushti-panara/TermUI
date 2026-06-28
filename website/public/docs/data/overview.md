# @termuijs/data
Real-time system statistics for terminal apps, CPU usage, memory, disk, network throughput, running processes, and HTTP endpoint health.

No native dependencies. Works on macOS, Linux, and Windows (where supported by the underlying Node.js `os` module).
## Installation
```ts
npm install @termuijs/data
```
## Two layers
The package provides two ways to access metrics:

**Raw collectors**, getter properties you read whenever you want a snapshot. No cleanup needed, but you manage the polling yourself.

**Reactive hooks**, use inside JSX components. They poll automatically at a configurable interval and clean up their timers when the component unmounts.
## Raw API
The `cpu`, `memory`, `disk`, and `network` objects expose getters. Read a property to take a fresh sample.
```ts

const cpuPct  = cpu.percent       // number 0–100
const cores   = cpu.perCore       // number[] per-core usage
const memPct  = memory.percent    // number 0–100
const memUsed = memory.used       // string, e.g. "8.2 GB"
const memRaw  = memory.raw        // { used, free, total } in bytes
const diskPct = disk.percent      // number 0–100 for "/"
const ifaces  = network.interfaces // NetworkInterface[]
const ip      = network.ip        // string
```
### Hook return types
The hooks return these shapes. Read each field directly.
| Type             | Fields                                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CpuMetrics`     | `percent: number` (0–100), `perCore: number[]`, `loadAvg: number[]`, `model: string`, `count: number`, `speed: number`                                                      |
| `MemoryMetrics`  | `percent: number`, `used: string`, `free: string`, `total: string` (formatted), `raw: { used, free, total }` (bytes)                                                        |
| `DiskMetrics`    | `percent: number`, `partitions: DiskPartition[]`, `main: DiskPartition | null`                                                                                              |
| `NetworkMetrics` | `interfaces: NetworkInterface[]`, `ip: string`, `hostname: string`                                                                                                          |
| `SystemInfo`     | `platform: string`, `release: string`, `type: string`, `hostname: string`, `uptime: string`, `uptimeSeconds: number`, `user: string`, `arch: string`, `nodeVersion: string` |

## Reactive hooks
Call these inside JSX components. They poll at `intervalMs` and return the latest value each time they fire. Timer cleanup happens automatically on component unmount.
### useCpu
```ts

function CpuMonitor() {
    const metrics = useCpu(500)   // refresh every 500ms

    return (
        <col>
            <gauge label="CPU" value={metrics.percent / 100} />
            <Text dim>{metrics.model}</Text>
        </col>
    )
}
```
### useMemory
```ts
const mem = useMemory(1000)
return <gauge label="MEM" value={mem.percent / 100} />
```
### useDisk
```ts
const disk = useDisk(5000)   // disk doesn't change fast — 5s is fine
return <gauge label="Disk" value={disk.percent / 100} />
```
### useNetwork
```ts
const net = useNetwork(1000)
return (
    <col>
        <Text>IP: {net.ip}</Text>
        {net.interfaces.map((i) => (
            <Text key={i.name} dim>{i.name} {i.address}</Text>
        ))}
    </col>
)
```
### useTopProcesses
Returns the top `n` processes sorted by CPU usage:
```ts

function ProcessTable() {
    const procs = useTopProcesses(10, 2000)  // top 10, refresh every 2s

    return (
        | Hook              | Signature                               | Returns          |
| ----------------- | --------------------------------------- | ---------------- |
| `useCpu`          | `(intervalMs?: number)`                 | `CpuMetrics`     |
| `useMemory`       | `(intervalMs?: number)`                 | `MemoryMetrics`  |
| `useDisk`         | `(intervalMs?: number)`                 | `DiskMetrics`    |
| `useNetwork`      | `(intervalMs?: number)`                 | `NetworkMetrics` |
| `useTopProcesses` | `(n: number, intervalMs?: number)`      | `ProcessInfo[]`  |
| `useSystemInfo`   | `()`                                    | `SystemInfo`     |
| `useHttpHealth`   | `(urls: string[], intervalMs?: number)` | `HealthResult[]` |

All interval hooks default to `1000ms` if `intervalMs` is not provided.
## Memory leak note
Hooks clean up their `useInterval` timers automatically when the component unmounts. Raw collector functions do not start any timers, they're pure reads, no cleanup needed.

## See also

- [Widgets: Charts](/docs/widgets/charts), LineChart, HeatMap, BarChart, Sparkline for visualizing metrics
- [@termuijs/quick](/docs/guides/quick), `useCpu`, `useMemory` etc. are re-exported from quick for rapid prototyping
