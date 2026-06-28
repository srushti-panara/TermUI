# Docker

`@termuijs/data` provides a `docker` object that wraps the Docker CLI. It calls `docker ps` and `docker stats` and parses the JSON output. Docker must be installed and running on the host; `list()` returns an empty array if Docker is unavailable.

---

## docker.list

Returns all containers (running and stopped) enriched with live resource stats for any that are currently running.

### Signature

```ts
function list(): DockerContainer[]
```

Internally, `list()` runs `docker ps --all` to get container metadata, then runs `docker stats --no-stream` for any running containers and merges the results. Stopped containers have `cpu`, `memPercent`, `memUsed`, `memLimit`, `netRx`, `netTx`, and `pids` set to `0`.

### DockerContainer

```ts
interface DockerContainer {
    id:         string;    // 12-character short ID
    name:       string;
    image:      string;
    status:     string;    // Human-readable status from docker ps
    state:      string;    // Lowercase state: "running", "exited", "paused", etc.
    cpu:        number;    // CPU usage percentage
    memPercent: number;    // Memory usage percentage
    memUsed:    number;    // Memory used in bytes
    memLimit:   number;    // Memory limit in bytes
    netRx:      number;    // Network bytes received
    netTx:      number;    // Network bytes transmitted
    pids:       number;    // Number of processes in the container
}
```

---

## API reference

| Function | Params | Returns | Description |
|---|---|---|---|
| `docker.list()` |, | `DockerContainer[]` | All containers with merged live stats |

---

## Example: Docker dashboard

```ts

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / 1024 ** i).toFixed(1)} ${units[i]}`
}

function DockerDashboard() {
    const { data: containers, loading, error } = usePolling(
        () => Promise.resolve(docker.list()),
        3000
    )

    if (loading) return <Text dim>Connecting to Docker...</Text>
    if (error)   return <Text color="red">Docker error: {error.message}</Text>

    const running = (containers ?? []).filter(c => c.state === 'running')
    const stopped = (containers ?? []).filter(c => c.state !== 'running')

    return (
        <col padding={1}>
            <Text bold>Docker  ({running.length} running, {stopped.length} stopped)</Text>

            <row marginTop={1}>
                <Text width={16} bold>NAME</Text>
                <Text width={24} bold>IMAGE</Text>
                <Text width={10} bold>STATE</Text>
                <Text width={10} bold>CPU</Text>
                <Text width={18} bold>MEMORY</Text>
                <Text width={20} bold>NET RX / TX</Text>
                <Text bold>PIDS</Text>
            </row>

            {(containers ?? []).map(c => (
                <row key={c.id}>
                    <Text width={16}>{c.name}</Text>
                    <Text width={24} dim>{c.image}</Text>
                    <Text
                        width={10}
                        color={c.state === 'running' ? 'green' : 'red'}
                    >
                        {c.state}
                    </Text>
                    <Text width={10}>{c.cpu.toFixed(1)}%</Text>
                    <Text width={18}>
                        {formatBytes(c.memUsed)} / {formatBytes(c.memLimit)}
                    </Text>
                    <Text width={20} dim>
                        {formatBytes(c.netRx)} / {formatBytes(c.netTx)}
                    </Text>
                    <Text dim>{c.pids}</Text>
                </row>
            ))}
        </col>
    )
}
```

---

## Inspecting a single container

`docker.list()` returns every container. Filter the result by `id` or `name` to drive a detail pane.

```ts

function ContainerDetail({ id }: { id: string }) {
    const { data: containers } = usePolling(
        () => Promise.resolve(docker.list()),
        1000
    )

    const c = (containers ?? []).find(x => x.id === id)
    if (!c) return <Text color="red">Container not found.</Text>

    return (
        <col>
            <Text bold>Container: {c.name}</Text>
            <Text>CPU:    {c.cpu.toFixed(2)}%</Text>
            <Text>Memory: {c.memPercent}%  ({c.memUsed} / {c.memLimit} bytes)</Text>
            <Text>Net RX: {c.netRx} bytes</Text>
            <Text>Net TX: {c.netTx} bytes</Text>
            <Text>PIDs:   {c.pids}</Text>
        </col>
    )
}
```

---

## Requirements

- Docker must be installed and the `docker` binary must be on `PATH`.
- The process running your TermUI app must have permission to run `docker ps` and `docker stats`. On Linux this means being in the `docker` group or running as root.
- `docker.list()` can take up to 10 seconds when many containers are running, since it runs `docker stats` for each running container. Use `usePolling` at intervals of 3s or more to avoid stacking calls.

---

## See also

- [System Monitoring](/docs/data/system-monitoring), CPU, memory, disk, network, processes
- [Hooks](/docs/data/hooks), `usePolling` and other reactive hooks
- [Database](/docs/data/database), database connection health
