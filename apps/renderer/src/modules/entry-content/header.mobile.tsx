import { ActionButton, MotionButtonBase } from "@follow/components/ui/button/index.js"
import { RootPortal } from "@follow/components/ui/portal/index.js"
import { PresentSheet } from "@follow/components/ui/sheet/Sheet.js"
import { findElementInShadowDOM } from "@follow/utils/dom"
import { clsx, cn } from "@follow/utils/utils"
import { DismissableLayer } from "@radix-ui/react-dismissable-layer"
import { AnimatePresence, m } from "framer-motion"
import { memo, useEffect, useState } from "react"
import { RemoveScroll } from "react-remove-scroll"
import { useEventCallback } from "usehooks-ts"

import { useUISettingKey } from "~/atoms/settings/ui"
import { HeaderTopReturnBackButton } from "~/components/mobile/button"
import { useScrollTracking, useTocItems } from "~/components/ui/markdown/components/hooks"
import { ENTRY_CONTENT_RENDER_CONTAINER_ID } from "~/constants/dom"
import type { EntryActionItem } from "~/hooks/biz/useEntryActions"
import { useEntryActions } from "~/hooks/biz/useEntryActions"
import { useEntry } from "~/store/entry/hooks"

import { useEntryContentScrollToTop, useEntryTitleMeta } from "./atoms"
import type { EntryHeaderProps } from "./header.shared"

function EntryHeaderImpl({ view, entryId, className }: EntryHeaderProps) {
  const entry = useEntry(entryId)
  const actionConfigs = useEntryActions({ entryId, view })

  const entryTitleMeta = useEntryTitleMeta()
  const isAtTop = useEntryContentScrollToTop()

  const hideRecentReader = useUISettingKey("hideRecentReader")

  const shouldShowMeta = (hideRecentReader || !isAtTop) && !!entryTitleMeta?.title

  if (!entry?.entries) return null

  return (
    <div
      data-hide-in-print
      className={cn(
        "relative flex min-w-0 items-center justify-between gap-3 overflow-hidden text-lg text-zinc-500 duration-200 zen-mode-macos:ml-margin-macos-traffic-light-x",
        shouldShowMeta && "border-b border-border",
        "box-content h-14 pt-safe",
        className,
      )}
    >
      <div
        className="relative z-10 flex size-full items-center justify-between gap-3"
        data-hide-in-print
      >
        <div className="pointer-events-none absolute inset-0 flex min-w-0 items-center">
          <AnimatePresence>
            {shouldShowMeta && (
              <m.div
                initial={{ opacity: 0.01, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0.01, y: 30 }}
                className="pointer-events-auto flex w-full min-w-0 shrink gap-2 truncate px-1.5 pl-10 text-sm leading-tight text-theme-foreground"
              >
                <div className="flex min-w-0 grow items-center">
                  <div className="flex min-w-0 shrink items-end gap-1">
                    <span className="min-w-0 shrink truncate font-bold">
                      {entryTitleMeta.title}
                    </span>
                    <i className="i-mgc-line-cute-re size-[10px] shrink-0 translate-y-[-3px] rotate-[-25deg]" />
                    <span className="shrink-0 truncate text-xs opacity-80">
                      {entryTitleMeta.description}
                    </span>
                  </div>
                </div>
                <HeaderRightActions actions={actionConfigs} />
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <HeaderTopReturnBackButton className={"absolute left-0"} />
        <div className="flex-1" />

        <div
          className={clsx(
            "relative flex shrink-0 items-center justify-end gap-3",
            shouldShowMeta && "hidden",
          )}
        >
          {actionConfigs.map((item) => (
            <ActionButton
              icon={item.icon}
              active={item.active}
              shortcut={item.shortcut}
              onClick={item.onClick}
              tooltip={item.name}
              key={item.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const EntryHeader = memo(EntryHeaderImpl)

const HeaderRightActions = ({
  className,
  actions,
}: {
  className?: string
  actions: EntryActionItem[]
}) => {
  const [ctxOpen, setCtxOpen] = useState(false)

  const [markdownElement, setMarkdownElement] = useState<HTMLElement | null>(null)
  const { toc, rootDepth } = useTocItems(markdownElement)

  const getSetMarkdownElement = useEventCallback(() => {
    setMarkdownElement(
      findElementInShadowDOM(`#${ENTRY_CONTENT_RENDER_CONTAINER_ID}`) as HTMLElement,
    )
  })
  useEffect(() => {
    const timeout = setTimeout(getSetMarkdownElement, 1000)
    return () => clearTimeout(timeout)
  }, [getSetMarkdownElement])

  const { currentScrollRange, handleScrollTo } = useScrollTracking(toc, {
    useWindowScroll: true,
  })

  return (
    <div className={clsx(className, "flex items-center gap-2 text-zinc-500")}>
      <PresentSheet
        title="Table of Contents"
        content={
          <ul className="text-sm">
            {toc.map((heading, index) => (
              <li
                key={heading.anchorId}
                className={cn(
                  "flex w-full items-center",
                  currentScrollRange[0] === index && "text-accent",
                )}
                style={{ paddingLeft: `${(heading.depth - rootDepth) * 12}px` }}
              >
                <button
                  className={cn("group flex w-full cursor-pointer justify-between py-1")}
                  type="button"
                  onClick={() => {
                    handleScrollTo(index, heading.$heading, heading.anchorId)
                  }}
                >
                  <span className="text-left duration-200 group-hover:text-accent/80">
                    {heading.title}
                  </span>

                  <span className="ml-4 text-[8px] opacity-50">H{heading.depth}</span>
                </button>
              </li>
            ))}
          </ul>
        }
      >
        <MotionButtonBase
          disabled={toc.length === 0}
          className="center size-8 duration-200 disabled:opacity-50"
        >
          <TableOfContentsIcon className="size-6" />
        </MotionButtonBase>
      </PresentSheet>

      <MotionButtonBase className="center size-8" onClick={() => setCtxOpen((v) => !v)}>
        <i className="i-mingcute-more-1-fill size-6" />
      </MotionButtonBase>

      <RootPortal>
        <AnimatePresence>
          {ctxOpen && (
            <RemoveScroll>
              <DismissableLayer disableOutsidePointerEvents onDismiss={() => setCtxOpen(false)}>
                <m.div
                  initial={{
                    scale: 0.8,
                    opacity: 0,
                    transformOrigin: "top right",
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    transformOrigin: "top right",
                  }}
                  transition={{
                    type: "spring",
                    damping: 20,
                    stiffness: 300,
                    mass: 0.8,
                  }}
                  className="shadow-modal fixed right-1 top-1 z-[1] mt-14 max-w-full rounded-lg border bg-theme-modal-background-opaque"
                >
                  <div className="flex flex-col items-center py-2">
                    {actions.map((item) => (
                      <MotionButtonBase
                        onClick={() => {
                          setCtxOpen(false)
                          item.onClick?.()
                        }}
                        key={item.name}
                        layout={false}
                        className="flex w-full items-center gap-2 px-4 py-2"
                      >
                        {item.icon}
                        {item.name}
                      </MotionButtonBase>
                    ))}
                  </div>
                </m.div>
              </DismissableLayer>
            </RemoveScroll>
          )}
        </AnimatePresence>
      </RootPortal>
    </div>
  )
}
const TableOfContentsIcon = ({ className = "size-6" }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <line x1="4" y1="6" x2="20" y2="6" />

      <line x1="4" y1="12" x2="20" y2="12" strokeWidth="1.5" />
      <line x1="4" y1="18" x2="20" y2="18" strokeWidth="1.5" />

      <line x1="7" y1="12" x2="8" y2="12" strokeWidth="2.5" />
      <line x1="7" y1="18" x2="8" y2="18" strokeWidth="2.5" />
    </svg>
  )
}