import React from 'react'
import { createPortal } from 'react-dom'

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { CloseCircle, Danger, Icon as IconsaxIcon, TickCircle } from 'iconsax-reactjs'
import { nanoid } from 'nanoid'

import { ToastContextProvider, type ToastNotificationType } from '@/contexts'
import { cn } from '@/libs'
import { Icon } from '@/libs/icon'

export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [notificationList, setNotificationList] = React.useState<
    {
      message: string
      title?: string
      type: ToastNotificationType
      id: string
      ended?: boolean
      nodeRef?: React.RefObject<HTMLDivElement | null>
    }[]
  >([
    // {
    //  message: 'This is a success toast',
    //  title: 'Success',
    //  type: 'success',
    //  id: nanoid(),
    // },
    // { message: 'This is an error toast', type: 'error', id: nanoid() },
    // { message: 'This is an info toast', type: 'info', id: nanoid() },
  ])

  function removeNotification(id: string) {
    setNotificationList((list) => list.filter((item) => item.id !== id))
  }

  const addMessage = React.useCallback(
    (message: string, type: ToastNotificationType, title?: string) => {
      const id = nanoid()
      setNotificationList((list) => [
        ...list,
        { message, type, id, title, nodeRef: React.createRef() },
      ])

      setTimeout(() => removeNotification(id), 4000)
    },
    [setNotificationList],
  )

  const variantStyles: Record<ToastNotificationType, string> = {
    success: 'bg-success border border-success text-[#27303a]',
    error: 'bg-error-500 text-white',
    info: 'bg-neutral-grey-500 text-white',
  }

  const variantIcons: Record<ToastNotificationType, IconsaxIcon> = {
    success: TickCircle,
    error: CloseCircle,
    info: Danger,
  }

  const variantIconStyles: Record<ToastNotificationType, string> = {
    success: 'text-[#039855]',
    error: 'text-white',
    info: 'text-white',
  }

  const variantTextStyles: Record<ToastNotificationType, string> = {
    success: 'text-[#27303a]',
    error: 'text-white',
    info: 'text-white',
  }

  const variantMessageStyles: Record<ToastNotificationType, string> = {
    success: 'text-[#2f3f53]',
    error: 'text-white',
    info: 'text-white',
  }
  return (
    <>
      <ToastContextProvider addMessage={addMessage}>{children}</ToastContextProvider>
      {createPortal(
        <ul className="fixed z-[1000] grid gap-3 right-5 top-5 w-[340px]">
          <LayoutGroup>
            <AnimatePresence>
              {notificationList
                .filter((item) => !item.ended)
                .map(({ id, message, title, type }, index) => {
                  const VariantIcon = variantIcons[type]
                  return (
                    <motion.li
                      layout
                      initial={{ x: '150%' }}
                      animate={{ x: 0 }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        delay: index * 0.05,
                        stiffness: 150,
                        damping: 14,
                        type: 'spring',
                      }}
                      className={cn(
                        'grid grid-cols-[max-content_1fr_max-content_max-content] items-start gap-2',
                        'shadow p-4 py-[13px] rounded-[10px]',
                        variantStyles[type],
                      )}
                      key={id}
                    >
                      <VariantIcon
                        width={24}
                        height={24}
                        variant="Bold"
                        className={cn('mt-[1px]', variantIconStyles[type])}
                      />
                      <div className="flex flex-col gap-1">
                        {title ? (
                          <span
                            className={cn(
                              'text-base font-semibold leading-[1.375]',
                              variantTextStyles[type],
                            )}
                          >
                            {title}
                          </span>
                        ) : null}
                        <span
                          className={cn('inline-block my-0.5 text-sm', variantMessageStyles[type])}
                        >
                          {message}
                        </span>
                      </div>
                      <button
                        onClick={() => removeNotification(id)}
                        data-testid="close-toast"
                        type="button"
                      >
                        <Icon icon="hugeicons:cancel-01" className="text-lg text-gray-400" />
                      </button>
                    </motion.li>
                  )
                })}
            </AnimatePresence>
          </LayoutGroup>
        </ul>,
        document.body,
      )}
    </>
  )
}
