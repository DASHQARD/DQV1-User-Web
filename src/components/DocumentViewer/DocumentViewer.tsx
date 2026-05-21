import { useEffect, useMemo, useState } from 'react'
import { Modal, Button } from '@/components'
import { Icon } from '@/libs'
import { getCardFileUrl, isPdfFile } from '@/utils/cardDisplay'

type DocumentViewerProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  documentUrl: string | null
  documentName?: string
}

export function DocumentViewer({
  isOpen,
  setIsOpen,
  documentUrl,
  documentName = 'Document',
}: DocumentViewerProps) {
  const [loadFailed, setLoadFailed] = useState(false)

  const resolvedUrl = useMemo(() => getCardFileUrl(documentUrl ?? ''), [documentUrl])
  const isPdf = isPdfFile(documentUrl ?? undefined, documentName)
  const pdfSrc = resolvedUrl ? `${resolvedUrl}#view=FitH` : ''

  useEffect(() => {
    setLoadFailed(false)
  }, [resolvedUrl, isOpen])

  const handleOpenChange = (open: boolean) => {
    if (!open) setLoadFailed(false)
    setIsOpen(open)
  }

  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={handleOpenChange}
      title={documentName}
      position="center"
      panelClass="!w-[min(96vw,80rem)] !max-w-[min(96vw,80rem)] !h-[92vh] !max-h-[92vh] !my-4 flex flex-col overflow-hidden"
      overflowHidden
      showClose
    >
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-12">
        {resolvedUrl ? (
          <>
            <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              {loadFailed ? (
                <div className="flex h-full min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center text-gray-600">
                  <Icon icon="bi:file-earmark-x" className="text-5xl text-gray-400" />
                  <p className="font-medium">Preview is not available for this file.</p>
                  <p className="text-sm text-gray-500">Open the document in a new tab to view it.</p>
                </div>
              ) : isPdf ? (
                <embed
                  key={pdfSrc}
                  src={pdfSrc}
                  type="application/pdf"
                  title={documentName}
                  className="h-full min-h-[70vh] w-full"
                  onError={() => setLoadFailed(true)}
                />
              ) : (
                <iframe
                  key={resolvedUrl}
                  src={resolvedUrl}
                  className="h-full min-h-[70vh] w-full"
                  title={documentName}
                  onError={() => setLoadFailed(true)}
                />
              )}
            </div>
            <div className="mt-4 flex shrink-0 gap-3 justify-end border-t border-gray-200 pt-4">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  window.open(resolvedUrl, '_blank', 'noopener,noreferrer')
                }}
              >
                <Icon icon="bi:box-arrow-up-right" className="mr-2" />
                Open in New Tab
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icon icon="bi:file-earmark-x" className="text-6xl mb-4" />
            <p className="text-lg font-medium">Document not available</p>
            <p className="text-sm mt-2">The document could not be loaded.</p>
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
