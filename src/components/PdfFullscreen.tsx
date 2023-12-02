import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Expand, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import SimpleBar from 'simplebar-react'
import { useResizeDetector } from 'react-resize-detector'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'

interface PdfFullscreenProps {
  fileUrl: String
}

const PdfFullscreen = ({ fileUrl }: PdfFullscreenProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { toast } = useToast()
  const [numPages, setNumPages] = useState<number>()

  //   const parentRef = useRef<HTMLDivElement>(null)

  //   const [parentWidth, setParentWidth] = useState<number>(0)

  //   useEffect(() => {
  //     const updateParentWidth = () => {
  //       if (parentRef.current) {
  //         setParentWidth(parentRef.current.clientWidth)
  //       }
  //     }

  //     // Initial width update
  //     updateParentWidth()

  //     // Attach a resize event listener to update the width dynamically
  //     window.addEventListener('resize', updateParentWidth)

  //     // Clean up the event listener on component unmount
  //     return () => {
  //       window.removeEventListener('resize', updateParentWidth)
  //     }
  //   }, [])
  //   console.log('parent wid ' + parentWidth)

  const { width, ref } = useResizeDetector()
//   console.log(ref)
//   console.log(width)
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button variant="ghost" className="gap-1.5" aria-label="fullscreen">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar className="max-h-[calc(100vh-10rem)] mt-6" autoHide={false}>
          <div ref={ref}>
            <Document
              loading={
                <div className="flex justify-center">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
              onLoadError={() => {
                toast({
                  title: 'Error loading PDF',
                  description: 'Please try again later',
                  variant: 'destructive',
                })
              }}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              file={fileUrl}
              className="max-h-full"
            >
              {new Array(numPages).fill(0).map((_, i) => (
                <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        </SimpleBar>
      </DialogContent>
    </Dialog>
  )
}

export default PdfFullscreen
