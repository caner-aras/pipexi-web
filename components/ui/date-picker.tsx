"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  formatDatePickerLabel,
  formatLocalDateKey,
  parseDateKey,
} from "@/lib/date-format"
import { cn } from "@/lib/utils"

type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  id?: string
  className?: string
  buttonClassName?: string
  showIcon?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function DatePicker({
  value,
  onChange,
  disabled,
  id,
  className,
  buttonClassName,
  showIcon = false,
  open: openProp,
  onOpenChange,
}: DatePickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = openProp ?? uncontrolledOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next)
      if (openProp === undefined) {
        setUncontrolledOpen(next)
      }
    },
    [onOpenChange, openProp]
  )

  const rootRef = React.useRef<HTMLDivElement>(null)
  const popupRef = React.useRef<HTMLDivElement>(null)
  const selectedDate = parseDateKey(value)
  const canPortal = typeof document !== "undefined"

  const updatePosition = React.useCallback(() => {
    const root = rootRef.current
    const popup = popupRef.current
    if (!root || !popup) {
      return
    }

    const rect = root.getBoundingClientRect()
    const popupHeight = popup.offsetHeight
    const popupWidth = popup.offsetWidth
    const gap = 6
    const viewportPadding = 8

    let top = rect.bottom + gap
    if (top + popupHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - gap - popupHeight)
    }

    let left = rect.left
    if (left + popupWidth > window.innerWidth - viewportPadding) {
      left = Math.max(
        viewportPadding,
        window.innerWidth - popupWidth - viewportPadding
      )
    }

    popup.style.top = `${top}px`
    popup.style.left = `${left}px`
  }, [])

  React.useLayoutEffect(() => {
    if (!open) {
      return
    }

    updatePosition()
    const frame = requestAnimationFrame(updatePosition)

    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open, updatePosition])

  React.useEffect(() => {
    if (!open) {
      return
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node
      if (rootRef.current?.contains(target)) {
        return
      }
      if (popupRef.current?.contains(target)) {
        // Keep the parent Dialog from treating calendar clicks as outside.
        event.stopPropagation()
        return
      }
      setOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation()
        setOpen(false)
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown, true)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown, true)
    }
  }, [open, setOpen])

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        id={id}
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start font-normal",
          showIcon && "gap-2",
          buttonClassName
        )}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        {showIcon ? (
          <CalendarDays className="size-4 text-muted-foreground" />
        ) : null}
        {formatDatePickerLabel(value)}
      </Button>

      {canPortal && open
        ? createPortal(
            <div
              ref={popupRef}
              role="dialog"
              aria-modal="false"
              data-slot="date-picker-popup"
              className="fixed top-0 left-0 z-[100] animate-in fade-in-0 zoom-in-95"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={(date) => {
                  if (!date) {
                    return
                  }

                  onChange(formatLocalDateKey(date))
                  setOpen(false)
                }}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

export { DatePicker }
