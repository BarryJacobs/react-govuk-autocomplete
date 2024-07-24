import { useState, useRef, useEffect, useMemo, useImperativeHandle, forwardRef } from "react"
import Select, {
  components,
  DropdownIndicatorProps,
  NoticeProps,
  OptionProps,
  GroupBase,
  SingleValue,
  SelectInstance,
  CSSObjectWithLabel,
  InputActionMeta,
  StylesConfig,
  createFilter
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

const NoOptionsMessage = (
  props: NoticeProps<LabelValuePair, boolean, GroupBase<LabelValuePair>>
) => {
  return (
    <components.NoOptionsMessage {...props}>
      <div className="gds-autocomplete__no-options">No results found</div>
    </components.NoOptionsMessage>
  )
}

const DropdownIndicator = (
  props: DropdownIndicatorProps<LabelValuePair, boolean, GroupBase<LabelValuePair>>
) => {
  return (
    <components.DropdownIndicator {...props}>
      <DropdownArrow />
    </components.DropdownIndicator>
  )
}

const Option = ({ children, ...props }: OptionProps<LabelValuePair, false>) => {
  const { onMouseMove, onMouseOver, ...rest } = props.innerProps
  const newProps = { ...props, innerProps: rest }
  return <components.Option {...newProps}>{children}</components.Option>
}

interface AutoCompleteProps {
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
  errorClassExt?: string
  options: LabelValuePair[]
  value: SingleValue<LabelValuePair> | undefined
  onChange: (value: SingleValue<LabelValuePair>, isNew: boolean) => void
}

const AutoCompleteComponent = (
  {
    identifier,
    label,
    hint,
    error,
    placeholder = "",
    required = false,
    containerClassExt = "",
    labelClassExt = "",
    errorClassExt = "",
    options,
    value,
    multiQuestion = true,
    isLoading = false,
    isDisabled = false,
    allowCreate = false,
    useUpperCase = false,
    formatCreateLabel,
    onChange
  }: AutoCompleteProps,
  ref: React.Ref<SelectInstance<LabelValuePair, false, GroupBase<LabelValuePair>> | undefined>
) => {
  const [searchTerm, setSearchTerm] = useState(value?.label)
  const selectRef = useRef<SelectInstance<LabelValuePair, false, GroupBase<LabelValuePair>>>(null)
  useImperativeHandle(ref, () => selectRef.current || undefined)

  const containerAttr = {
    className: error
      ? `govuk-body govuk-form-group govuk-form-group--error ${containerClassExt}`
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

  const customStyles: StylesConfig<LabelValuePair, false> = useMemo(
    () => ({
      control: (provided: CSSObjectWithLabel) => ({
        ...provided,
        borderColor: error ? "#d4351c !important" : "#0b0c0c"
      }),
      indicatorsContainer: (provided: CSSObjectWithLabel) => ({
        ...provided,
        pointerEvents: "none"
      })
    }),
    [error]
  )

  const focusHandler = () => {
    selectRef.current?.inputRef?.select()
  }

  const blurHandler = () => {
    const matchingSearchValue = options.find(x => x.label === searchTerm)
    if (matchingSearchValue && matchingSearchValue !== value) {
      onChange(matchingSearchValue, false)
    }
  }

  const changeHandler = (selectedValue: SingleValue<LabelValuePair>) => {
    onChange(selectedValue, false)
    if (selectedValue) {
      setSearchTerm(selectedValue.label)
    }
  }

  const inputChangeHandler = (inputValue: string, { action }: InputActionMeta) => {
    if (action === "input-change") {
      setSearchTerm(useUpperCase ? inputValue.toUpperCase() : inputValue)
      if (selectRef.current?.hasValue()) {
        selectRef.current?.clearValue()
        onChange(null, false)
      }
    }
  }

  const keyDownHandler = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " && searchTerm === "") {
      e.preventDefault()
    }
  }

  const createOptionHandler = (label: string) => {
    const newValue = useUpperCase ? label.toUpperCase() : label
    const newOption: LabelValuePair = {
      label: newValue,
      value: newValue
    }
    setSearchTerm(newValue)
    onChange(newOption, true)
  }

  useEffect(() => {
    if (selectRef.current) {
      if (error || hint) {
        selectRef.current.inputRef?.setAttribute(
          "aria-describedby",
          `${error ? `${identifier}-error` : ""} ${hint ? `${identifier}-hint` : ""}`.trim()
        )
      } else {
        selectRef.current.inputRef?.removeAttribute("aria-describedby")
      }
    }
  }, [identifier, hint, error])

  useEffect(() => {
    selectRef.current?.focusOption("first")
  }, [searchTerm])

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
      MenuList: VirtualMenuList,
      Option
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
        <div id={`${identifier}-error`} className={`govuk-error-message ${errorClassExt}`}>
          <span className="govuk-visually-hidden">Error:</span>
          {error}
        </div>
      )}

      {allowCreate ? (
        <CreateableSelect
          ref={selectRef}
          isMulti={false}
          createOptionPosition="first"
          onCreateOption={createOptionHandler}
          filterOption={createFilter({ ignoreAccents: false })}
          formatCreateLabel={formatCreateLabelHandler}
          {...selectProps}
        />
      ) : (
        <Select
          ref={selectRef}
          isMulti={false}
          filterOption={createFilter({ ignoreAccents: false })}
          {...selectProps}
        />
      )}
    </div>
  )
}

export const AutoComplete = forwardRef<
  SelectInstance<LabelValuePair, false, GroupBase<LabelValuePair>> | undefined,
  AutoCompleteProps
>(AutoCompleteComponent)
