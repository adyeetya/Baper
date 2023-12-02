import { db } from '@/src/db'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { pinecone } from '@/src/lib/pinecone'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

const f = createUploadthing()

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession()
      const user = await getUser()
      if (!user || !user.id) throw new Error('Unauthorized')

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: 'PROCESSING',
        },
      })
      try {
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`
        )
        // all this from langchain documents
        const blob = await response.blob()
        const loader = new PDFLoader(blob)
        const pageLevelDocs = await loader.load()
        const pagesAmt = pageLevelDocs.length

        // vectorize and index entire doc
        const pineconeIndex = pinecone.Index('baper')
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        })

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
        })

        await db.file.update({
          data: {
            uploadStatus: 'SUCCESS',
          },
          where: {
            id: createdFile.id,
          },
        })
      } catch (error) {
        console.log(error)

        await db.file.update({
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        })
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter