'use client'
import type { FormFieldBlock, Form as FormType } from '@payloadcms/plugin-form-builder/types'

import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import RichText from '@/components/RichText'
import { Button } from '@/components/ui/button'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

import { fields } from './fields'
import { getClientSideURL } from '@/utilities/getURL'

export type FormBlockType = {
  blockName?: string
  blockType?: 'formBlock'
  enableIntro: boolean
  form: FormType
  introContent?: DefaultTypedEditorState
}

export const FormBlock: React.FC<
  {
    id?: string
  } & FormBlockType
> = (props) => {
  const {
    enableIntro,
    form: formFromProps,
    form: { id: formID, confirmationMessage, confirmationType, redirect, submitButtonLabel } = {},
    introContent,
  } = props

  const formMethods = useForm({
    defaultValues: formFromProps.fields,
  })
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = formMethods

  const [isLoading, setIsLoading] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState<boolean>()
  const [error, setError] = useState<{ message: string; status?: string } | undefined>()
  const router = useRouter()

  const onSubmit = useCallback(
    (data: FormFieldBlock[]) => {
      let loadingTimerID: ReturnType<typeof setTimeout>
      const submitForm = async () => {
        setError(undefined)

        const dataToSend = Object.entries(data).map(([name, value]) => ({
          field: name,
          value,
        }))

        // delay loading indicator by 1s
        loadingTimerID = setTimeout(() => {
          setIsLoading(true)
        }, 1000)

        try {
          const req = await fetch(`${getClientSideURL()}/api/form-submissions`, {
            body: JSON.stringify({
              form: formID,
              submissionData: dataToSend,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
            method: 'POST',
          })

          const res = await req.json()

          clearTimeout(loadingTimerID)

          if (req.status >= 400) {
            setIsLoading(false)

            setError({
              message: res.errors?.[0]?.message || 'Internal Server Error',
              status: res.status,
            })

            return
          }

          setIsLoading(false)
          setHasSubmitted(true)

          if (confirmationType === 'redirect' && redirect) {
            const { url } = redirect

            const redirectUrl = url

            if (redirectUrl) router.push(redirectUrl)
          }
        } catch (err) {
          console.warn(err)
          setIsLoading(false)
          setError({
            message: 'Something went wrong.',
          })
        }
      }

      void submitForm()
    },
    [router, formID, redirect, confirmationType],
  )

  return (
    <div className="mx-auto lg:max-w-[48rem]">
      {enableIntro && introContent && !hasSubmitted && (
        <RichText className="mb-10" data={introContent} enableGutter={false} />
      )}
      <FormProvider {...formMethods}>
        {!isLoading && hasSubmitted && confirmationType === 'message' && (
          <RichText data={confirmationMessage} />
        )}
        {isLoading && !hasSubmitted && (
          <p
            className="font-mono"
            style={{ fontSize: '1rem', letterSpacing: '0.08em', color: 'var(--muted-foreground)' }}
          >
            Sending&hellip;
          </p>
        )}
        {error && (
          <p role="alert" className="mb-6" style={{ color: 'var(--error)', fontSize: '1rem' }}>
            {error.status || '500'}: {error.message || ''}
          </p>
        )}
        {!hasSubmitted && (
          <form id={formID} onSubmit={handleSubmit(onSubmit)}>
            <div
              style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', marginBottom: '2.5rem' }}
            >
              {formFromProps?.fields?.map((field, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const Field: React.FC<any> = fields?.[field.blockType as keyof typeof fields]
                if (Field) {
                  return (
                    <div className="mb-8 last:mb-0" key={index}>
                      <Field
                        form={formFromProps}
                        {...field}
                        {...formMethods}
                        control={control}
                        errors={errors}
                        register={register}
                      />
                    </div>
                  )
                }
                return null
              })}
            </div>

            <Button form={formID} type="submit" variant="default" size="lg">
              {submitButtonLabel}
            </Button>
          </form>
        )}
      </FormProvider>
    </div>
  )
}
