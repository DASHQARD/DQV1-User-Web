import React from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'

import { cn, Icon } from '@/libs'

import { Text } from '../Text'

type Props = Readonly<{
  children: React.ReactNode
  showClose?: boolean
  isOpen: boolean
  setIsOpen: (o: boolean) => void
  position?: 'center' | 'side'
  title?: string
  panelWrapperClass?: string
  titleBarClass?: string
  titleClass?: string
  panelClass?: string
  overflowHidden?: boolean
}>

export function Modal(props: Props) {
  const { children, isOpen = false, setIsOpen, showClose, position = 'center' } = props

  return (
    <AnimatePresence>
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            asChild
            className="modal-overlay data-[state=open]:animate-overlayShow fixed inset-0 z-200 bg-[#111827]/20 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              exit={{ opacity: 0 }}
            />
          </Dialog.Overlay>

          {/* CENTER */}
          {position === 'center' ? (
            <Dialog.Content asChild>
              <motion.div className="modal-content pointer-events-none! fixed inset-0 z-200 grid min-h-full items-center justify-center overflow-y-auto py-10 focus:outline-none">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 16 }}
                  exit={{
                    scale: 0.8,
                    opacity: 0,
                    transition: { duration: 0.2 },
                  }}
                  className={cn(
                    props.panelClass,
                    { 'overflow-hidden!': props.overflowHidden },
                    'pointer-events-auto! relative mx-auto my-20 w-[430px] min-w-[200px] max-w-[90vw] rounded-[20px] bg-white shadow-xl',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                >
                  {showClose ? (
                    <Dialog.Close asChild>
                      <button
                        data-testid="modal-close-btn"
                        className="bg-gray-100 w-8 h-8 grid place-items-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500 absolute top-4 right-4"
                      >
                        <Icon icon="bi:x-lg" className="size-3" />
                      </button>
                    </Dialog.Close>
                  ) : null}
                  {children}
                </motion.div>
              </motion.div>
            </Dialog.Content>
          ) : null}

          {/* SIDE */}
          {position === 'side' ? (
            <Dialog.Content asChild>
              <motion.div
                className="modal-content pointer-events-none! fixed inset-0 z-200 grid min-h-full items-center justify-center overflow-y-auto py-10 focus:outline-none"
                initial={{ x: 600 }}
                animate={{ x: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 19,
                }}
                exit={{
                  x: 200,
                  opacity: 0,
                }}
              >
                <div
                  className={cn(
                    props.panelClass,
                    'pointer-events-auto! absolute right-4 mx-auto grid h-[calc(100dvh-32px)] w-[398px] min-w-[200px] max-w-[90vw] grid-rows-1 overflow-hidden rounded-lg bg-white text-left shadow-xl',
                    { 'grid-rows-[max-content_1fr]!': !!props.title },
                  )}
                  // onClick={(e) => {
                  //   e.stopPropagation();
                  // }}
                >
                  {/* TITLE BAR */}
                  {props.title ? (
                    <div
                      className={cn(
                        'border-b border-b-gray-100 flex items-center justify-between px-6 py-4',
                        props.titleBarClass,
                      )}
                    >
                      <Dialog.Title asChild>
                        <Text
                          weight="bold"
                          className="text-primary-900 font-semibold text-lg! font-bo leading-7"
                        >
                          {props.title}
                        </Text>
                      </Dialog.Title>

                      <button
                        className="text-xl bg-gray-100 w-8 h-8 grid place-items-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon icon="ic:round-close" />
                      </button>
                    </div>
                  ) : null}
                  <Dialog.Description asChild>
                    <div className={cn('overflow-y-auto py-6')}>{children}</div>
                  </Dialog.Description>
                </div>
              </motion.div>
            </Dialog.Content>
          ) : null}
        </Dialog.Portal>
      </Dialog.Root>
    </AnimatePresence>
  )
}
