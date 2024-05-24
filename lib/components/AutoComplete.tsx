import { useState, useRef, useEffect, useMemo } from "react"
import Select, {
  components,
  DropdownIndicatorProps,
  NoticeProps,
  GroupBase,
  SingleValue,
  SelectInstance,
  CSSObjectWithLabel,
  InputActionMeta,
  StylesConfig
} from "react-select"
import { LabelValuePair } from "../interfaces"
import { VirtualMenuList } from "./VirtualMenuList"
import CreateableSelect from "react-select/creatable"

import "./AutoComplete.scss"

const DropdownArrow = () => {
  return (
    <svg
      height="20"
      width="20"
      viewBox="0 0 21 21"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false">
      <g stroke="none" fill="none" fillRule="evenodd">
        <polygon fill="#000000" points="0 2 22 2 11 19" />
      </g>
    </svg>
  )
}

interface AutoCompleteProps<T extends LabelValuePair> {
  identifier: string
  label: string
  hint?: string
  error?: string
  isLoading?: boolean
  isDisabled?: boolean
  multiQuestion?: boolean
  placeholder?: string
  required?: boolean
  allowCreate?: boolean
  formatCreateLabel?: (label: string) => string
  useUpperCase?: boolean
  containerClassExt?: string
  labelClassExt?: string
  options: T[]
  value: SingleValue<T> | undefined
  getOptionLabel: (value: T) => string
  onChange: (value: SingleValue<T>, isNew: boolean) => void
}

export const AutoComplete = <T extends LabelValuePair>({
  identifier,
  label,
  hint,
  error,
  placeholder = "",
  required = false,
  containerClassExt = "",
  labelClassExt = "",
  options,
  value,
  multiQuestion = true,
  isLoading = false,
  isDisabled = false,
  allowCreate = false,
  useUpperCase = false,
  formatCreateLabel,
  getOptionLabel,
  onChange
}: AutoCompleteProps<T>) => {
  const [searchTerm, setSearchTerm] = useState(value?.label)
  const [hasUpdatedValue, setHasUpdatedValue] = useState(false)
  const [hasFocus, setHasFocus] = useState(false)
  const selectRef = useRef<SelectInstance<T, false, GroupBase<T>>>(null)

  const containerAttr = {
    className: error
      ? `govuk-body govuk-form-group govuk-form-group-error ${containerClassExt}`
      : `govuk-body govuk-form-group ${containerClassExt}`
  }

  const labelAttr = useMemo(() => {
    let assignedClass = "govuk-label govuk-label--l"
    if (labelClassExt) {
      if (multiQuestion) {
        assignedClass = `govuk-label ${labelClassExt}`
      } else {
        assignedClass = `govuk-label govuk-label--l ${labelClassExt}`
      }
    } else if (multiQuestion) {
      assignedClass = "govuk-label"
    }

    return {
      className: assignedClass,
      id: `${identifier}-label`
    }
  }, [identifier, labelClassExt, multiQuestion])

  const formatCreateLabelHandler = useMemo(() => {
    return (
      formatCreateLabel ||
      ((label: string) => `Use "${useUpperCase ? label.toUpperCase() : label}"`)
    )
  }, [formatCreateLabel, useUpperCase])

  const customStyles: StylesConfig<T, false> = {
    control: (provided: CSSObjectWithLabel) => ({
      ...provided,
      borderColor: error ? "#d4351c !important" : "#0b0c0c"
    }),
    indicatorsContainer: (provided: CSSObjectWithLabel) => ({
      ...provided,
      pointerEvents: "none"
    })
  }

  const NoOptionsMessage = (props: NoticeProps<T, boolean, GroupBase<T>>) => {
    return (
      <components.NoOptionsMessage {...props}>
        <div className="gds-autocomplete__no-options">No results found</div>
      </components.NoOptionsMessage>
    )
  }

  const DropdownIndicator = (props: DropdownIndicatorProps<T, boolean, GroupBase<T>>) => {
    return (
      <components.DropdownIndicator {...props}>
        <DropdownArrow />
      </components.DropdownIndicator>
    )
  }

  const focusHandler = () => {
    selectRef.current?.inputRef?.select()
    setHasFocus(true)
  }

  const blurHandler = () => {
    setHasFocus(false)
  }

  const changeHandler = (selectedValue: SingleValue<T>) => {
    onChange(selectedValue, false)
    setSearchTerm(selectedValue ? selectedValue.label : "")
  }

  const inputChangeHandler = (inputValue: string, { action }: InputActionMeta) => {
    if (action === "input-change") {
      setSearchTerm(useUpperCase ? inputValue.toUpperCase() : inputValue)
    } else if (action === "set-value") {
      setHasUpdatedValue(true)
    }
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " && searchTerm === "") {
      e.preventDefault()
    }
  }

  const createOptionHandler = (label: string) => {
    const newValue = useUpperCase ? label.toUpperCase() : label
    const newOption = {
      label: newValue,
      value: newValue
    } as T
    setSearchTerm(newValue)
    onChange(newOption, true)
  }

  useEffect(() => {
    if (!hasFocus) {
      if (!hasUpdatedValue) {
        if (value) {
          if (searchTerm !== value.label) {
            setSearchTerm(value.label)
          }
        } else {
          setSearchTerm("")
        }
      } else {
        setHasUpdatedValue(false)
      }
    }
  }, [hasFocus, hasUpdatedValue, value, searchTerm])

  useEffect(() => {
    if (selectRef.current && !searchTerm) {
      selectRef.current.focusOption(undefined)
    }
  }, [searchTerm])

  useEffect(() => {
    setSearchTerm(value?.label ?? "")
  }, [value])

  const selectProps = {
    name: identifier,
    required,
    inputId: identifier,
    "aria-invalid": error !== undefined,
    "aria-labelledby": labelAttr.id,
    className: "gds-autocomplete",
    classNamePrefix: "gds-autocomplete",
    styles: customStyles,
    components: {
      DropdownIndicator,
      NoOptionsMessage,
      MenuList: VirtualMenuList<T>
    },
    captureMenuScroll: false,
    isSearchable: true,
    controlShouldRenderValue: false,
    inputValue: searchTerm,
    value,
    onChange: changeHandler,
    onInputChange: inputChangeHandler,
    onKeyDown: keyDownHandler,
    onFocus: focusHandler,
    onBlur: blurHandler,
    placeholder,
    options,
    getOptionLabel,
    isDisabled,
    isLoading
  }

  return (
    <div {...containerAttr}>
      <label htmlFor={identifier} {...labelAttr}>
        {label}
      </label>

      {hint && (
        <div id={`${identifier}-hint`} className="govuk-hint">
          {hint}
        </div>
      )}

      {error && (
        <p id={`${identifier}-error`} className="govuk-error-message">
          <span className="govuk-visually-hidden">Error:</span>
          {error}
        </p>
      )}

      {allowCreate ? (
        <CreateableSelect
          ref={selectRef}
          isMulti={false}
          createOptionPosition="first"
          onCreateOption={createOptionHandler}
          formatCreateLabel={formatCreateLabelHandler}
          {...selectProps}
        />
      ) : (
        <Select ref={selectRef} isMulti={false} {...selectProps} />
      )}
    </div>
  )
}
