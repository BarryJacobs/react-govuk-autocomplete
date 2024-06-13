import { useEffect, useRef, useState, useCallback } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { MenuListProps, GroupBase } from "react-select"
import { LabelValuePair } from "../interfaces"

const OPTION_HEIGHT = 41
const MAX_HEIGHT = 8 * OPTION_HEIGHT

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: ReturnType<typeof setTimeout>
  let lastRan: number
  return function (this: any, ...args: any[]) {
    const context = this
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(
        function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
          }
        },
        limit - (Date.now() - lastRan)
      )
    }
  }
}

export const VirtualMenuList = <T extends LabelValuePair>({
  children: rows,
  ...props
}: MenuListProps<T, false, GroupBase<T>>) => {
  const { focusedOption } = props
  const parentRef = useRef<HTMLDivElement>(null)
  const rowsAreArray = Array.isArray(rows)

  const [scrollSpeed, setScrollSpeed] = useState(0)
  const lastScrollTopRef = useRef(0)
  const lastTimestampRef = useRef(performance.now())

  const calculateScrollSpeed = useCallback(() => {
    const scrollElement = parentRef.current
    if (!scrollElement) return

    const currentScrollTop = scrollElement.scrollTop
    const currentTime = performance.now()

    const scrollDistance = Math.abs(currentScrollTop - lastScrollTopRef.current)
    const timeElapsed = currentTime - lastTimestampRef.current

    if (timeElapsed > 0) {
      const currentScrollSpeed = scrollDistance / timeElapsed
      setScrollSpeed(currentScrollSpeed)
    }

    lastScrollTopRef.current = currentScrollTop
    lastTimestampRef.current = currentTime
  }, [])

  const throttledCalculateScrollSpeed = useCallback(throttle(calculateScrollSpeed, 100), [
    calculateScrollSpeed
  ])

  const virtualizer = useVirtualizer({
    count: (rows as T[]).length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => OPTION_HEIGHT,
    overscan: Math.min(20, Math.max(5, Math.floor(scrollSpeed * 10)))
  })

  useEffect(() => {
    const handleScroll = () => {
      throttledCalculateScrollSpeed()
    }

    const scrollElement = parentRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener("scroll", handleScroll)
      }
    }
  }, [throttledCalculateScrollSpeed])

  useEffect(() => {
    if (focusedOption && rowsAreArray) {
      const focusedIndex = rows.findIndex(x => x.props?.data?.label === focusedOption.label)
      virtualizer.scrollToIndex(Math.max(focusedIndex, 0), { align: "auto" })
    }
  }, [focusedOption, rowsAreArray, rows, virtualizer])

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
