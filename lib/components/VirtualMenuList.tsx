import { useEffect, useRef, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MenuListProps, GroupBase } from "react-select"
import { LabelValuePair } from "../interfaces"

const OPTION_HEIGHT = 38
const MAX_HEIGHT = 8 * OPTION_HEIGHT

export const VirtualMenuList = <T extends LabelValuePair>({
  children: rows,
  ...props
}: MenuListProps<T, false, GroupBase<T>>) => {
  const { focusedOption } = props
  const parentRef = useRef<HTMLDivElement>(null)
  const rowsAreArray = Array.isArray(rows)

  const rowVirtualizer = useVirtualizer({
    count: (rows as unknown[]).length,
    getScrollElement: useCallback(() => parentRef.current, [parentRef.current]),
    estimateSize: useCallback(() => OPTION_HEIGHT, [])
  })

  useEffect(() => {
    if (focusedOption && rowsAreArray) {
      const focusedIndex = rows.findIndex(x => x.props?.data?.label === focusedOption.label)
      rowVirtualizer.scrollToIndex(Math.max(focusedIndex, 0), { align: "auto" })
    }
  }, [focusedOption])

  if (!rowsAreArray) {
    return <>{rows}</>
  }

  return (
    <>
      <div
        ref={parentRef}
        style={{
          maxHeight: `${MAX_HEIGHT}px`,
          overflowY: rowVirtualizer.getTotalSize() > MAX_HEIGHT ? "auto" : "hidden"
        }}>
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative"
          }}>
          {rowVirtualizer.getVirtualItems().map(item => (
            <div
              key={item.key}
              className={item.index % 2 ? "gds-autocomplete__even" : ""}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${item.size}px`,
                transform: `translateY(${item.start}px)`
              }}>
              {rows[item.index]}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
