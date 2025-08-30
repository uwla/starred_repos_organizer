import { ChangeEvent } from "react"

import { Form, Stack } from "react-bootstrap"

import "./Select.css"

interface Props {
    text: string
    values: string[]
    selected: string
    onSelect: (value: string) => void
}

function Select(props: Props) {
    const { values, onSelect, text, selected } = props

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onSelect(e.target.value)
    }

    return (
        <Stack
            direction="horizontal"
            className="sort-options"
        >
            <p>{text}</p>
            <Form.Select
                onChange={handleChange}
                value={selected}
            >
                {values.map((value: string) => {
                    return (
                        <option
                            key={value}
                            value={value}
                        >
                            {value}
                        </option>
                    )
                })}
            </Form.Select>
        </Stack>
    )
}

export default Select
