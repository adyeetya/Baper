'use client'
import { ChevronDown, ChevronUp, Loader2, Search, RotateCw } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { useToast } from './ui/use-toast'
import { Button } from './ui/button'
import { Input } from './ui/input'
// import { useResizeDetector } from 'react-resize-detector'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import SimpleBar from 'simplebar-react'
import PdfFullscreen from './PdfFullscreen'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

interface PdfRendererProps {
  url: string
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const { toast } = useToast()
  // const { width, ref } = useResizeDetector()
  // console.log(ref)
  // console.log(width)

  // using this instead of the useResizeDetector because that was not working its using ref state and useEffect
  // eventListener of resize on the parent div and updating the parentWidth state
  const parentRef = useRef<HTMLDivElement>(null)

  const [parentWidth, setParentWidth] = useState<number>(0)

  useEffect(() => {
    const updateParentWidth = () => {
      if (parentRef.current) {
        setParentWidth(parentRef.current.clientWidth)
      }
    }

    // Initial width update
    updateParentWidth()

    // Attach a resize event listener to update the width dynamically
    window.addEventListener('resize', updateParentWidth)

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateParentWidth)
    }
  }, [])

  const [numPages, setNumPages] = useState<number>()
  const [currPage, setCurrPage] = useState<number>(1)
  // console.log(currPage)
  const [scale, setScale] = useState<number>(1)
  const [rotation, setRotation] = useState<number>(0)

  const [renderedScale, setRenderedScale] = useState<number | null>(null)

  const isLoading = renderedScale !== scale
  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  })

  type TCustomPageValidator = z.infer<typeof CustomPageValidator>

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: '1',
    },
    resolver: zodResolver(CustomPageValidator),
  })

  const handlePageSubmit = ({ page }: TCustomPageValidator) => {
    setCurrPage(Number(page))
    setValue('page', String(page))
  }

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      {/* the top bar part where the buttons are */}
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between  px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currPage <= 1}
            onClick={() => {
              setCurrPage((prevPage) => (prevPage - 1 > 1 ? prevPage - 1 : 1))

              setValue('page', String(currPage - 1))
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register('page')}
              className={cn(
                'w-12 h-8 ',
                errors.page && 'focus-visible:ring-red-500'
              )}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(handlePageSubmit)()
                }
              }}
            />
            <p className="text-sm text-zinc-700 space-x-1">
              <span>/</span>
              <span>{numPages ?? 'x'}</span>
            </p>
          </div>
          <Button
            disabled={numPages === undefined || currPage === numPages}
            onClick={() => {
              setCurrPage((prevPage) =>
                prevPage + 1 > numPages! ? numPages! : prevPage + 1
              )
              setValue('page', String(currPage + 1))
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        {/* for zooming and rotating */}

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            aria-label="rotate 90 degrees"
            onClick={() => setRotation((prev) => prev + 90)}
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullscreen fileUrl={url} />
        </div>
      </div>

      {/* the actual pdf rendered with react-pdf */}
      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <div ref={parentRef}>
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
              file={url}
              className="max-h-full"
            >
              {isLoading && renderedScale ? (
                <Page
                  width={parentWidth || 1}
                  pageNumber={currPage}
                  scale={scale}
                  rotate={rotation}
                  key={'@'+renderedScale}
                />
              ) : null}
              <Page
              className={cn(isLoading? 'hidden':'')}
                width={parentWidth || 1}
                pageNumber={currPage}
                scale={scale}
                rotate={rotation}
                key={"@"+scale}
                loading={
                  <div className='flex justify-center'>
                    <Loader2 className='my-24 h-6 w-6 animate-spin'/>
                  </div>
                }
                onRenderSuccess={()=>{
                  setRenderedScale(scale)
                }}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  )
}

export default PdfRenderer
