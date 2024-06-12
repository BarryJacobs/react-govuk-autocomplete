import { useEffect, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MenuListProps, GroupBase } from "react-select"
import { LabelValuePair } from "../interfaces"

const OPTION_HEIGHT = 41
const MAX_HEIGHT = 8 * OPTION_HEIGHT

export const VirtualMenuList = <T extends LabelValuePair>({
  children: rows,
  ...props
}: MenuListProps<T, false, GroupBase<T>>) => {
  const { focusedOption } = props
  const parentRef = useRef<HTMLDivElement>(null)
  const rowsAreArray = Array.isArray(rows)

  const virtualizer = useVirtualizer({
    count: (rows as unknown[]).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => OPTION_HEIGHT
  })

  useEffect(() => {
    if (focusedOption && rowsAreArray) {
      const focusedIndex = rows.findIndex(x => x.props?.data?.label === focusedOption.label)
      virtualizer.scrollToIndex(Math.max(focusedIndex, 0), { align: "auto" })
    }
  }, [focusedOption])

  if (!rowsAreArray) {
    return <>{rows}</>
  }

  const items = virtualizer.getVirtualItems()
  return (
    <>
      <div
        ref={parentRef}
        style={{
          maxHeight: `${MAX_HEIGHT}px`,
          overflowY: virtualizer.getTotalSize() > MAX_HEIGHT ? "auto" : "hidden"
        }}>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative"
          }}>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${items[0]?.start ?? 0}px)`
            }}>
            {items.map(virtualRow => (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className={
                  virtualRow.index % 2 ? "gds-autocomplete__odd" : "gds-autocomplete__even"
                }>
                <div style={{ borderBottom: "1px solid #b1b4b6" }}>{rows[virtualRow.index]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
