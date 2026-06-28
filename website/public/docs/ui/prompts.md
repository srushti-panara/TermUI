# Imperative Prompts
The `prompt` object in `@termuijs/ui` lets you request user input from a CLI script without a full TUI app. It uses Node's `readline` and needs no widget stack. Each method returns a Promise. Await it and get the response.

Every method takes a single options object. The `message` field is required. Each method throws `NonInteractiveError` when stdin is not a TTY.
## The three prompts
```ts

// Free-form text entry
const name = await prompt.text({ message: 'What is your name?' })

// Yes/no confirmation
const ok = await prompt.confirm({ message: 'Delete this file?' })

// Pick one from a list
const color = await prompt.select({
    message: 'Choose a color:',
    options: [
        { label: 'red', value: 'red' },
        { label: 'green', value: 'green' },
        { label: 'blue', value: 'blue' },
    ],
})
```
## prompt.text(options)
Shows a text input. Resolves with the entered string when the user presses Enter. An empty answer resolves with `default` if set, otherwise an empty string.
```ts
const username = await prompt.text({
    message:     'Username:',
    placeholder: 'e.g. alice',
    default:     'guest',
})
```
| Option        | Type                               | Description                                                      |
| ------------- | ---------------------------------- | ---------------------------------------------------------------- |
| `message`     | `string`                           | Prompt label (required)                                          |
| `placeholder` | `string`                           | Hint text shown in brackets after the label                      |
| `default`     | `string`                           | Value used when the answer is empty                              |
| `validate`    | `(value: string) => string | null` | Return an error string to reject and re-ask, or `null` to accept |

## prompt.confirm(options)
Shows a yes/no question. Resolves with `true` for yes, `false` for no. An empty answer resolves with `default` when set.
```ts
const shouldProceed = await prompt.confirm({
    message: 'This will overwrite your config. Continue?',
    default: false,    // empty answer resolves to false
})

if (shouldProceed) {
    writeConfig(newSettings)
}
```
| Option    | Type      | Description                                              |
| --------- | --------- | -------------------------------------------------------- |
| `message` | `string`  | Prompt label (required)                                  |
| `default` | `boolean` | Result for an empty answer. Sets the `Y/n` or `y/N` hint |

## prompt.select(options)
Prints a numbered list. The user types the number of their choice and presses Enter:
```ts
const action = await prompt.select({
    message: 'What do you want to do?',
    options: [
        { label: 'Create new project', value: 'create' },
        { label: 'Open existing project', value: 'open' },
        { label: 'Settings', value: 'settings' },
        { label: 'Quit', value: 'quit' },
    ],
})
// action is the value of the chosen option
```
Each option is an object with `label` and `value`. The result is the `value`, not the label. Set `default` to the value used for an empty answer:
```ts
const env = await prompt.select({
    message: 'Environment:',
    options: [
        { label: 'Development', value: 'dev' },
        { label: 'Staging',     value: 'staging' },
        { label: 'Production',  value: 'prod' },
    ],
    default: 'dev',
})
```
| Option    | Type     | Description                        |
| --------- | -------- | ---------------------------------- |
| `message` | `string` | Prompt label (required)            |
| `options` | `Array`  | Choices to list (required)         |
| `default` | `T`      | Value returned for an empty answer |

## Non-interactive environments
The prompts read from stdin through `readline`. If stdin is not a TTY, each method throws `NonInteractiveError`. Catch it to fall back to defaults in scripts and CI:
```ts

try {
    const name = await prompt.text({ message: 'Project name:' })
    createProject(name)
} catch (err) {
    if (err instanceof NonInteractiveError) {
        createProject('my-app')   // fall back to a default
    } else {
        throw err
    }
}
```

## See also

- [Notifications](/docs/ui/notifications), non-blocking toasts for feedback that doesn't require input
- [UI Inputs](/docs/ui/inputs), PasswordInput, NumberInput, PathInput for inline input in forms
