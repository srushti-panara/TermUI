# System Monitoring

`@termuijs/data` exposes six system data providers and a file-tailing function. Each provider is a plain object with getter properties or methods. Accessing a property samples the value at that moment, so call it inside a render loop or a polling hook to get live readings.

Install the package:

```bash
npm install @termuijs/data
```

---

## cpu

The `cpu` object reads from Node's built-in `os` module and computes a delta between two samples. Readings within 200ms of each other share the same sample, so multiple properties in one render cycle stay consistent.

### Properties

| Property | Type | Description |
|---|---|---|
| `cpu.percent` | `number` | Overall CPU usage, 0–100 |
| `cpu.perCore` | `number[]` | Per-core usage array, 0–100 each |
| `cpu.loadAvg` | `number[]` | Load averages `[1min, 5min, 15min]` |
| `cpu.model` | `string` | CPU model name |
| `cpu.count` | `number` | Number of logical cores |
| `cpu.speed` | `number` | Clock speed in MHz |

### Example

```ts

function CpuPanel() {
    const { data } = usePolling(() => Promise.resolve({
        percent: cpu.percent,
        perCore: cpu.perCore,
        load:    cpu.loadAvg,
    }), 1000)

    return (
        <col>
            <Text>CPU: {data?.percent ?? 0}%</Text>
            <Text dim>Load: {data?.load.join(' / ')}</Text>
            <Text dim>Cores: {data?.perCore.map(p => `${p}%`).join('  ')}</Text>
        </col>
    )
}
```

---

## memory

The `memory` object reads from `os.totalmem()` and `os.freemem()`. Human-readable properties format bytes automatically. Use `memory.raw` when you need byte counts for arithmetic.

### Properties

| Property | Type | Description |
|---|---|---|
| `memory.percent` | `number` | Used memory as a percentage, 0–100 |
| `memory.used` | `string` | Used memory, formatted (e.g. `"3.2 GB"`) |
| `memory.free` | `string` | Free memory, formatted |
| `memory.total` | `string` | Total memory, formatted |
| `memory.raw` | `{ used: number; free: number; total: number }` | Raw byte counts |

### Example

```ts

function MemoryBar() {
    const { data } = usePolling(() => Promise.resolve(memory.raw), 2000)

    const pct = data ? Math.round((data.used / data.total) * 100) : 0

    return (
        <col>
            <Text>Memory: {pct}%</Text>
            <Text dim>{memory.used} / {memory.total}</Text>
        </col>
    )
}
```

---

## disk

The `disk` object runs `df -h` and caches the result for 5 seconds. It parses output on macOS and Linux and skips `devfs` entries.

### Properties

| Property | Type | Description |
|---|---|---|
| `disk.percent` | `number` | Root partition (`/`) usage, 0–100 |
| `disk.main` | `DiskPartition \| null` | Full info for the root partition |
| `disk.partitions` | `DiskPartition[]` | All mounted partitions |

### DiskPartition

```ts
interface DiskPartition {
    filesystem: string;
    size:       string;
    used:       string;
    available:  string;
    percent:    number;
    mountpoint: string;
}
```

### Example

```ts

function DiskPanel() {
    const { data } = usePolling(() => Promise.resolve(disk.partitions), 10_000)

    return (
        <col>
            {(data ?? []).map(p => (
                <row key={p.mountpoint}>
                    <Text width={20}>{p.mountpoint}</Text>
                    <Text>{p.used} / {p.size} ({p.percent}%)</Text>
                </row>
            ))}
        </col>
    )
}
```

---

## network

The `network` object reads from `os.networkInterfaces()`. It returns only external IPv4 interfaces.

### Properties

| Property | Type | Description |
|---|---|---|
| `network.interfaces` | `NetworkInterface[]` | All active external IPv4 interfaces |
| `network.ip` | `string` | Primary IP address, falls back to `"127.0.0.1"` |
| `network.hostname` | `string` | System hostname |

### NetworkInterface

```ts
interface NetworkInterface {
    name:     string;
    address:  string;
    family:   string;
    mac:      string;
    internal: boolean;
}
```

### Example

```ts

function NetworkPanel() {
    return (
        <col>
            <Text>Host: {network.hostname}</Text>
            <Text>IP:   {network.ip}</Text>
            {network.interfaces.map(i => (
                <Text key={i.name} dim>{i.name}: {i.address} ({i.mac})</Text>
            ))}
        </col>
    )
}
```

---

## processes

The `processes` object runs `ps aux` and caches the result for 2 seconds. It returns up to 50 processes sorted by CPU usage.

### API

| Member | Signature | Description |
|---|---|---|
| `processes.top` | `(n?: number) => ProcessInfo[]` | Top N processes by CPU. Default: 10 |
| `processes.list` | `ProcessInfo[]` | Full list, up to 50 entries |
| `processes.count` | `number` | Total number of processes in the list |

### ProcessInfo

```ts
interface ProcessInfo {
    pid:  number;
    name: string;
    cpu:  number;   // percentage
    mem:  number;   // percentage
    user: string;
}
```

### Example

```ts

function ProcessTable() {
    const { data } = usePolling(() => Promise.resolve(processes.top(8)), 2000)

    return (
        <col>
            <row>
                <Text width={8} bold>PID</Text>
                <Text width={20} bold>NAME</Text>
                <Text width={8} bold>CPU</Text>
                <Text width={8} bold>MEM</Text>
            </row>
            {(data ?? []).map(p => (
                <row key={p.pid}>
                    <Text width={8}>{p.pid}</Text>
                    <Text width={20}>{p.name}</Text>
                    <Text width={8}>{p.cpu}%</Text>
                    <Text width={8}>{p.mem}%</Text>
                </row>
            ))}
        </col>
    )
}
```

---

## tail

`tail` watches a file and streams new lines as they are appended. It reads the last N lines on startup and then watches the file with `fs.watchFile` at a 500ms interval. When the file is truncated, it re-reads from the start.

### Signature

```ts
function tail(filePath: string, opts?: TailOptions): TailStream
```

### TailOptions

```ts
interface TailOptions {
    initialLines?: number;   // Lines to read on startup. Default: 20
    maxLines?:     number;   // Max lines kept in buffer. Default: 1000
}
```

### TailStream

```ts
interface TailStream {
    lines:  string[];   // Current buffer
    active: boolean;    // Whether the watcher is running
    stop(): void;       // Stop watching and release the file handle
}
```

Call `stop()` when you no longer need the stream. The watcher is not cleaned up automatically.

### Example

```ts

function LogViewer({ path }: { path: string }) {
    const [lines, setLines] = useState<string[]>([])

    useEffect(() => {
        const stream = tail(path, { initialLines: 30, maxLines: 500 })

        const timer = setInterval(() => {
            setLines([...stream.lines])
        }, 500)

        return () => {
            clearInterval(timer)
            stream.stop()
        }
    }, [path])

    return (
        <col>
            {lines.slice(-20).map((line, i) => (
                <Text key={i} dim={i < lines.length - 5}>{line}</Text>
            ))}
        </col>
    )
}
```

---

## services

The `services` object checks process supervisor status for a list of service names. It tries systemd first (Linux only), falls back to PM2, then falls back to process name matching via `ps aux`.

### API

| Member | Signature | Description |
|---|---|---|
| `services.list` | `(names: string[]) => ServiceInfo[]` | Status for each named service |

### ServiceInfo

```ts
interface ServiceInfo {
    name:          string;
    active:        boolean;
    status:        string;       // substate: "running", "stopped", "online", etc.
    uptime:        string;       // Human-readable uptime, e.g. "3d 2h"
    uptimeSeconds: number;
    restarts:      number;
    cpu:           number;       // percentage
    mem:           number;       // percentage (MB for PM2)
    pid:           number;
    description:   string;
}
```

### Example

```ts

const WATCHED = ['nginx', 'postgres', 'redis']

function ServicesPanel() {
    const { data } = usePolling(
        () => Promise.resolve(services.list(WATCHED)),
        5000
    )

    return (
        <col>
            {(data ?? []).map(s => (
                <row key={s.name}>
                    <Text width={16}>{s.name}</Text>
                    <Text color={s.active ? 'green' : 'red'}>
                        {s.active ? 'up' : 'down'}
                    </Text>
                    <Text dim width={12}>{s.uptime}</Text>
                    <Text dim>CPU {s.cpu}%  MEM {s.mem}%</Text>
                </row>
            ))}
        </col>
    )
}
```

---

## Live system dashboard

Combine all providers to build a full system dashboard. The example below polls each provider at a sensible interval and lays out the results in a grid.

```ts

function SystemDashboard() {
    const { data: sys } = usePolling(() => Promise.resolve({
        cpuPct:  cpu.percent,
        loadAvg: cpu.loadAvg,
        memPct:  memory.percent,
        memUsed: memory.used,
        memTotal: memory.total,
        diskPct: disk.percent,
        diskMain: disk.main,
        ip:      network.ip,
        host:    network.hostname,
    }), 1000)

    const { data: procs } = usePolling(
        () => Promise.resolve(processes.top(5)),
        2000
    )

    const { data: svcs } = usePolling(
        () => Promise.resolve(services.list(['nginx', 'postgres'])),
        5000
    )

    return (
        <col padding={1}>
            <Text bold>System — {sys?.host}</Text>

            <row gap={4}>
                <col>
                    <Text bold>CPU</Text>
                    <Text>{sys?.cpuPct ?? 0}%</Text>
                    <Text dim>Load {sys?.loadAvg.join(' / ')}</Text>
                </col>
                <col>
                    <Text bold>Memory</Text>
                    <Text>{sys?.memPct ?? 0}%</Text>
                    <Text dim>{sys?.memUsed} / {sys?.memTotal}</Text>
                </col>
                <col>
                    <Text bold>Disk /</Text>
                    <Text>{sys?.diskPct ?? 0}%</Text>
                    <Text dim>{sys?.diskMain?.used} / {sys?.diskMain?.size}</Text>
                </col>
                <col>
                    <Text bold>Network</Text>
                    <Text>{sys?.ip}</Text>
                </col>
            </row>

            <Text bold marginTop={1}>Top Processes</Text>
            {(procs ?? []).map(p => (
                <row key={p.pid}>
                    <Text width={24}>{p.name}</Text>
                    <Text>CPU {p.cpu}%  MEM {p.mem}%</Text>
                </row>
            ))}

            <Text bold marginTop={1}>Services</Text>
            {(svcs ?? []).map(s => (
                <row key={s.name}>
                    <Text width={16}>{s.name}</Text>
                    <Text color={s.active ? 'green' : 'red'}>
                        {s.status}
                    </Text>
                    <Text dim>{s.uptime}</Text>
                </row>
            ))}
        </col>
    )
}
```

---

## See also

- [Hooks](/docs/data/hooks), reactive hooks for fetching and streaming
- [Docker](/docs/data/docker), container list and live stats
- [Database](/docs/data/database), connection health and pool metrics
