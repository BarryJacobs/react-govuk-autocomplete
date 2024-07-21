import { render, screen, waitFor, act } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { configureAxe, toHaveNoViolations } from "jest-axe"
import { AutoComplete } from "../AutoComplete"
import userEvent from "@testing-library/user-event"

expect.extend(toHaveNoViolations)

Object.defineProperty(Element.prototype, "getBoundingClientRect", {
  configurable: true,
  value: vi.fn(() => {
    return {
      width: 120,
      height: 120,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      x: 0,
      y: 0,
      toJSON: () => {}
    }
  })
})

const mockOnChange = vi.fn()

const cars = [
  { label: "BMW", value: "01" },
  { label: "Ferrari", value: "02" },
  { label: "Toyota", value: "03" }
]

describe("AutoComplete", () => {
  afterEach(() => vi.restoreAllMocks())

  it("must not fail any accessibility tests by default", async () => {
    const { container } = render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
      />
    )

    const axe = configureAxe()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("must not fail any accessibility tests with all options configured", async () => {
    const { container } = render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        labelClassExt="govuk-label--s"
        containerClassExt="govuk-input--width-20"
        options={cars}
        value={null}
        onChange={mockOnChange}
        error={"error"}
        hint={"hint"}
        placeholder={"placeholder"}
        isDisabled={false}
        isLoading={false}
      />
    )

    const axe = configureAxe()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("must not fail any accessibility tests when loading and disabled", async () => {
    const { container } = render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        labelClassExt="govuk-label--s"
        containerClassExt="govuk-input--width-20"
        options={cars}
        value={null}
        onChange={mockOnChange}
        error={"error"}
        hint={"hint"}
        placeholder={"placeholder"}
        isDisabled={true}
        isLoading={true}
      />
    )

    const axe = configureAxe()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it("must render correctly by default", async () => {
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
      />
    )

    const autoComplete = await screen.findByRole("combobox")
    expect(autoComplete).toBeInTheDocument()
    expect(autoComplete).toHaveClass("gds-autocomplete__input")
    expect(autoComplete).toHaveAttribute("id", "cars")
    expect(autoComplete).toHaveAttribute("aria-invalid", "false")
  })

  it("must call onChange when an option is selected", async () => {
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        allowCreate={true}
        onChange={mockOnChange}
      />
    )

    const autoComplete = screen.getByLabelText("Cars")
    await act(async () => {
      await userEvent.click(autoComplete)
    })

    await act(async () => {
      await userEvent.type(autoComplete, "{enter}")
    })

    expect(mockOnChange.mock.calls.length).toEqual(1)
    expect(mockOnChange.mock.calls[0]).toEqual([
      {
        label: "BMW",
        value: "01"
      },
      false
    ])
  })

  it("must render creatable select correctly by default", async () => {
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        allowCreate={true}
        options={cars}
        value={null}
        onChange={mockOnChange}
      />
    )

    const autoComplete = await screen.findByRole("combobox")
    expect(autoComplete).toBeInTheDocument()
    expect(autoComplete).toHaveClass("gds-autocomplete__input")
    expect(autoComplete).toHaveAttribute("id", "cars")
    expect(autoComplete).toHaveAttribute("aria-invalid", "false")

    await act(async () => {
      await userEvent.type(autoComplete, "New option")
    })

    await waitFor(() => {
      expect(screen.getByText(`Use "New option"`)).toBeInTheDocument()
    })
  })

  it("must render creatable select correctly with custom format create label function", async () => {
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        allowCreate={true}
        formatCreateLabel={(label: string) => `Custom message "${label}"`}
        options={cars}
        value={null}
        onChange={mockOnChange}
      />
    )

    const autoComplete = await screen.findByRole("combobox")
    expect(autoComplete).toBeInTheDocument()

    await act(async () => {
      await userEvent.type(autoComplete, "New option")
    })

    await waitFor(() => {
      expect(screen.getByText(`Custom message "New option"`)).toBeInTheDocument()
    })
  })

  it("must render correctly when error is provided", async () => {
    const errorText = "This is an error"
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
        error={errorText}
      />
    )

    const autoComplete = await screen.findByRole("combobox")
    expect(autoComplete).toBeInTheDocument()
    expect(autoComplete).toHaveAttribute("aria-invalid", "true")

    const error = await screen.findByText(errorText)
    expect(error).toBeInTheDocument()
    expect(error).toHaveClass("govuk-error-message")
    expect(error).toHaveAttribute("id", "cars-error")
  })

  it("must render correctly when hint is provided", async () => {
    const hintText = "This is a hint"
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
        hint={hintText}
      />
    )

    const error = await screen.findByText(hintText)
    expect(error).toBeInTheDocument()
    expect(error).toHaveClass("govuk-hint")
    expect(error).toHaveAttribute("id", "cars-hint")
  })

  it("must apply labelClassExt to label element", async () => {
    const labelClassExt = "custom-label"
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
        labelClassExt={labelClassExt}
      />
    )

    const label = screen.getByText("Cars").closest("label")
    expect(label).toHaveClass(labelClassExt)
  })

  it("must apply containerClassExt to label element", async () => {
    const containerClassExt = "custom-container"
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
        containerClassExt={containerClassExt}
      />
    )

    const label = screen.getByText("Cars").closest(".govuk-form-group")
    expect(label).toHaveClass("govuk-form-group", containerClassExt)
  })

  it("must display no results found when no options match", async () => {
    render(
      <AutoComplete
        identifier="cars"
        label="Cars"
        options={cars}
        value={null}
        onChange={mockOnChange}
      />
    )

    const autoComplete = screen.getByLabelText("Cars")
    await act(async () => {
      await userEvent.type(autoComplete, "No option here")
    })

    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })
})
