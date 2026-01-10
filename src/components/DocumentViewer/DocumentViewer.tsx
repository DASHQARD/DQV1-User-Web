import { Modal, Button } from '@/components'
import { Icon } from '@/libs'

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
  return (
    <Modal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title={documentName}
      position="center"
      panelClass="!max-w-4xl !w-full !h-[90vh]"
      showClose
    >
      <div className="flex flex-col h-full p-6">
        {documentUrl ? (
          <>
            <div className="flex-1 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <iframe
                src={documentUrl}
                className="w-full h-full"
                title={documentName}
                style={{ minHeight: '600px' }}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  window.open(documentUrl, '_blank')
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
            <Button variant="outline" onClick={() => setIsOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
