# Database

`@termuijs/data` provides a `database` object for monitoring database connectivity and connection pool usage. It supports **PostgreSQL** and **MySQL**.

---

## How it works

`database.ping` opens a TCP socket to measure connection latency. If the socket connects, it then tries CLI tools (`psql` / `pg_isready` for Postgres, `mysql` / `mysqladmin` for MySQL) to fetch pool metrics. Pool fields are `null` when the CLI tools are not available or credentials are missing.

---

## Supported databases

| Database | Type value | CLI tools used |
|---|---|---|
| PostgreSQL | `"postgres"` | `pg_isready`, `psql` |
| MySQL | `"mysql"` | `mysqladmin ping`, `mysql` |

---

## Configuration

```ts
interface DatabaseConfig {
    type:      'postgres' | 'mysql';
    host:      string;
    port:      number;
    database?: string;    // Used by psql as PGDATABASE
    username?: string;    // Used as PGUSER or -u flag
    password?: string;    // MySQL only: passed as -p<password>
}
```

For PostgreSQL, credentials can also come from standard environment variables (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`). Pass them only in `DatabaseConfig` if you need to override the environment.

---

## database.ping

Pings a database and returns a `DatabaseHealth` snapshot.

### Signature

```ts
async function ping(config: DatabaseConfig): Promise<DatabaseHealth>
```

`ping` is async. It times out the TCP connection after 5 seconds. If the TCP connection fails, it returns immediately with `connected: false` and `null` pool fields.

### DatabaseHealth

```ts
interface DatabaseHealth {
    connected:         boolean;
    latencyMs:         number;          // TCP round-trip in milliseconds
    activeConnections: number | null;   // null if CLI tools unavailable
    maxConnections:    number | null;   // null if CLI tools unavailable
    poolPercent:       number | null;   // activeConnections / maxConnections * 100
}
```

---

## API reference

| Function | Params | Returns | Description |
|---|---|---|---|
| `database.ping(config)` | `config: DatabaseConfig` | `Promise<DatabaseHealth>` | TCP ping + optional pool metrics |

---

## Example: database health component

```ts

const pgConfig: DatabaseConfig = {
    type:     'postgres',
    host:     process.env.DB_HOST ?? 'localhost',
    port:     5432,
    database: process.env.DB_NAME ?? 'myapp',
    username: process.env.DB_USER,
}

const mysqlConfig: DatabaseConfig = {
    type:     'mysql',
    host:     process.env.MYSQL_HOST ?? 'localhost',
    port:     3306,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
}

function DbHealth({ label, config }: { label: string; config: DatabaseConfig }) {
    const { data, loading } = usePolling(
        () => database.ping(config),
        10_000
    )

    if (loading) return <Text dim>{label}: checking...</Text>

    const h = data as DatabaseHealth | null
    if (!h)          return <Text dim>{label}: --</Text>
    if (!h.connected) return <Text color="red">{label}: unreachable</Text>

    const pool = h.poolPercent !== null
        ? ` | pool ${h.poolPercent}% (${h.activeConnections}/${h.maxConnections})`
        : ''

    return (
        <Text color="green">
            {label}: {h.latencyMs}ms{pool}
        </Text>
    )
}

function DatabasePanel() {
    return (
        <col padding={1}>
            <Text bold>Databases</Text>
            <DbHealth label="Postgres" config={pgConfig} />
            <DbHealth label="MySQL"    config={mysqlConfig} />
        </col>
    )
}
```

---

## Pool metrics availability

Pool metrics require CLI tools to be on `PATH` and able to connect with the supplied credentials.

| Database | Connected check | Active connections query | Max connections query |
|---|---|---|---|
| Postgres | `pg_isready -h HOST -p PORT` | `SELECT count(*) FROM pg_stat_activity` | `SHOW max_connections` |
| MySQL | `mysqladmin ping` | `SELECT COUNT(*) FROM information_schema.processlist` | `SHOW VARIABLES LIKE 'max_connections'` |

When the CLI tools are absent or authentication fails, `activeConnections`, `maxConnections`, and `poolPercent` are `null`. `connected` and `latencyMs` are always populated as long as the TCP connection succeeds.

---

## Polling interval guidance

`database.ping` opens a TCP socket and runs two CLI queries per call. A 10-second interval works well for most dashboards. Lower intervals increase database load and may skew `activeConnections` counts.

---

## See also

- [System Monitoring](/docs/data/system-monitoring), CPU, memory, disk, network, processes
- [Docker](/docs/data/docker), container list and live stats
- [Hooks](/docs/data/hooks), `usePolling` and other reactive hooks
